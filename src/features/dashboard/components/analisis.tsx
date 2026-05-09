"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Activity, MapPin, Search, ChevronRight, Loader2 } from "lucide-react";

interface HasilAnalisis {
  kecamatan: string;
  kelas: "Tinggi" | "Sedang" | "Rendah";
  level_lokasi: "Lokasi Utama" | "Lokasi Alternatif" | "Lokasi Cadangan";
  kepercayaan_persen: number;
  kepadatan_jiwa_km2: number;
  skor_poi: number;
  jumlah_kompetitor: number;
  jarak_jalan_km: number;
  poin_analisis: string[];
  analisis_kompetitor: string;
  rekomendasi: string;
}

const KELAS_CONFIG = {
  Tinggi: {
    badge : "bg-emerald-100 text-emerald-800",
    border: "border-emerald-200",
    bg    : "bg-emerald-50",
    dot   : "bg-emerald-500",
    label : "text-emerald-700",
  },
  Sedang: {
    badge : "bg-amber-100 text-amber-800",
    border: "border-amber-200",
    bg    : "bg-amber-50",
    dot   : "bg-amber-400",
    label : "text-amber-700",
  },
  Rendah: {
    badge : "bg-red-100 text-red-800",
    border: "border-red-200",
    bg    : "bg-red-50",
    dot   : "bg-red-400",
    label : "text-red-700",
  },
} as const;

// Konfigurasi badge level lokasi
const LEVEL_CONFIG = {
  "Lokasi Utama"      : { bg: "bg-emerald-500", text: "text-white",        icon: "●" },
  "Lokasi Alternatif" : { bg: "bg-amber-400",   text: "text-white",        icon: "●" },
  "Lokasi Cadangan"   : { bg: "bg-red-400",     text: "text-white",        icon: "●" },
} as const;

function StatBox({ label, nilai, satuan }: { label: string; nilai: string | number; satuan: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-lg font-semibold text-gray-800">
        {nilai}
        <span className="text-xs font-normal text-gray-400 ml-1">{satuan}</span>
      </p>
    </div>
  );
}

// Badge level lokasi — ditampilkan prominent di atas kartu hasil
function LevelBadge({ level }: { level: HasilAnalisis["level_lokasi"] }) {
  const cfg = LEVEL_CONFIG[level];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      {cfg.icon} {level}
    </span>
  );
}

