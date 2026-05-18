"""
=============================================================================
ANALISIS PELUANG USAHA SMOOTHIES BAR DI KOTA BANDUNG
Menggunakan Metode Random Forest

Variabel Independen (Fitur):
    F1 - Kepadatan penduduk (jiwa/km2)              -> MySQL
    F2 - Skor kedekatan pusat keramaian (terbobot)  -> GeoJSON
    F3 - Tekanan kompetitor (jumlah dalam radius)   -> GeoJSON
    F4 - Aksesibilitas jalan (jarak ke arteri utama)-> GeoJSON

Output:
    hasil_analisis.json           — data per kecamatan untuk FE React
    data_fitur_kecamatan.csv      — tabel fitur + label (lampiran skripsi)

Instalasi dependensi:
    pip install geopandas shapely pandas numpy scikit-learn mysql-connector-python
=============================================================================
"""

import sys
import io
import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import mysql.connector
from mysql.connector import Error
import warnings
warnings.filterwarnings("ignore")


if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")


# =============================================================================
# KONFIGURASI — DB
# =============================================================================

DB_CONFIG = {
    "host"    : "127.0.0.1",
    "port"    : 3306,
    "database": "skripsi",
    "user"    : "root",
    "password": "",
}

TABEL_PENDUDUK   = "data_kecamatan"
KOLOM_KECAMATAN  = "kecamatan"
KOLOM_PENDUDUK   = "jumlah_penduduk"

# Path file GeoJSON
PATH_KECAMATAN   = "src/data/bandung-kecamatan.json"
PATH_KOMPETITOR  = "src/data/titik-kompetitor.json"
PATH_MALL        = "src/data/titik-mall.json"
PATH_SD          = "src/data/titik-sd.json"
PATH_SMA         = "src/data/titik-sma.json"
PATH_SMK         = "src/data/titik-smk.json"
PATH_SMP         = "src/data/titik-smp.json"
PATH_UNIVERSITAS = "src/data/titik-universitas.json"
PATH_PERKANTORAN = "src/data/titik-perkantoran.json"

# Path output
PATH_OUTPUT_JSON = "public/hasil_analisis.json"
PATH_OUTPUT_CSV  = "data_fitur_kecamatan.csv"

# Parameter model
RADIUS_POI_M  = 1000.0  # radius pencarian POI dalam meter
RADIUS_KOMP_M = 1000.0  # radius pencarian kompetitor dalam meter
N_ESTIMATORS  = 200     # jumlah pohon Random Forest
MAX_DEPTH     = 5       # kedalaman maksimum pohon
RANDOM_STATE  = 42


# =============================================================================
# BAGIAN 1: DATA PENDUDUK — MySQL
# =============================================================================

def muat_penduduk_mysql() -> pd.DataFrame:
    """
    Memuat data jumlah penduduk per kecamatan dari tabel MySQL.

    Struktur tabel minimal yang dibutuhkan:
        CREATE TABLE data_kecamatan (
            kecamatan        VARCHAR(100) NOT NULL,
            jumlah_penduduk  INT NOT NULL
        );

    Returns:
        DataFrame dengan kolom: kecamatan, jumlah_penduduk
    """

    query = f"""
        SELECT {KOLOM_KECAMATAN} AS kecamatan,
               {KOLOM_PENDUDUK}  AS jumlah_penduduk
        FROM   {TABEL_PENDUDUK}
        ORDER BY {KOLOM_KECAMATAN}
    """

    koneksi = None
    try:
        koneksi = mysql.connector.connect(**DB_CONFIG)
        if not koneksi.is_connected():
            raise ConnectionError("Koneksi MySQL gagal.")

        print(f"[OK] Terhubung ke MySQL  : {DB_CONFIG['database']}@{DB_CONFIG['host']}")
        df = pd.read_sql(query, koneksi)

        if df.empty:
            raise ValueError(
                f"Tabel '{TABEL_PENDUDUK}' kosong atau query tidak mengembalikan data. "
                "Periksa nama tabel dan kolom di DB_CONFIG."
            )

        print(f"[OK] Data penduduk dimuat: {len(df)} kecamatan")
        return df

    except Error as e:
        print(f"\n[ERR] Gagal koneksi MySQL: {e}")
        print("    Cek: host, port, database, user, password di DB_CONFIG.")
        raise

    finally:
        if koneksi and koneksi.is_connected():
            koneksi.close()


