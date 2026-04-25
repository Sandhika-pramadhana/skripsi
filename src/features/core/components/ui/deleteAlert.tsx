// components/DeleteAlert.tsx
"use client";

import { useEffect } from "react";
import { Trash2, X } from "lucide-react";

interface DeleteAlertProps {
  open: boolean;
  namaKecamatan: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteAlert({
  open,
  namaKecamatan,
  loading = false,
  onConfirm,
  onCancel,
}: DeleteAlertProps) {
  // Tutup dengan Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  // Lock scroll saat modal buka
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fade-up relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-10">
        {/* Tombol close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>

        {/* Teks */}
        <div className="text-center mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Hapus data ini?
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Data analisis{" "}
            <span className="font-medium text-gray-600">
              Kec. {namaKecamatan}
            </span>{" "}
            akan dihapus permanen dan tidak bisa dikembalikan.
          </p>
        </div>

        {/* Tombol aksi */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Hapus
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}