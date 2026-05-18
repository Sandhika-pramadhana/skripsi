// pages/api/history.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/features/core/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pool = connectDB();

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM history_analisis ORDER BY created_at DESC"
      );
      return res.status(200).json({ data: rows });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal mengambil data.";
      return res.status(500).json({ error: msg });
    }
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  if (req.method === "POST") {
    const {
      kecamatan, kelas, level_lokasi, kepercayaan,
      kepadatan, skor_poi, kompetitor, jarak_jalan,
      poin_analisis, analisis_kompetitor, rekomendasi,
    } = req.body;

    if (!kecamatan || !kelas) {
      return res.status(400).json({ error: "Field kecamatan dan kelas wajib diisi." });
    }

    try {
      const [result] = await pool.execute(
        `INSERT INTO history_analisis
          (kecamatan, kelas, level_lokasi, kepercayaan, kepadatan, skor_poi,
           kompetitor, jarak_jalan, poin_analisis, analisis_kompetitor, rekomendasi)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          kecamatan,
          kelas,
          level_lokasi ?? "",
          kepercayaan ?? 0,
          kepadatan ?? 0,
          skor_poi ?? 0,
          kompetitor ?? 0,
          jarak_jalan ?? 0,
          // Simpan array sebagai JSON string di kolom TEXT
          Array.isArray(poin_analisis) ? JSON.stringify(poin_analisis) : (poin_analisis ?? "[]"),
          analisis_kompetitor ?? "",
          rekomendasi ?? "",
        ]
      );
      return res.status(201).json({ message: "Berhasil disimpan.", result });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal menyimpan.";
      return res.status(500).json({ error: msg });
    }
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Parameter id wajib diisi." });
    }
    try {
      await pool.execute("DELETE FROM history_analisis WHERE id = ?", [id]);
      return res.status(200).json({ message: "Berhasil dihapus." });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal menghapus.";
      return res.status(500).json({ error: msg });
    }
  }

  return res.status(405).json({ error: "Method tidak diizinkan." });
}