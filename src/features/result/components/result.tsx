"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Store,
  Navigation,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface HasilAnalisis {
  kecamatan: string;
  kelas: "Tinggi" | "Sedang" | "Rendah";
  kepercayaan_persen: number;
  kepadatan_jiwa_km2: number;
  skor_poi: number;
  jumlah_kompetitor: number;
  jarak_jalan_km: number;
  kondisi_umum: string;
  analisis_pasar: string;
  analisis_kompetitor: string;
  rekomendasi: string;
}

const KELAS_CONFIG = {
  Tinggi: {
    gradient : "from-emerald-500 to-teal-500",
    border   : "border-emerald-200",
    softBg   : "bg-emerald-50",
    text     : "text-emerald-700",
    badge    : "bg-emerald-100 text-emerald-700",
    bar      : "bg-emerald-500",
    Icon     : CheckCircle2,
    iconColor: "text-emerald-500",
    ring     : "ring-emerald-200",
  },
  Sedang: {
    gradient : "from-amber-400 to-orange-400",
    border   : "border-amber-200",
    softBg   : "bg-amber-50",
    text     : "text-amber-700",
    badge    : "bg-amber-100 text-amber-700",
    bar      : "bg-amber-400",
    Icon     : AlertCircle,
    iconColor: "text-amber-500",
    ring     : "ring-amber-200",
  },
  Rendah: {
    gradient : "from-red-400 to-rose-500",
    border   : "border-red-200",
    softBg   : "bg-red-50",
    text     : "text-red-700",
    badge    : "bg-red-100 text-red-700",
    bar      : "bg-red-400",
    Icon     : XCircle,
    iconColor: "text-red-500",
    ring     : "ring-red-200",
  },
} as const;

function KartuFitur({
  icon: Icon,
  label,
  nilai,
  satuan,
  deskripsi,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  nilai: string | number;
  satuan: string;
  deskripsi: string;
  delay: number;
}) {
  return (
    <div
      className="fade-up bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-gray-500" />
        </div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {label}
        </p>
      </div>
      <p className="text-xl font-bold text-gray-800 mb-0.5">
        {nilai}
        <span className="text-xs font-normal text-gray-400 ml-1">{satuan}</span>
      </p>
      <p className="text-xs text-gray-400">{deskripsi}</p>
    </div>
  );
}

function KartuNarasi({
  nomor,
  label,
  teks,
}: {
  nomor: string;
  label: string;
  teks: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
        {nomor}
      </div>
      <div className="flex-1 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
          {label}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">{teks}</p>
      </div>
    </div>
  );
}

function ResultContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const namaKec      = searchParams?.get("kecamatan") ?? "";

  const [hasil, setHasil]     = useState<HasilAnalisis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!namaKec) {
      setError("Nama kecamatan tidak ditemukan.");
      setLoading(false);
      return;
    }

    fetch("/api/analisis")
      .then((r) => r.json())
      .then((json) => {
        const data: HasilAnalisis[] = json.data ?? [];
        const found = data.find(
          (d) => d.kecamatan.toLowerCase() === namaKec.toLowerCase()
        );
        if (found) {
          setHasil(found);
          // Micro-delay supaya browser sempat paint dulu sebelum animasi jalan
          setTimeout(() => setVisible(true), 50);
        } else {
          setError(`Kecamatan "${namaKec}" tidak ditemukan dalam data.`);
        }
      })
      .catch(() => setError("Gagal memuat data analisis."))
      .finally(() => setLoading(false));
  }, [namaKec]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Memuat hasil analisis...</p>
        </div>
      </div>
    );
  }

  if (error || !hasil) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">{error || "Data tidak tersedia."}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-green-600 hover:underline"
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  const cfg = KELAS_CONFIG[hasil.kelas];

  // Kalau visible false, sembunyiin semua (sebelum animasi mulai)
  if (!visible) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Tombol kembali */}
        <button
          onClick={() => router.back()}
          className="fade-up flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm transition-colors"
          style={{ animationDelay: "0ms" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        {/* Hero card */}
        <div
          className={`fade-up bg-gradient-to-br ${cfg.gradient} rounded-2xl shadow-sm p-6`}
          style={{ animationDelay: "80ms" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-1">
                Hasil Analisis Random Forest
              </p>
              <h1 className="text-2xl font-bold text-white">
                Kec. {hasil.kecamatan}
              </h1>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 text-white">
              <cfg.Icon className="w-3.5 h-3.5" />
              {hasil.kelas.toUpperCase()}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/20 text-white mb-5">
            <cfg.Icon className="w-4 h-4" />
            Peluang Usaha {hasil.kelas}
          </div>

          <div>
            <div className="flex justify-between text-xs text-white/60 mb-1.5">
              <span>Kepercayaan Model</span>
              <span className="font-semibold text-white">{hasil.kepercayaan_persen}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-white transition-all duration-700"
                style={{ width: `${hasil.kepercayaan_persen}%` }}
              />
            </div>
          </div>
        </div>

        {/* Data Variabel */}
        <section>
          <p
            className="fade-up text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1"
            style={{ animationDelay: "160ms" }}
          >
            Data Variabel
          </p>
          <div className="grid grid-cols-2 gap-3">
            <KartuFitur
              icon={Users}
              label="Kepadatan Penduduk"
              nilai={hasil.kepadatan_jiwa_km2?.toLocaleString("id-ID")}
              satuan="jiwa/km²"
              deskripsi="Basis konsumen potensial"
              delay={200}
            />
            <KartuFitur
              icon={MapPin}
              label="Skor Keramaian"
              nilai={hasil.skor_poi}
              satuan="poin"
              deskripsi="Mall, kampus, sekolah"
              delay={240}
            />
            <KartuFitur
              icon={Store}
              label="Kompetitor"
              nilai={hasil.jumlah_kompetitor}
              satuan="usaha"
              deskripsi="Dalam radius 1 km"
              delay={280}
            />
            <KartuFitur
              icon={Navigation}
              label="Jarak Jalan"
              nilai={hasil.jarak_jalan_km}
              satuan="km"
              deskripsi="Ke arteri utama"
              delay={320}
            />
          </div>
        </section>

        {/* Analisis naratif */}
        <section
          className="fade-up bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
          style={{ animationDelay: "380ms" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className={`w-4 h-4 ${cfg.iconColor}`} />
            <p className="font-semibold text-gray-700 text-sm">Analisis Lengkap</p>
          </div>
          <div className="space-y-5">
            <KartuNarasi nomor="1" label="Kondisi Umum"        teks={hasil.kondisi_umum} />
            <KartuNarasi nomor="2" label="Analisis Pasar"      teks={hasil.analisis_pasar} />
            <KartuNarasi nomor="3" label="Analisis Kompetitor" teks={hasil.analisis_kompetitor} />
            <KartuNarasi nomor="4" label="Rekomendasi"         teks={hasil.rekomendasi} />
          </div>
        </section>

        {/* Tombol aksi */}
        <div
          className="fade-up pb-6"
          style={{ animationDelay: "460ms" }}
        >
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Analisis kecamatan lain
          </button>
        </div>

      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}