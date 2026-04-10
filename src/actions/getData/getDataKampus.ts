export type KampusData = {
    kecamatan: string;
    jumlah_kampus: number;
  };
  
  export async function getDataKampus(
    kecamatan?: string
  ): Promise<KampusData[]> {
    try {
      // Gunakan URL production tanpa fallback ke localhost
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://skripsi-one-sandy.vercel.app";
  
      const url = kecamatan
        ? `${baseUrl}/api/data/data-kampus?kecamatan=${encodeURIComponent(
            kecamatan
          )}`
        : `${baseUrl}/api/data/data-kampus`;
  
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
      console.error("Failed to fetch data_kampus:", err);
      return [];
    }
  }