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

    const url = kecamatan
      ? `${baseUrl}/api/data/data-sekolah?kecamatan=${encodeURIComponent(
          kecamatan
        )}`
      : `${baseUrl}/api/data/data-sekolah`;

    const res = await fetch(url, { cache: "no-store" });

    const json: APIResponse<SekolahData[]> = res.ok
      ? await res.json()
      : { status: false, code: "500", message: "DB Error", data: [] };

    const data = json?.data ?? [];

    // sort biar rapi
    data.sort((a, b) =>
      a.kecamatan.localeCompare(b.kecamatan)
    );

    return data;
  } catch (err) {
    console.error("Failed to fetch data_sekolah:", err);
    return [];
  }
}