# =============================================================================
# BAGIAN 2: MEMUAT DATA SPASIAL (GeoJSON)
# =============================================================================

def muat_data_spasial() -> tuple[gpd.GeoDataFrame, gpd.GeoDataFrame, gpd.GeoDataFrame]:
    """
    Memuat semua file GeoJSON ke dalam GeoDataFrame dan memproyeksikan
    ke sistem koordinat UTM Zone 48S (EPSG:32748) agar kalkulasi jarak
    menghasilkan satuan meter yang akurat untuk wilayah Jawa Barat.

    Returns:
        gdf_kec  : batas wilayah kecamatan
        gdf_poi  : gabungan titik pusat keramaian (mall + sekolah + kampus)
        gdf_komp : titik kompetitor
    """

    # Batas kecamatan
    gdf_kec = gpd.read_file(PATH_KECAMATAN).to_crs(epsg=32748)

    # Titik POI — gabungkan semua lapisan dengan label kategori
    poi_layers = []
    for path, kategori in [
        (PATH_MALL,        "Mall"),
        (PATH_SD,          "SD"),
        (PATH_SMA,         "SMA"),
        (PATH_SMK,         "SMK"),
        (PATH_SMP,         "SMP"),
        (PATH_UNIVERSITAS, "Universitas"),
        (PATH_PERKANTORAN, "Perkantoran"),
    ]:
        tmp = gpd.read_file(path)
        tmp["kategori"] = kategori
        poi_layers.append(tmp)

    gdf_poi = gpd.GeoDataFrame(
        pd.concat(poi_layers, ignore_index=True),
        geometry="geometry"
    ).to_crs(epsg=32748)

    # Titik kompetitor
    gdf_komp = gpd.read_file(PATH_KOMPETITOR).to_crs(epsg=32748)

    print(f"[OK] Kecamatan dimuat   : {len(gdf_kec)} wilayah")
    print(f"[OK] Titik POI dimuat   : {len(gdf_poi)} titik")
    print(f"[OK] Kompetitor dimuat  : {len(gdf_komp)} titik")

    return gdf_kec, gdf_poi, gdf_komp


# =============================================================================
# BAGIAN 3 (REVISI): REKAYASA FITUR — per kecamatan (bukan radius centroid)
# =============================================================================

