"use server";

import { serverAction, ServerActionError } from "../action";

export type HeatmapPoint = {
  lat: number;
  lng: number;
  weight?: number;
};

export const getBandungHeatmapPoints = serverAction(
  async (kecamatan?: string): Promise<HeatmapPoint[]> => {
    try {
      // ✅ 30 Kecamatan Bandung (1 titik per kecamatan)
      const rows = [
        { lat: -6.9147, lng: 107.6098, kecamatan: "Andir" },
        { lat: -6.9200, lng: 107.6500, kecamatan: "Antapani" },
        { lat: -6.9100, lng: 107.6700, kecamatan: "Arcamanik" },
        { lat: -6.9500, lng: 107.6000, kecamatan: "Astanaanyar" },
        { lat: -6.8800, lng: 107.6100, kecamatan: "Babakan Ciparay" },
        { lat: -6.9300, lng: 107.6200, kecamatan: "Bandung Kidul" },
        { lat: -6.8900, lng: 107.5800, kecamatan: "Bandung Kulon" },
        { lat: -6.8950, lng: 107.6000, kecamatan: "Bandung Wetan" },
        { lat: -6.9400, lng: 107.6100, kecamatan: "Batununggal" },
        { lat: -6.8600, lng: 107.5900, kecamatan: "Bojongloa Kaler" },
        { lat: -6.8700, lng: 107.6000, kecamatan: "Bojongloa Kidul" },
        { lat: -6.9400, lng: 107.6400, kecamatan: "Buahbatu" },
        { lat: -6.9000, lng: 107.6200, kecamatan: "Cibeunying Kaler" },
        { lat: -6.9100, lng: 107.6300, kecamatan: "Cibeunying Kidul" },
        { lat: -6.8500, lng: 107.6200, kecamatan: "Cibiru" },
        { lat: -6.9300, lng: 107.6500, kecamatan: "Cicendo" },
        { lat: -6.8800, lng: 107.6500, kecamatan: "Cidadap" },
        { lat: -6.8900, lng: 107.6400, kecamatan: "Cinambo" },
        { lat: -6.9039, lng: 107.6186, kecamatan: "Coblong" },
        { lat: -6.8600, lng: 107.6400, kecamatan: "Gedebage" },
        { lat: -6.9500, lng: 107.6300, kecamatan: "Kiaracondong" },
        { lat: -6.9600, lng: 107.6200, kecamatan: "Lengkong" },
        { lat: -6.9400, lng: 107.5800, kecamatan: "Mandalajati" },
        { lat: -6.9200, lng: 107.5800, kecamatan: "Panyileukan" },
        { lat: -6.9000, lng: 107.5800, kecamatan: "Rancasari" },
        { lat: -6.8800, lng: 107.5700, kecamatan: "Regol" },
        { lat: -6.8700, lng: 107.5600, kecamatan: "Sukajadi" },
        { lat: -6.8600, lng: 107.5500, kecamatan: "Sukasari" },
        { lat: -6.9175, lng: 107.6191, kecamatan: "Sumur Bandung" },
        { lat: -6.8400, lng: 107.5300, kecamatan: "Ujung Berung" },
      ];

      // 🔥 filter kecamatan
      const filtered = kecamatan
        ? rows.filter((r) => r.kecamatan === kecamatan)
        : rows;

      // 🔥 heatmap disabled (flat weight)
      return filtered.map((r) => ({
        lat: r.lat,
        lng: r.lng,
       // weight: 0,
      }));
    } catch (error) {
      throw new ServerActionError(
        "Gagal fetch data heatmap Bandung",
        "500"
      );
    }
  },
  "GET_BANDUNG_HEATMAP_POINTS"
);