export default function AnalisisDashboard() {
  const router = useRouter();

  const [semuaData, setSemuaData]       = useState<HasilAnalisis[]>([]);
  const [query, setQuery]               = useState("");
  const [saran, setSaran]               = useState<HasilAnalisis[]>([]);
  const [loading, setLoading]           = useState(false);
  const [loadingData, setLoadingData]   = useState(true);
  const [error, setError]               = useState("");
  const [hasil, setHasil]               = useState<HasilAnalisis | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const inputRef     = useRef<HTMLInputElement>(null);
  const dropdownRef  = useRef<HTMLUListElement>(null);
  const isPickingRef = useRef(false);

  useEffect(() => {
    fetch("/api/analisis")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setSemuaData(json.data as HasilAnalisis[]);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, []);

  useEffect(() => {
    if (isPickingRef.current) {
      isPickingRef.current = false;
      return;
    }

    if (!query || query.length < 2) {
      setSaran([]);
      setShowDropdown(false);
      return;
    }

    const filtered = semuaData.filter((d) =>
      d.kecamatan.toLowerCase().includes(query.toLowerCase())
    );

    const isExact = filtered.some(
      (d) => d.kecamatan.toLowerCase() === query.toLowerCase()
    );

    if (isExact) {
      setSaran([]);
      setShowDropdown(false);
    } else {
      setSaran(filtered.slice(0, 6));
      setShowDropdown(filtered.length > 0);
    }
  }, [query, semuaData]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function simpanKeHistory(data: HasilAnalisis) {
    try {
      await fetch("/api/data/data-history", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({
          kecamatan           : data.kecamatan,
          kelas               : data.kelas,
          level_lokasi        : data.level_lokasi,
          kepercayaan         : data.kepercayaan_persen,
          kepadatan           : data.kepadatan_jiwa_km2,
          skor_poi            : data.skor_poi,
          kompetitor          : data.jumlah_kompetitor,
          jarak_jalan         : data.jarak_jalan_km,
          poin_analisis       : data.poin_analisis,
          analisis_kompetitor : data.analisis_kompetitor,
          rekomendasi         : data.rekomendasi,
        }),
      });
    } catch {
      console.warn("Gagal simpan ke history.");
    }
  }

  async function analisisKecamatan(nama: string) {
    setLoading(true);
    setError("");
    setHasil(null);
    setShowDropdown(false);
    setSaran([]);

    try {
      const res = await fetch("/api/analisis", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ kecamatan: nama }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Terjadi kesalahan.");
        return;
      }

      const data = json.data as HasilAnalisis;
      setHasil(data);
      await simpanKeHistory(data);

      setSemuaData((prev) => {
        const idx = prev.findIndex(
          (d) => d.kecamatan.toLowerCase() === nama.toLowerCase()
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = data;
          return next;
        }
        return [...prev, data];
      });
    } catch {
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  function handlePilih(nama: string) {
    isPickingRef.current = true;
    setQuery(nama);
    setShowDropdown(false);
    setSaran([]);
    analisisKecamatan(nama);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) analisisKecamatan(query.trim());
  }

  const cfg = hasil ? KELAS_CONFIG[hasil.kelas] : null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

      {/* ── Panel Utama ── */}
      <div className="xl:col-span-2 bg-white rounded-xl shadow-lg border p-6">
        <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" />
          Analisis Peluang Usaha
        </h2>
        <p className="text-sm text-gray-400 mb-5">
          Masukkan nama kecamatan untuk melihat hasil analisis Random Forest.
        </p>

        {/* Search */}
        <form onSubmit={handleSubmit} className="mb-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setError(""); }}
                onFocus={() => { if (saran.length > 0 && query.length >= 2) setShowDropdown(true); }}
                placeholder={loadingData ? "Memuat daftar kecamatan..." : "Ketik nama kecamatan..."}
                disabled={loadingData}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              />

              {showDropdown && saran.length > 0 && (
                <ul
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                >
                  {saran.map((s) => {
                    const c = KELAS_CONFIG[s.kelas];
                    return (
                      <li
                        key={s.kecamatan}
                        onMouseDown={(e) => { e.preventDefault(); handlePilih(s.kecamatan); }}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm"
                      >
                        <span className="text-gray-700">{s.kecamatan}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>
                          {s.kelas}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || loadingData}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analisis"}
            </button>
          </div>
        </form>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            Menjalankan analisis...
          </div>
        )}

        {/* ── Kartu Hasil ── */}
        {hasil && cfg && !loading && (
          <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-5`}>

            {/* Header: nama + level badge */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Kec. {hasil.kecamatan}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <LevelBadge level={hasil.level_lokasi} />
                  <span className="text-xs text-gray-400">
                    Kepercayaan {hasil.kepercayaan_persen}%
                  </span>
                </div>
              </div>
              {/* Badge kelas tetap ada sebagai info tambahan */}
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${cfg.badge}`}>
                {hasil.kelas.toUpperCase()}
              </span>
            </div>

            {/* Stat boxes */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <StatBox label="Kepadatan Penduduk" nilai={hasil.kepadatan_jiwa_km2?.toLocaleString("id-ID")} satuan="jiwa/km²" />
              <StatBox label="Skor Keramaian"     nilai={hasil.skor_poi}          satuan="poin" />
              <StatBox label="Kompetitor"          nilai={hasil.jumlah_kompetitor} satuan="dalam 1 km" />
              <StatBox label="Jarak Jalan Utama"   nilai={hasil.jarak_jalan_km}   satuan="km" />
            </div>

            {/* Analisis — poin-poin gabungan */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Analisis
              </p>
              <ul className="space-y-2">
                {hasil.poin_analisis.map((poin, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    {poin}
                  </li>
                ))}
              </ul>
            </div>

            {/* Kompetitor */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                Analisis Kompetitor
              </p>
              <p className="text-sm text-gray-700">{hasil.analisis_kompetitor}</p>
            </div>

            {/* Rekomendasi — styling menonjol sesuai level */}
            <div className={`rounded-xl border ${cfg.border} p-4 mb-4`}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1.5 ${cfg.label}">
                Rekomendasi · {hasil.level_lokasi}
              </p>
              <p className="text-sm font-medium text-gray-800">{hasil.rekomendasi}</p>
            </div>

            <button
              onClick={() => router.push(`/result?kecamatan=${encodeURIComponent(hasil.kecamatan)}`)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Lihat halaman hasil lengkap
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ── Panel Kanan: Legenda ── */}
      <div>
        <div className="sticky top-6 bg-white rounded-xl shadow-lg border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Level Lokasi
          </h2>

          <ul className="space-y-4">
            {(
              [
                {
                  dot  : "bg-emerald-500",
                  level: "Lokasi Utama",
                  kelas: "Peluang Tinggi",
                  desc : "Basis konsumen besar, akses baik, prioritas pertama.",
                },
                {
                  dot  : "bg-amber-400",
                  level: "Lokasi Alternatif",
                  kelas: "Peluang Sedang",
                  desc : "Potensi cukup, perlu diferensiasi dan survei lanjut.",
                },
                {
                  dot  : "bg-red-400",
                  level: "Lokasi Cadangan",
                  kelas: "Peluang Rendah",
                  desc : "Kurang direkomendasikan",
                },
              ] as const
            ).map((item) => (
              <li key={item.level} className="flex items-start gap-3">
                <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${item.dot}`} />
                <div>
                  <p className="text-sm font-semibold text-gray-700">{item.level}</p>
                  <p className="text-xs font-medium text-gray-500 mb-0.5">{item.kelas}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}