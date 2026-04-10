export type KecamatanData = {
  kecamatan: string;
  jumlah_penduduk: number;
};

export async function getDataKecamatan(
  kecamatan?: string
): Promise<KecamatanData[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseUrl) {
      throw new Error(
        "NEXT_PUBLIC_API_BASE_URL is not defined. Please set it in the environment variables."
      );
    }

    const url = kecamatan
      ? `${baseUrl}/api/data/data-penduduk?kecamatan=${encodeURIComponent(
          kecamatan
        )}`
      : `${baseUrl}/api/data/data-penduduk`;

    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`HTTP error! status: ${res.status}`);
      return [];
    }

    const json = await res.json();
    return json?.data ?? [];
  } catch (err) {
    console.error("Failed to fetch data_kecamatan:", err);
    return [];
  }
}