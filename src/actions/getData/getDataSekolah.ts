export type SekolahData = {
  kecamatan: string;
  jumlah_sekolah: number;
};

type APIResponse<T> = {
  status: boolean;
  code: string;
  message: string;
  data: T | null;
};

export async function getDataSekolah(
  kecamatan?: string
): Promise<SekolahData[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

    // Endpoint database
    const dbUrl = kecamatan
      ? `${baseUrl}/api/data/data-sekolah?kecamatan=${encodeURIComponent(
          kecamatan
        )}`
      : `${baseUrl}/api/data/data-sekolah`;

    // Endpoint GeoJSON (titik sekolah)
    const titikUrl = kecamatan
      ? `${baseUrl}/api/data/titik?kecamatan=${encodeURIComponent(
          kecamatan
        )}`
      : `${baseUrl}/api/data/titik`;

    // Ambil data secara paralel
    const [dbRes, titikRes] = await Promise.all([
      fetch(dbUrl, { cache: "no-store" }),
      fetch(titikUrl, { cache: "no-store" }),
    ]);

    const dbJson: APIResponse<SekolahData[]> = dbRes.ok
      ? await dbRes.json()
      : { status: false, code: "500", message: "DB Error", data: [] };

    const titikJson: APIResponse<SekolahData[]> = titikRes.ok
      ? await titikRes.json()
      : { status: false, code: "500", message: "GeoJSON Error", data: [] };

    const dbData = dbJson?.data ?? [];
    const titikData = titikJson?.data ?? [];

    // Gabungkan data berdasarkan kecamatan
    const resultMap = new Map<string, number>();

    dbData.forEach((item) => {
      resultMap.set(item.kecamatan, item.jumlah_sekolah);
    });

    titikData.forEach((item) => {
      const current = resultMap.get(item.kecamatan) || 0;
      resultMap.set(
        item.kecamatan,
        Math.max(current, item.jumlah_sekolah)
      );
    });

    // Konversi ke array
    const mergedData: SekolahData[] = Array.from(resultMap.entries()).map(
      ([kecamatan, jumlah_sekolah]) => ({
        kecamatan,
        jumlah_sekolah,
      })
    );

    // Urutkan berdasarkan nama kecamatan
    mergedData.sort((a, b) =>
      a.kecamatan.localeCompare(b.kecamatan)
    );

    return mergedData;
  } catch (err) {
    console.error("Failed to fetch data_sekolah:", err);
    return [];
  }
}