def hitung_fitur(
    gdf_kec  : gpd.GeoDataFrame,
    gdf_poi  : gpd.GeoDataFrame,
    gdf_komp : gpd.GeoDataFrame,
    df_pddk  : pd.DataFrame,
) -> pd.DataFrame:
    """
    Menghitung 4 fitur utama untuk setiap kecamatan.

    REVISI METODOLOGI (sesuai masukan):
        F2 — Skor POI terbobot: titik POI dihitung jika berada di DALAM
             polygon kecamatan (bukan radius dari centroid). Menggunakan
             geopandas.sjoin dengan predicate='within'.
        F3 — Jumlah kompetitor: sama seperti F2, dihitung per wilayah
             polygon kecamatan masing-masing.
        F4 — Jarak ke pusat kota: tetap menggunakan jarak Euclidean dari
             centroid kecamatan ke titik referensi pusat Kota Bandung
             (proxy aksesibilitas jalan utama).

    Catatan skripsi:
        Pendekatan 'per kecamatan' lebih sesuai untuk analisis agregat
        wilayah karena menghilangkan bias buffer yang tumpang tindih antar
        kecamatan bertetangga. Setiap POI dan kompetitor dihitung tepat
        satu kali untuk kecamatan tempat ia berada.
    """

    BOBOT_POI = {
        "Mall"       : 3.0,
        "Universitas": 2.5,
        "Perkantoran": 2.0,
        "SMA"        : 1.5,
        "SMK"        : 1.5,
        "SMP"        : 1.0,
        "SD"         : 0.5,
    }
    PUSAT_KOTA = Point(789_700, 9_234_200)  # UTM 48S — approx. Alun-alun Bandung

    # -------------------------------------------------------------------------
    # Spatial join sekali di luar loop — jauh lebih efisien daripada
    # filter per-baris di dalam loop
    # -------------------------------------------------------------------------

    # Join POI ke kecamatan (titik DALAM polygon)
    poi_per_kec = gpd.sjoin(
        gdf_poi,
        gdf_kec[["geometry"]].reset_index().rename(columns={"index": "idx_kec"}),
        how="left",
        predicate="within",
    )

    # Join kompetitor ke kecamatan
    komp_per_kec = gpd.sjoin(
        gdf_komp,
        gdf_kec[["geometry"]].reset_index().rename(columns={"index": "idx_kec"}),
        how="left",
        predicate="within",
    )

    records = []

    for idx, kec in gdf_kec.iterrows():
        # Deteksi nama kolom kecamatan
        nama = (
            kec.get("nama_kecamatan")
            or kec.get("KECAMATAN")
            or kec.get("name")
            or kec.get("NAMOBJ")
            or kec.get("kecamatan")
            or "—"
        )
        geom     = kec.geometry
        centroid = geom.centroid          # UTM 48S
        luas_km2 = geom.area / 1_000_000

        # F1: Kepadatan penduduk
        baris       = df_pddk[df_pddk["kecamatan"].str.lower() == nama.lower()]
        jumlah_pddk = float(baris["jumlah_penduduk"].values[0]) if not baris.empty else 0.0
        kepadatan   = jumlah_pddk / luas_km2 if luas_km2 > 0 else 0.0

        # F2: Skor POI terbobot — titik DALAM polygon kecamatan ini
        poi_kec  = poi_per_kec[poi_per_kec["idx_kec"] == idx]
        skor_poi = sum(BOBOT_POI.get(r["kategori"], 1.0) for _, r in poi_kec.iterrows())

        # F3: Jumlah kompetitor — titik DALAM polygon kecamatan ini
        komp_kec          = komp_per_kec[komp_per_kec["idx_kec"] == idx]
        jumlah_kompetitor = int(komp_kec.shape[0])

        # F4: Jarak ke pusat kota (meter) — tetap dari centroid
        jarak_jalan_m = centroid.distance(PUSAT_KOTA)

        # Centroid WGS84 untuk FE React Leaflet
        centroid_gdf   = gpd.GeoSeries([centroid], crs="EPSG:32748").to_crs("EPSG:4326")
        centroid_wgs84 = centroid_gdf.iloc[0]
        centroid_lat   = round(centroid_wgs84.y, 6)
        centroid_lng   = round(centroid_wgs84.x, 6)

        records.append({
            "kecamatan"       : nama,
            "luas_km2"        : round(luas_km2, 3),
            "jumlah_penduduk" : jumlah_pddk,
            "F1_kepadatan"    : round(kepadatan, 1),
            "F2_skor_poi"     : round(skor_poi, 2),
            "F3_kompetitor"   : jumlah_kompetitor,
            "F4_jarak_jalan_m": round(jarak_jalan_m, 1),
            "centroid_lat"    : centroid_lat,
            "centroid_lng"    : centroid_lng,
            "geometry"        : geom,
        })

    df = pd.DataFrame(records)
    print(f"\n[OK] Fitur dihitung untuk {len(df)} kecamatan (metode: per polygon):")
    print(df[["kecamatan", "F1_kepadatan", "F2_skor_poi",
              "F3_kompetitor", "F4_jarak_jalan_m",
              "centroid_lat", "centroid_lng"]].to_string(index=False))
    return df


# =============================================================================
# BAGIAN 4: LABELING HEURISTIK
# =============================================================================

