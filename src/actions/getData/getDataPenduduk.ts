export type KecamatanData = {
    kecamatan: string;
    jumlah_penduduk: number;
  };
  
  export async function getDataKecamatan(kecamatan?: string): Promise<KecamatanData[]> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  
      const url = kecamatan
        ? `${baseUrl}/api/data/data-penduduk?kecamatan=${encodeURIComponent(kecamatan)}`
        : `${baseUrl}/api/data/data-penduduk`;
  
      const res = await fetch(url);
  
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
      console.error("Failed to fetch data_kecamatan:", err);
      return [];
    }
  }