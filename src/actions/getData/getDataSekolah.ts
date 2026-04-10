export type SekolahData = {
    kecamatan: string;
    jumlah_sekolah: number;
  };
  
  export async function getDataSekolah(
    kecamatan?: string
  ): Promise<SekolahData[]> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_BASE_URL is not defined. Please configure it in the environment variables."
        );
      }
  
      const url = kecamatan
        ? `${baseUrl}/api/data/data-sekolah?kecamatan=${encodeURIComponent(
            kecamatan
          )}`
        : `${baseUrl}/api/data/data-sekolah`;
  
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
      console.error("Failed to fetch data_sekolah:", err);
      return [];
    }
  }