import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type TitikBandung = {
  nama: string;
  kategori: string;
  kecamatan: string;
  latitude: number;
  longitude: number;
};

type APIResponse<T> = {
  status: boolean;
  code: string;
  message: string;
  data: T | null;
};

// Cache untuk meningkatkan performa
let cachedPoints: TitikBandung[] | null = null;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResponse<TitikBandung[]>>
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
    // Gunakan cache jika tersedia
    if (cachedPoints) {
      return res.status(200).json({
        status: true,
        code: "200",
        message: "Success get titik di Bandung (cached)",
        data: cachedPoints,
      });
    }

    // Path ke file GeoJSON
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "titik.geojson"
    );

    if (!fs.existsSync(filePath)) {
      throw new Error("File titik.geojson tidak ditemukan");
    }

    const fileData = fs.readFileSync(filePath, "utf-8");
    const geojson = JSON.parse(fileData);
    const features = geojson.features || [];

    // Filter semua titik yang berada di Bandung
    const bandungPoints: TitikBandung[] = features
      .filter((feature: any) => {
        if (!feature.geometry || feature.geometry.type !== "Point") {
          return false;
        }

        const props = feature.properties || {};
        const textFields = [
          props["addr:city"],
          props.city,
          props.kota,
          props["is_in:city"],
          props["addr:district"],
          props.district,
          props.kecamatan,
          props["is_in"],
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return textFields.includes("bandung");
      })
      .map((feature: any) => {
        const props = feature.properties || {};
        const [longitude, latitude] = feature.geometry.coordinates;

        return {
          nama: props.name || "Tanpa Nama",
          kategori:
            props.amenity ||
            props.shop ||
            props.tourism ||
            props.office ||
            props.leisure ||
            props.building ||
            "Lainnya",
          kecamatan:
            props.kecamatan ||
            props.district ||
            props["addr:district"] ||
            props["is_in:subdistrict"] ||
            "Tidak Diketahui",
          latitude,
          longitude,
        };
      });

    // Simpan ke cache
    cachedPoints = bandungPoints;

    return res.status(200).json({
      status: true,
      code: "200",
      message: "Success get semua titik di Bandung",
      data: bandungPoints,
    });
  } catch (error) {
    console.error("Error reading titik.geojson:", error);
    return res.status(500).json({
      status: false,
      code: "500",
      message: "Internal server error",
      data: null,
    });
  }
}