"""
=============================================================================
ANALISIS PELUANG USAHA SMOOTHIES BAR DI KOTA BANDUNG
Menggunakan Metode Random Forest dengan Output Deskripsi Naratif
Versi lengkap dengan koneksi MySQL / MariaDB

Variabel Independen (Fitur):
    F1 - Kepadatan penduduk (jiwa/km²)              → dari MySQL
    F2 - Skor kedekatan pusat keramaian (terbobot)  → dari GeoJSON
    F3 - Tekanan kompetitor (jumlah dalam radius)   → dari GeoJSON
    F4 - Aksesibilitas jalan (jarak ke arteri utama)→ dari GeoJSON

Output:
    hasil_analisis_smoothies.txt  — deskripsi naratif per kecamatan
    data_fitur_kecamatan.csv      — tabel fitur + label (lampiran skripsi)

Instalasi dependensi:
    pip install geopandas shapely pandas numpy scikit-learn mysql-connector-python
=============================================================================
"""

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


# =============================================================================
# KONFIGURASI — SESUAIKAN BAGIAN INI
# =============================================================================

DB_CONFIG = {
    "host"    : "mainline.proxy.rlwy.net",
    "port"    : 43277,
    "database": "railway",
    "user"    : "root",
    "password": "phsqybAnMApgQDlguPZZhpuKelqRVznf",
}

# Nama tabel dan kolom data penduduk di database
TABEL_PENDUDUK   = "data_kecamatan"
KOLOM_KECAMATAN  = "kecamatan"
KOLOM_PENDUDUK   = "jumlah_penduduk"

# Path file GeoJSON
PATH_KECAMATAN  = "src/data/bandung-kecamatan.json"
PATH_KOMPETITOR = "src/data/titik-kompetitor.json"
PATH_MALL       = "src/data/titik-mall.json"
PATH_SD         = "src/data/titik-sd.json"
PATH_SMA        = "src/data/titik-sma.json"
PATH_SMK        = "src/data/titik-smk.json"
PATH_SMP        = "src/data/titik-smp.json"
PATH_UNIVERSITAS= "src/data/titik-universitas.json"

# Path output
PATH_OUTPUT_JSON = "public/hasil_analisis.json"
PATH_OUTPUT_CSV  = "data_fitur_kecamatan.csv"

# Parameter model
RADIUS_POI_M    = 1000.0   # radius pencarian POI dalam meter
RADIUS_KOMP_M   = 1000.0   # radius pencarian kompetitor dalam meter
N_ESTIMATORS    = 200      # jumlah pohon Random Forest
MAX_DEPTH       = 5        # kedalaman maksimum pohon
RANDOM_STATE    = 42


# =============================================================================
# BAGIAN 1: MEMUAT DATA PENDUDUK DARI MySQL
# =============================================================================