def buat_label_heuristik(df: pd.DataFrame) -> pd.DataFrame:
    """
    Membuat label kelas peluang usaha menggunakan pendekatan heuristik
    berbasis domain knowledge (weakly supervised learning).

    Setiap kecamatan mendapat skor komposit dari normalisasi min-max
    keempat fitur, dengan bobot pakar:
        F1 kepadatan    30%
        F2 skor POI     35%
        F3 kompetitor   20%  (invers — lebih sedikit = lebih baik)
        F4 jarak jalan  15%  (invers — lebih dekat = lebih baik)

    Kelas ditentukan berdasarkan kuantil 33 dan 66:
        Tinggi  : skor komposit >= Q66
        Sedang  : Q33 <= skor < Q66
        Rendah  : skor < Q33

    Catatan skripsi:
        Validasi label disarankan melalui expert review dan cross-check
        dengan survei lapangan pada sampel kecamatan representatif.
    """

    df = df.copy()

    # Normalisasi min-max — fitur positif (lebih besar = lebih baik)
    for col in ["F1_kepadatan", "F2_skor_poi"]:
        mn, mx = df[col].min(), df[col].max()
        df[f"{col}_norm"] = (df[col] - mn) / (mx - mn + 1e-9)

    # Normalisasi invers — fitur negatif (lebih kecil = lebih baik)
    for col in ["F3_kompetitor", "F4_jarak_jalan_m"]:
        mn, mx = df[col].min(), df[col].max()
        df[f"{col}_norm"] = 1 - (df[col] - mn) / (mx - mn + 1e-9)

    df["skor_komposit"] = (
        0.30 * df["F1_kepadatan_norm"]      +
        0.35 * df["F2_skor_poi_norm"]       +
        0.20 * df["F3_kompetitor_norm"]     +
        0.15 * df["F4_jarak_jalan_m_norm"]
    )

    q33 = df["skor_komposit"].quantile(0.33)
    q66 = df["skor_komposit"].quantile(0.66)

    df["label_peluang"] = df["skor_komposit"].apply(
        lambda s: "Tinggi" if s >= q66 else ("Sedang" if s >= q33 else "Rendah")
    )

    print(f"\n[OK] Distribusi label (Q33={q33:.3f}, Q66={q66:.3f}):")
    print(df["label_peluang"].value_counts().to_string())
    return df


# =============================================================================
# BAGIAN 5: PELATIHAN RANDOM FOREST
# =============================================================================

