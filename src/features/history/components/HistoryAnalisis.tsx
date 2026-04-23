"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Eye,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Search,
} from "lucide-react";

// ─── Tipe ─────────────────────────────────────────────────────────────────────

interface HistoryItem {
  id: number;
  kecamatan: string;
  kelas: "Tinggi" | "Sedang" | "Rendah";
  kepercayaan: number;
  kepadatan: number;
  skor_poi: number;
  kompetitor: number;
  jarak_jalan: number;
  kondisi_umum: string;
  analisis_pasar: string;
  analisis_kompetitor: string;
  rekomendasi: string;
  created_at: string;
}

type SortKey = keyof HistoryItem;

// ─── Config warna ─────────────────────────────────────────────────────────────

const KELAS_CONFIG = {
  Tinggi: { badge: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  Sedang: { badge: "bg-amber-100 text-amber-800",     dot: "bg-amber-400"   },
  Rendah: { badge: "bg-red-100 text-red-800",         dot: "bg-red-400"     },
} as const;

// ─── Format tanggal ───────────────────────────────────────────────────────────

function formatTanggal(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  }) + " " + d.toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Komponen utama ───────────────────────────────────────────────────────────

export default function HistoryAnalisis() {
  const router = useRouter();

  const [data, setData]           = useState<HistoryItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [deleting, setDeleting]   = useState<number | null>(null);
  const [konfirmId, setKonfirmId] = useState<number | null>(null);
  const [cari, setCari]           = useState("");
  const [filterKelas, setFilterKelas] = useState<string>("Semua");
  const [sortKey, setSortKey]     = useState<SortKey>("created_at");
  const [sortAsc, setSortAsc]     = useState(false);

  // ── Fetch data ──────────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data/data-history");
      const json = await res.json();
      setData(json.data ?? []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function hapus(id: number) {
    setDeleting(id);
    try {
      await fetch(`/api/data/data-history?id=${id}`, { method: "DELETE" });
      setData((prev) => prev.filter((d) => d.id !== id));
    } finally {
      setDeleting(null);
      setKonfirmId(null);
    }
  }

  // ── Sort ────────────────────────────────────────────────────────────────────
  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  }

  // ── Filter + sort data ──────────────────────────────────────────────────────
  const tampil = data
    .filter((d) => {
      const cocokCari  = d.kecamatan.toLowerCase().includes(cari.toLowerCase());
      const cocokKelas = filterKelas === "Semua" || d.kelas === filterKelas;
      return cocokCari && cocokKelas;
    })
    .sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });

  // ── Ringkasan ───────────────────────────────────────────────────────────────
  const ringkasan = {
    Tinggi: data.filter((d) => d.kelas === "Tinggi").length,
    Sedang: data.filter((d) => d.kelas === "Sedang").length,
    Rendah: data.filter((d) => d.kelas === "Rendah").length,
  };

  // ── Header kolom ────────────────────────────────────────────────────────────
  function ThSort({
    label, k, className = ""
  }: { label: string; k: SortKey; className?: string }) {
    const aktif = sortKey === k;
    return (
      <th
        onClick={() => toggleSort(k)}
        className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-gray-700 ${className}`}
      >
        <span className="flex items-center gap-1">
          {label}
          <span className="text-gray-300">
            {aktif
              ? sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
              : <ChevronUp className="w-3 h-3 opacity-30" />}
          </span>
        </span>
      </th>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Ringkasan ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {(["Tinggi", "Sedang", "Rendah"] as const).map((k) => {
          const c = KELAS_CONFIG[k];
          return (
            <div
              key={k}
              onClick={() => setFilterKelas(filterKelas === k ? "Semua" : k)}
              className={`bg-white rounded-xl border p-4 text-center cursor-pointer transition-all
                ${filterKelas === k ? "ring-2 ring-offset-1 ring-gray-400 shadow-sm" : "hover:shadow-sm"}`}
            >
              <p className="text-2xl font-bold text-gray-800 mb-1">
                {ringkasan[k]}
              </p>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
                {k}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari kecamatan..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex gap-1">
          {["Semua", "Tinggi", "Sedang", "Rendah"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterKelas(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors
                ${filterKelas === f
                  ? "bg-gray-800 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={fetchHistory}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ── Tabel ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-sm text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-300" />
            Memuat data...
          </div>
        ) : tampil.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400">
            {data.length === 0
              ? "Belum ada history analisis."
              : "Tidak ada data yang cocok dengan filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <ThSort label="Kecamatan"  k="kecamatan" />
                  <ThSort label="Kelas"      k="kelas" />
                  <ThSort label="Kepercayaan" k="kepercayaan" />
                  <ThSort label="Kepadatan"  k="kepadatan" />
                  <ThSort label="Skor POI"   k="skor_poi" />
                  <ThSort label="Kompetitor" k="kompetitor" />
                  <ThSort label="Jarak (km)" k="jarak_jalan" />
                  <ThSort label="Waktu"      k="created_at" />
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tampil.map((item) => {
                  const c = KELAS_CONFIG[item.kelas] ?? KELAS_CONFIG["Sedang"];
                  const isDeleting = deleting === item.id;
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 transition-colors ${isDeleting ? "opacity-40" : ""}`}
                    >
                      {/* Kecamatan */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                          <span className="text-sm font-medium text-gray-800">
                            {item.kecamatan}
                          </span>
                        </div>
                      </td>

                      {/* Kelas */}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
                          {item.kelas}
                        </span>
                      </td>

                      {/* Kepercayaan */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-blue-400"
                              style={{ width: `${item.kepercayaan}%` }}
                            />
                          </div>
                          <span>{item.kepercayaan}%</span>
                        </div>
                      </td>

                      {/* Kepadatan */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.kepadatan?.toLocaleString("id-ID")}
                      </td>

                      {/* Skor POI */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.skor_poi}
                      </td>

                      {/* Kompetitor */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.kompetitor}
                      </td>

                      {/* Jarak */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.jarak_jalan}
                      </td>

                      {/* Waktu */}
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {formatTanggal(item.created_at)}
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Lihat detail */}
                          <button
                            onClick={() =>
                              router.push(
                                `/result?kecamatan=${encodeURIComponent(item.kecamatan)}`
                              )
                            }
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Lihat detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Hapus — konfirmasi inline */}
                          {konfirmId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => hapus(item.id)}
                                disabled={isDeleting}
                                className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                {isDeleting ? "..." : "Hapus"}
                              </button>
                              <button
                                onClick={() => setKonfirmId(null)}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setKonfirmId(item.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && tampil.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">
            Menampilkan {tampil.length} dari {data.length} data
          </div>
        )}
      </div>
    </div>
  );
}