def muat_penduduk_mysql() -> pd.DataFrame:
    """
    Memuat data jumlah penduduk per kecamatan dari tabel MySQL.

    Struktur tabel minimal yang dibutuhkan:
        CREATE TABLE penduduk_kecamatan (
            kecamatan        VARCHAR(100) NOT NULL,
            jumlah_penduduk  INT NOT NULL,
            tahun            YEAR          -- opsional, jika multitahun
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
# BAGIAN 3: REKAYASA FITUR (FEATURE ENGINEERING)
# =============================================================================

def hitung_fitur(
    gdf_kec   : gpd.GeoDataFrame,
    gdf_poi   : gpd.GeoDataFrame,
    gdf_komp  : gpd.GeoDataFrame,
    df_pddk   : pd.DataFrame,
) -> pd.DataFrame:
    """
    Menghitung 4 fitur utama untuk setiap kecamatan.

    Catatan metodologi:
        F1 — Kepadatan penduduk: jumlah penduduk dibagi luas wilayah (km²).
             Sumber data: MySQL (BPS Kota Bandung).
        F2 — Skor POI terbobot: akumulasi bobot titik keramaian dalam
             radius RADIUS_POI_M dari centroid kecamatan. Bobot lebih
             tinggi diberikan pada fasilitas dengan daya beli lebih besar
             (Mall=3.0, Universitas=2.5, SMA/SMK=1.5, SMP=1.0, SD=0.5).
        F3 — Jumlah kompetitor: hitungan titik usaha sejenis dalam
             radius RADIUS_KOMP_M dari centroid kecamatan.
        F4 — Jarak ke pusat kota (proxy aksesibilitas jalan):
             jarak Euclidean dari centroid ke titik referensi pusat
             Kota Bandung (UTM approx. alun-alun). Idealnya diganti
             dengan data jaringan jalan OSM untuk akurasi lebih tinggi.
    """

    BOBOT_POI = {
        "Mall"       : 3.0,
        "Universitas": 2.5,
        "SMA"        : 1.5,
        "SMK"        : 1.5,
        "SMP"        : 1.0,
        "SD"         : 0.5,
    }
    PUSAT_KOTA = Point(793_000, 9_228_500)  # UTM 48S — approx. Alun-alun Bandung

    records = []

    for _, kec in gdf_kec.iterrows():
        # Deteksi nama kolom kecamatan secara fleksibel
        nama = (
            kec.get("nama_kecamatan")
            or kec.get("KECAMATAN")
            or kec.get("name")
            or kec.get("NAMOBJ")
            or kec.get("kecamatan")
            or "—"
        )
        geom     = kec.geometry
        centroid = geom.centroid
        luas_km2 = geom.area / 1_000_000

        # F1: Kepadatan penduduk
        baris = df_pddk[df_pddk["kecamatan"].str.lower() == nama.lower()]
        jumlah_pddk = float(baris["jumlah_penduduk"].values[0]) if not baris.empty else 0.0
        kepadatan   = jumlah_pddk / luas_km2 if luas_km2 > 0 else 0.0

        # F2: Skor POI terbobot
        poi_dalam = gdf_poi[gdf_poi.geometry.within(centroid.buffer(RADIUS_POI_M))]
        skor_poi  = sum(BOBOT_POI.get(r["kategori"], 1.0) for _, r in poi_dalam.iterrows())

        # F3: Jumlah kompetitor
        komp_dalam       = gdf_komp[gdf_komp.geometry.within(centroid.buffer(RADIUS_KOMP_M))]
        jumlah_kompetitor = int(komp_dalam.shape[0])

        # F4: Jarak ke pusat kota (meter)
        jarak_jalan_m = centroid.distance(PUSAT_KOTA)

        records.append({
            "kecamatan"       : nama,
            "luas_km2"        : round(luas_km2, 3),
            "jumlah_penduduk" : jumlah_pddk,
            "F1_kepadatan"    : round(kepadatan, 1),
            "F2_skor_poi"     : round(skor_poi, 2),
            "F3_kompetitor"   : jumlah_kompetitor,
            "F4_jarak_jalan_m": round(jarak_jalan_m, 1),
            "geometry"        : geom,
        })

    df = pd.DataFrame(records)
    print(f"\n[OK] Fitur dihitung untuk {len(df)} kecamatan:")
    print(df[["kecamatan", "F1_kepadatan", "F2_skor_poi",
              "F3_kompetitor", "F4_jarak_jalan_m"]].to_string(index=False))
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
        Tinggi  : skor komposit ≥ Q66
        Sedang  : Q33 ≤ skor < Q66
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
        Algoritma      : Random Forest (Breiman, 2001)
        n_estimators   : 200 pohon
        max_depth      : 5 (mencegah overfitting pada data kecil)
        min_samples_leaf: 2
        class_weight   : balanced (mengatasi ketidakseimbangan kelas)
        random_state   : 42 (reproduktibilitas)

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
# BAGIAN 6: GENERATE DESKRIPSI NARATIF
# =============================================================================

def generate_deskripsi(row: pd.Series, model, le, fitur_cols: list) -> str:
    """
    Menghasilkan deskripsi naratif akademik per kecamatan berdasarkan
    prediksi model Random Forest dan nilai fitur aktual.

    Struktur deskripsi (4 paragraf):
        1. Kondisi umum — kelas peluang dan kepercayaan model
        2. Analisis pasar — kepadatan penduduk dan skor POI
        3. Analisis kompetitor — jumlah kompetitor dan interpretasinya
        4. Rekomendasi strategis — kesimpulan dan saran tindak lanjut
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

    # ── Narasi kelas TINGGI ──────────────────────────────────────────────────
    if kelas == "Tinggi":
        kondisi_umum = (
            f"Kecamatan {nama} menunjukkan peluang usaha yang tinggi "
            f"untuk pendirian smoothies bar berdasarkan analisis model "
            f"Random Forest dengan tingkat kepercayaan {conf}%."
        )
        analisis_pasar = (
            f"Wilayah ini memiliki kepadatan penduduk sebesar "
            f"{kepadatan:,.0f} jiwa/km², yang mengindikasikan ketersediaan "
            f"basis konsumen yang memadai. Skor kedekatan terhadap pusat "
            f"keramaian tercatat sebesar {skor_poi:.1f}, mencerminkan "
            f"aksesibilitas yang baik terhadap titik-titik pembangkit "
            f"aktivitas seperti mall, kampus, dan sekolah menengah dalam "
            f"radius 1 km dari centroid wilayah."
        )
        analisis_kompetitor = (
            f"Teridentifikasi {komp} usaha kompetitor sejenis dalam radius 1 km. "
        ) + (
            "Tingkat persaingan ini tergolong wajar dan mengindikasikan "
            "adanya permintaan pasar yang sudah terbukti di kawasan ini."
            if komp <= 3 else
            "Meskipun persaingan cukup ketat, kepadatan konsumen di wilayah "
            "ini berpotensi mengakomodasi pemain baru dengan diferensiasi "
            "produk yang tepat."
        )
        rekomendasi = (
            f"Berdasarkan hasil analisis, Kecamatan {nama} direkomendasikan "
            f"sebagai prioritas pertama dalam penetapan lokasi usaha. "
            f"Jarak rata-rata ke jaringan jalan utama sebesar {jarak_jl} km "
            f"mendukung kemudahan akses bagi konsumen. Strategi yang "
            f"disarankan mencakup pemilihan lokasi di koridor jalan dengan "
            f"intensitas pejalan kaki tinggi, serta penguatan identitas "
            f"merek untuk membedakan diri dari kompetitor yang ada."
        )

    # ── Narasi kelas SEDANG ──────────────────────────────────────────────────
    elif kelas == "Sedang":
        kondisi_umum = (
            f"Kecamatan {nama} memiliki peluang usaha yang moderat "
            f"untuk pendirian smoothies bar berdasarkan model Random Forest "
            f"dengan tingkat kepercayaan {conf}%."
        )
        analisis_pasar = (
            f"Kepadatan penduduk di wilayah ini sebesar {kepadatan:,.0f} "
            f"jiwa/km² menunjukkan potensi pasar yang ada, namun belum "
            f"setinggi kecamatan dengan peringkat tertinggi. Skor POI "
            f"sebesar {skor_poi:.1f} mengindikasikan kehadiran beberapa "
            f"titik pembangkit aktivitas yang dapat menjadi sumber lalu "
            f"lintas konsumen."
        )
        analisis_kompetitor = (
            f"Terdapat {komp} kompetitor dalam radius 1 km dari pusat kecamatan. "
        ) + (
            "Ruang pasar masih terbuka karena tingkat persaingan yang belum jenuh."
            if komp <= 2 else
            "Pelaku usaha baru perlu mempertimbangkan strategi diferensiasi "
            "yang kuat agar dapat bersaing secara efektif."
        )
        rekomendasi = (
            f"Kecamatan {nama} dapat dipertimbangkan sebagai pilihan alternatif "
            f"apabila lokasi prioritas pertama tidak tersedia. Aksesibilitas "
            f"jalan dengan jarak rata-rata {jarak_jl} km ke arteri utama perlu "
            f"dievaluasi lebih lanjut melalui survei lapangan. Disarankan untuk "
            f"melakukan studi kelayakan mikro pada subwilayah dengan konsentrasi "
            f"sekolah menengah atau perguruan tinggi yang lebih tinggi."
        )

    # ── Narasi kelas RENDAH ──────────────────────────────────────────────────
    else:
        kondisi_umum = (
            f"Berdasarkan model Random Forest, Kecamatan {nama} tergolong "
            f"memiliki peluang usaha yang rendah untuk pendirian smoothies bar, "
            f"dengan tingkat kepercayaan prediksi sebesar {conf}%."
        )
        analisis_pasar = (
            f"Kepadatan penduduk sebesar {kepadatan:,.0f} jiwa/km² dan skor "
            f"kedekatan POI sebesar {skor_poi:.1f} mengindikasikan basis konsumen "
            f"dan intensitas aktivitas yang relatif terbatas dibandingkan "
            f"kecamatan lain di Kota Bandung."
        )
        analisis_kompetitor = (
            f"Ditemukan {komp} kompetitor dalam radius 1 km. "
        ) + (
            "Minimnya kompetitor di wilayah ini konsisten dengan rendahnya "
            "permintaan pasar yang terdeteksi oleh model."
            if komp <= 1 else
            "Jumlah kompetitor yang ada menunjukkan bahwa pasar di wilayah ini "
            "sudah terlayani namun dengan volume yang terbatas."
        )
        rekomendasi = (
            f"Wilayah ini tidak direkomendasikan sebagai lokasi prioritas "
            f"pembukaan usaha smoothies bar pada tahap awal. Jarak ke jaringan "
            f"jalan utama sebesar {jarak_jl} km turut mengurangi potensi lalu "
            f"lintas konsumen spontan. Apabila terdapat pertimbangan khusus "
            f"(misalnya ketersediaan lahan atau kemitraan strategis), disarankan "
            f"untuk melengkapi analisis dengan data primer berupa survei konsumen "
            f"langsung sebelum mengambil keputusan investasi."
        )

    return {
        "kecamatan"           : nama,
        "kelas"               : kelas,
        "kepercayaan_persen"  : conf,
        "kepadatan_jiwa_km2"  : kepadatan,
        "skor_poi"            : skor_poi,
        "jumlah_kompetitor"   : komp,
        "jarak_jalan_km"      : jarak_jl,
        "kondisi_umum"        : kondisi_umum,
        "analisis_pasar"      : analisis_pasar,
        "analisis_kompetitor" : analisis_kompetitor,
        "rekomendasi"         : rekomendasi,
    }