def latih_random_forest(df: pd.DataFrame) -> tuple:
    """
    Melatih Random Forest Classifier.

    Konfigurasi model:
        Algoritma       : Random Forest (Breiman, 2001)
        n_estimators    : 200 pohon
        max_depth       : 5 (mencegah overfitting pada data kecil)
        min_samples_leaf: 2
        class_weight    : balanced (mengatasi ketidakseimbangan kelas)
        random_state    : 42 (reproduktibilitas)

    Catatan:
        centroid_lat dan centroid_lng TIDAK dimasukkan sebagai fitur RF.
        Keduanya hanya digunakan untuk keperluan visualisasi di FE.

    Returns:
        model, le (LabelEncoder), X_test, y_test, fitur_cols
    """

    fitur_cols = ["F1_kepadatan", "F2_skor_poi", "F3_kompetitor", "F4_jarak_jalan_m"]
    X  = df[fitur_cols].values
    le = LabelEncoder()
    y  = le.fit_transform(df["label_peluang"])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators    = N_ESTIMATORS,
        max_depth       = MAX_DEPTH,
        min_samples_leaf= 2,
        random_state    = RANDOM_STATE,
        class_weight    = "balanced",
    )
    model.fit(X_train, y_train)

    # Evaluasi
    y_pred = model.predict(X_test)
    print("\n[OK] Evaluasi Model Random Forest:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Feature importance
    importance = pd.Series(model.feature_importances_, index=fitur_cols)
    print("[OK] Feature Importance:")
    print(importance.sort_values(ascending=False).to_string())

    return model, le, X_test, y_test, fitur_cols


# =============================================================================
# BAGIAN 6: GENERATE RINGKASAN ANALISIS PER KECAMATAN
# =============================================================================

def generate_deskripsi(row: pd.Series, model, le, fitur_cols: list) -> dict:
    """
    Menghasilkan ringkasan analisis per kecamatan berdasarkan prediksi
    model Random Forest.

    Perubahan dari versi sebelumnya (sesuai masukan dosen):
        - Ditambahkan field 'level_lokasi' sebagai label rekomendasi ringkas:
              Tinggi -> "Lokasi Utama"
              Sedang -> "Lokasi Alternatif"
              Rendah -> "Lokasi Cadangan"
          Field ini digunakan FE untuk menentukan warna marker peta
          (hijau = Utama, kuning = Alternatif, merah = Cadangan).
        - 'kondisi_umum' dan 'analisis_pasar' digabung menjadi
          'poin_analisis' (list of str) agar tampilan lebih ringkas.
        - 'rekomendasi' dipersingkat menjadi satu kalimat tindak lanjut.
        - Ditambahkan 'centroid_lat' dan 'centroid_lng' (WGS84) untuk
          visualisasi marker centroid di React Leaflet tanpa kalkulasi ulang.

    Returns:
        dict dengan key:
            kecamatan, kelas, level_lokasi, kepercayaan_persen,
            kepadatan_jiwa_km2, skor_poi, jumlah_kompetitor, jarak_jalan_km,
            poin_analisis (list), analisis_kompetitor (str), rekomendasi (str),
            centroid_lat (float), centroid_lng (float)
    """

    X_row     = np.array([[row["F1_kepadatan"], row["F2_skor_poi"],
                           row["F3_kompetitor"], row["F4_jarak_jalan_m"]]])
    kelas_idx = model.predict(X_row)[0]
    proba     = model.predict_proba(X_row)[0]
    kelas     = le.inverse_transform([kelas_idx])[0]
    conf      = round(max(proba) * 100, 1)

    nama      = row["kecamatan"]
    kepadatan = row["F1_kepadatan"]
    skor_poi  = row["F2_skor_poi"]
    komp      = int(row["F3_kompetitor"])
    jarak_jl  = round(row["F4_jarak_jalan_m"] / 1000, 1)

    # -- Level lokasi berdasarkan kelas ---------------------------------------
    LEVEL_MAP = {
        "Tinggi": "Lokasi Utama",
        "Sedang": "Lokasi Alternatif",
        "Rendah": "Lokasi Cadangan",
    }
    level_lokasi = LEVEL_MAP[kelas]

    # -- Poin analisis --------------------------------------------------------
    if kelas == "Tinggi":
        poin_analisis = [
            f"Peluang usaha tinggi — kepercayaan model {conf}%",
            f"Kepadatan penduduk {kepadatan:,.0f} jiwa/km2, basis konsumen besar",
            f"Skor POI {skor_poi:.1f}, dekat mall, kampus, dan sekolah menengah",
            f"Jarak ke jalan arteri utama +-{jarak_jl} km, akses konsumen mudah",
        ]
        analisis_kompetitor = (
            f"{komp} kompetitor dalam radius 1 km — persaingan wajar, permintaan terbukti."
            if komp <= 3 else
            f"{komp} kompetitor dalam radius 1 km — diferensiasi produk diperlukan."
        )
        rekomendasi = (
            "Prioritaskan lokasi di koridor pejalan kaki tinggi dan perkuat identitas merek."
        )

    elif kelas == "Sedang":
        poin_analisis = [
            f"Peluang usaha moderat — kepercayaan model {conf}%",
            f"Kepadatan penduduk {kepadatan:,.0f} jiwa/km2, potensi pasar cukup",
            f"Skor POI {skor_poi:.1f}, beberapa titik aktivitas tersedia",
            f"Jarak ke jalan arteri utama +-{jarak_jl} km, perlu evaluasi lapangan",
        ]
        analisis_kompetitor = (
            f"{komp} kompetitor dalam radius 1 km — ruang pasar masih terbuka."
            if komp <= 2 else
            f"{komp} kompetitor dalam radius 1 km — butuh strategi diferensiasi kuat."
        )
        rekomendasi = (
            "Fokus pada subwilayah dengan konsentrasi sekolah menengah atau kampus."
        )

    else:  # Rendah
        poin_analisis = [
            f"Peluang usaha rendah — kepercayaan model {conf}%",
            f"Kepadatan penduduk {kepadatan:,.0f} jiwa/km2, basis konsumen terbatas",
            f"Skor POI {skor_poi:.1f}, aktivitas pembangkit konsumen minim",
            f"Jarak ke jalan arteri utama +-{jarak_jl} km, lalu lintas spontan rendah",
        ]
        analisis_kompetitor = (
            f"{komp} kompetitor dalam radius 1 km — konsisten dengan permintaan rendah."
            if komp <= 1 else
            f"{komp} kompetitor dalam radius 1 km — pasar terlayani, volume terbatas."
        )
        rekomendasi = (
            "Tidak disarankan sebagai prioritas; lengkapi dengan survei primer sebelum investasi."
        )

    return {
        "kecamatan"          : nama,
        "kelas"              : kelas,
        "level_lokasi"       : level_lokasi,
        "kepercayaan_persen" : conf,
        "kepadatan_jiwa_km2" : kepadatan,
        "skor_poi"           : skor_poi,
        "jumlah_kompetitor"  : komp,
        "jarak_jalan_km"     : jarak_jl,
        "poin_analisis"      : poin_analisis,
        "analisis_kompetitor": analisis_kompetitor,
        "rekomendasi"        : rekomendasi,
        "centroid_lat"       : float(row["centroid_lat"]),  # WGS84 lat untuk FE
        "centroid_lng"       : float(row["centroid_lng"]),  # WGS84 lng untuk FE
    }


# =============================================================================
# BAGIAN 7: PIPELINE UTAMA
# =============================================================================

def jalankan_pipeline():
    """
    Menjalankan seluruh pipeline:
        1. Muat data penduduk dari MySQL
        2. Muat data spasial dari GeoJSON
        3. Hitung fitur per kecamatan (+ centroid WGS84)
        4. Buat label heuristik
        5. Latih Random Forest
        6. Generate ringkasan analisis
        7. Simpan output JSON dan CSV
    """

    print("=" * 60)
    print("  ANALISIS PELUANG USAHA SMOOTHIES BAR — KOTA BANDUNG")
    print("=" * 60 + "\n")

    # 1. Data penduduk dari MySQL
    df_pddk = muat_penduduk_mysql()

    # 2. Data spasial dari GeoJSON
    gdf_kec, gdf_poi, gdf_komp = muat_data_spasial()

    # 3. Hitung fitur
    df_fitur = hitung_fitur(gdf_kec, gdf_poi, gdf_komp, df_pddk)

    # 4. Label heuristik
    df_labeled = buat_label_heuristik(df_fitur)

    # 5. Latih model
    model, le, X_test, y_test, fitur_cols = latih_random_forest(df_labeled)

    # 6. Generate ringkasan — diurutkan dari skor komposit tertinggi
    print("\n[OK] Membuat ringkasan analisis per kecamatan...")
    df_sorted = df_labeled.sort_values("skor_komposit", ascending=False)
    hasil_json = [
        generate_deskripsi(row, model, le, fitur_cols)
        for _, row in df_sorted.iterrows()
    ]

    # 7a. Simpan ke JSON (untuk FE React)
    import json
    with open(PATH_OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(hasil_json, f, ensure_ascii=False, indent=2)
    print(f"[OK] JSON tersimpan       : {PATH_OUTPUT_JSON}")

    # 7b. Simpan tabel fitur ke .csv (lampiran skripsi)
    cols_csv = [
        "kecamatan", "luas_km2", "jumlah_penduduk",
        "F1_kepadatan", "F2_skor_poi", "F3_kompetitor",
        "F4_jarak_jalan_m", "skor_komposit", "label_peluang",
        "centroid_lat", "centroid_lng",
    ]
    df_labeled[cols_csv].to_csv(PATH_OUTPUT_CSV, index=False, encoding="utf-8-sig")
    print(f"[OK] Tabel fitur tersimpan: {PATH_OUTPUT_CSV}")

    # Preview kecamatan peringkat 1
    top1 = hasil_json[0]
    print("\n" + "=" * 60)
    print(f"PREVIEW — {top1['kecamatan'].upper()}")
    print(f"Level   : {top1['level_lokasi']}  |  Kelas: {top1['kelas']}")
    print(f"Centroid: {top1['centroid_lat']}, {top1['centroid_lng']}")
    print("=" * 60)
    for poin in top1["poin_analisis"]:
        print(f"  - {poin}")
    print(f"  Kompetitor : {top1['analisis_kompetitor']}")
    print(f"  Rekomendasi: {top1['rekomendasi']}")

    return df_labeled, model, le


# =============================================================================
# ENTRY POINT
# =============================================================================

if __name__ == "__main__":
    import argparse
    import os

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--kecamatan",
        type=str,
        default=None,
        help="Nama kecamatan spesifik (opsional). Jika kosong, semua kecamatan diproses.",
    )
    args = parser.parse_args()

    # Selalu jalankan pipeline penuh — JSON ditulis ulang
    jalankan_pipeline()

    # Jika dipanggil dengan --kecamatan, print hasil kecamatan tersebut ke stdout
    if args.kecamatan:
        import json
        if os.path.exists(PATH_OUTPUT_JSON):
            with open(PATH_OUTPUT_JSON, encoding="utf-8") as f:
                data = json.load(f)
            found = next(
                (d for d in data if d["kecamatan"].lower() == args.kecamatan.lower()),
                None,
            )
            if found:
                print(json.dumps(found, ensure_ascii=False, indent=2))
            else:
                print(f"[WARN] Kecamatan '{args.kecamatan}' tidak ditemukan.")