import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/features/core/lib/db";

type Sekolah = {
  kecamatan: string;
  jumlah_sekolah: number;
};

type APIResponse<T> = {
  status: boolean;
  code: string;
  message: string;
  data: T | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<Sekolah[]>>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      status: false,
      code: "405",
      message: "Method not allowed",
      data: null,
    });
  }

  try {
    const db = await connectDB();
    const { kecamatan } = req.query;

    let query = "SELECT kecamatan, jumlah_sekolah FROM data_sekolah";
    const params: any[] = [];

    if (kecamatan && typeof kecamatan === "string") {
      query += " WHERE kecamatan LIKE ?";
      params.push(`%${kecamatan.trim()}%`);
    }

    query += " ORDER BY kecamatan ASC";

    const [rows] = await db.execute(query, params);

    return res.status(200).json({
      status: true,
      code: "200",
      message: "Success get data_sekolah",
      data: rows as Sekolah[],
    });
  } catch (error) {
    console.error("Error fetching data_sekolah:", error);
    return res.status(500).json({
      status: false,
      code: "500",
      message: "Internal server error",
      data: null,
    });
  }
}