# =============================================================================
# BAGIAN 7: PIPELINE UTAMA
# =============================================================================

def jalankan_pipeline():
    """
    Menjalankan seluruh pipeline:
        1. Muat data penduduk dari MySQL
        2. Muat data spasial dari GeoJSON
        3. Hitung fitur per kecamatan
        4. Buat label heuristik
        5. Latih Random Forest
        6. Generate deskripsi naratif
        7. Simpan output .txt dan .csv
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

    # 6. Generate deskripsi — diurutkan dari skor komposit tertinggi
    print("\n[OK] Membuat deskripsi naratif per kecamatan...")
    df_sorted = df_labeled.sort_values("skor_komposit", ascending=False)
    hasil_json = [
        generate_deskripsi(row, model, le, fitur_cols)
        for _, row in df_sorted.iterrows()
    ]

    # 7a. Simpan ke JSON (untuk FE React)
    import json
    with open(PATH_OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(hasil_json, f, ensure_ascii=False, indent=2)
    print(f"[OK] JSON tersimpan      : {PATH_OUTPUT_JSON}")

    # 7b. Simpan tabel fitur ke .csv (lampiran skripsi)
    cols_csv = [
        "kecamatan", "luas_km2", "jumlah_penduduk",
        "F1_kepadatan", "F2_skor_poi", "F3_kompetitor",
        "F4_jarak_jalan_m", "skor_komposit", "label_peluang",
    ]
    df_labeled[cols_csv].to_csv(PATH_OUTPUT_CSV, index=False, encoding="utf-8-sig")
    print(f"[OK] Tabel fitur tersimpan: {PATH_OUTPUT_CSV}")

    # Preview kecamatan peringkat 1
    top1 = hasil_json[0]
    print("\n" + "=" * 60)
    print(f"PREVIEW — {top1['kecamatan'].upper()} ({top1['kelas']})")
    print("=" * 60)
    print(top1["kondisi_umum"])
    print(top1["rekomendasi"])

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