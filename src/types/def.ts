export type KecamatanFeature = {
  type: "Feature";
  properties: { nama_kecamatan: string };
  geometry: { type: "MultiPolygon"; coordinates: any };
};

export type GeoJSONType = {
  type: "FeatureCollection";
  features: KecamatanFeature[];
};

export type HasilRF = {
  kecamatan: string;
  kelas: "Tinggi" | "Sedang" | "Rendah";
  level_lokasi: string;
  kepercayaan_persen: number;
  kepadatan_jiwa_km2: number;
  skor_poi: number;
  jumlah_kompetitor: number;
  jarak_jalan_km: number;
  poin_analisis: string[];
  analisis_kompetitor: string;
  rekomendasi: string;
  skor_komposit?: number;
  centroid_lat?: number;
  centroid_lng?: number;
};