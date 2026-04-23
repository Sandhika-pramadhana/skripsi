// pages/api/analisis.ts
// Format Pages Router — sesuai struktur project kamu

import type { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ── GET — ambil semua hasil ────────────────────────────────────────────────
  if (req.method === "GET") {
    const jsonPath = path.join(process.cwd(), "public", "hasil_analisis.json");

    if (!fs.existsSync(jsonPath)) {
      return res.status(404).json({
        error: "Hasil analisis belum tersedia. Jalankan analisis terlebih dahulu.",
      });
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    return res.status(200).json({ data });
  }

  // ── POST — trigger Python + return hasil kecamatan ────────────────────────
  if (req.method === "POST") {
    const { kecamatan } = req.body;

    if (!kecamatan || typeof kecamatan !== "string") {
      return res.status(400).json({ error: "Parameter 'kecamatan' wajib diisi." });
    }

    // Path ke script Python
    const scriptPath = path.join(
      process.cwd(),
      "random-forest",
      "machine.py"
    );

    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({
        error: `Script tidak ditemukan: ${scriptPath}`,
      });
    }

    // Jalankan Python
    try {
      await new Promise<void>((resolve, reject) => {
        const py = spawn("python", [scriptPath, "--kecamatan", kecamatan], {
          // Pastikan working directory benar agar path src/data terbaca
          cwd: process.cwd(),
        });

        let stderr = "";
        py.stderr.on("data", (d: Buffer) => (stderr += d.toString()));
        py.stdout.on("data", (d: Buffer) => process.stdout.write(d));

        py.on("close", (code: number) => {
          if (code === 0) resolve();
          else reject(new Error(`Python exit ${code}:\n${stderr}`));
        });

        py.on("error", (err: Error) => {
          reject(new Error(`Gagal menjalankan Python: ${err.message}`));
        });
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Python gagal dijalankan.";
      console.error("[API /analisis] Python error:", msg);
      return res.status(500).json({ error: msg });
    }

    // Baca hasil JSON
    const jsonPath = path.join(process.cwd(), "public", "hasil_analisis.json");

    if (!fs.existsSync(jsonPath)) {
      return res.status(500).json({
        error: "File hasil_analisis.json tidak terbuat. Cek log Python di terminal.",
      });
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as Record<
      string,
      unknown
    >[];

    const hasil = data.find(
      (d) =>
        (d.kecamatan as string).toLowerCase() === kecamatan.toLowerCase()
    );

    if (!hasil) {
      return res.status(404).json({
        error: `Kecamatan "${kecamatan}" tidak ditemukan dalam hasil analisis.`,
      });
    }

    return res.status(200).json({ data: hasil });
  }

  // Method lain tidak diizinkan
  return res.status(405).json({ error: "Method tidak diizinkan." });
}