// pages/api/history.ts
// CRUD history analisis — GET semua, POST simpan, DELETE per id

import type { NextApiRequest, NextApiResponse } from "next";
import mysql from "mysql2/promise";

const DB = {
  host    : "mainline.proxy.rlwy.net",
  port    : 43277,
  database: "railway",
  user    : "root",
  password: "phsqybAnMApgQDlguPZZhpuKelqRVznf",
};

async function getConn() {
  return mysql.createConnection(DB);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ── GET — ambil semua history ─────────────────────────────────────────────
  if (req.method === "GET") {
    let conn;
    try {
      conn = await getConn();
      const [rows] = await conn.execute(
        "SELECT * FROM history_analisis ORDER BY created_at DESC"
      );
      return res.status(200).json({ data: rows });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal mengambil data.";
      return res.status(500).json({ error: msg });
    } finally {
      if (conn) await conn.end();
    }
  }

  // ── POST — simpan hasil analisis ke history ───────────────────────────────
  if (req.method === "POST") {
    const {
      kecamatan, kelas, kepercayaan, kepadatan,
      skor_poi, kompetitor, jarak_jalan,
      kondisi_umum, analisis_pasar, analisis_kompetitor, rekomendasi,
    } = req.body;

    if (!kecamatan || !kelas) {
      return res.status(400).json({ error: "Field kecamatan dan kelas wajib diisi." });
    }

    let conn;
    try {
      conn = await getConn();
      const [result] = await conn.execute(
        `INSERT INTO history_analisis
          (kecamatan, kelas, kepercayaan, kepadatan, skor_poi, kompetitor,
           jarak_jalan, kondisi_umum, analisis_pasar, analisis_kompetitor, rekomendasi)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          kecamatan, kelas, kepercayaan ?? 0, kepadatan ?? 0,
          skor_poi ?? 0, kompetitor ?? 0, jarak_jalan ?? 0,
          kondisi_umum ?? "", analisis_pasar ?? "",
          analisis_kompetitor ?? "", rekomendasi ?? "",
        ]
      );
      return res.status(201).json({ message: "Berhasil disimpan.", result });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal menyimpan.";
      return res.status(500).json({ error: msg });
    } finally {
      if (conn) await conn.end();
    }
  }

  // ── DELETE — hapus per id ─────────────────────────────────────────────────
  if (req.method === "DELETE") {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Parameter id wajib diisi." });
    }

    let conn;
    try {
      conn = await getConn();
      await conn.execute("DELETE FROM history_analisis WHERE id = ?", [id]);
      return res.status(200).json({ message: "Berhasil dihapus." });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal menghapus.";
      return res.status(500).json({ error: msg });
    } finally {
      if (conn) await conn.end();
    }
  }

  return res.status(405).json({ error: "Method tidak diizinkan." });
}