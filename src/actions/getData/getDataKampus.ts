export type KampusData = {
    kecamatan: string;
    jumlah_kampus: number;
  };
  
  export async function getDataKampus(
    kecamatan?: string
  ): Promise<KampusData[]> {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
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
  
      if (json.status && json.data) {
        return json.data;
      }
  
      return [];
    } catch (err) {
      console.error("Failed to fetch data_kampus:", err);
      return [];
    }
  }