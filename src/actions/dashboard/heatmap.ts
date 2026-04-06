"use server";

import { serverAction, ServerActionError } from "../action";

export type HeatmapPoint = {
  lat: number;
  lng: number;
  weight?: number;
};

export const getBandungHeatmapPoints = serverAction(
  async (): Promise<HeatmapPoint[]> => {
    try {
      const rows = [
        { lat: -6.9175, lng: 107.6191, count: 10 },
        { lat: -6.9039, lng: 107.6186, count: 5 },
        { lat: -6.9147, lng: 107.6098, count: 8 },
      ];

      const max = Math.max(...rows.map(r => r.count ?? 1));

      return rows.map((r) => ({
        lat: r.lat,
        lng: r.lng,
        weight: (r.count ?? 1) / max,
      }));

    } catch (error) {
      console.error("Bandung Heatmap Error:", error);

      throw new ServerActionError(
        "Gagal fetch data heatmap Bandung",
        "500"
      );
    }
  },
  "GET_BANDUNG_HEATMAP_POINTS"
);