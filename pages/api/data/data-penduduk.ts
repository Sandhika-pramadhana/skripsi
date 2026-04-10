import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/features/core/lib/db"; 

type Kecamatan = {
  kecamatan: string;
  jumlah_penduduk: number;
};

type APIResponse<T> = {
  status: boolean;
  code: string;
  message: string;
  data: T | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<Kecamatan[]>>
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

    let query = "SELECT * FROM data_kecamatan";
    const params: any[] = [];

    if (kecamatan && typeof kecamatan === "string") {
      params.push(`%${kecamatan.trim()}%`);
      query += " WHERE kecamatan LIKE ?";
    }

    query += " ORDER BY kecamatan ASC";

    const [rows] = await db.execute(query, params); // mysql2 pool

    return res.status(200).json({
      status: true,
      code: "200",
      message: "Success get data_kecamatan",
      data: rows as Kecamatan[],
    });
  } catch (error: any) {
    console.error("Error fetching data_kecamatan:", error);
    return res.status(500).json({
      status: false,
      code: "500",
      message: "Internal server error",
      data: null,
    });
  }
}