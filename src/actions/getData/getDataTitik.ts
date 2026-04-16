export type TitikData = {
    nama: string;
    latitude: number;
    longitude: number;
    kategori?: string;
    alamat?: string;
  };
  
  type APIResponse<T> = {
    status: boolean;
    code: string;
    message: string;
    data: T | null;
  };
  
  export async function getDataTitik(
    kecamatan?: string
  ): Promise<TitikData[]> {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  
      const url = kecamatan
        ? `${baseUrl}/api/data/titik?kecamatan=${encodeURIComponent(
            kecamatan
          )}`
        : `${baseUrl}/api/data/titik`;
  
      const res = await fetch(url, {
        cache: "no-store",
      });
  
      if (!res.ok) {
        console.error("HTTP Error:", res.status);
        return [];
      }
  
      const json: APIResponse<TitikData[]> = await res.json();
      return json?.data ?? [];
    } catch (error) {
      console.error("Failed to fetch titik:", error);
      return [];
    }
  }