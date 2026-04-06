"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

import {
  getBandungHeatmapPoints,
  type HeatmapPoint,
} from "@/actions/dashboard/heatmap";

function Heatmap({ points }: { points: HeatmapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    const heatPoints = points.map((p) => [
      p.lat,
      p.lng,
      p.weight ?? 1,
    ]);

    const heatLayer = (L as any).heatLayer(heatPoints, {
      radius: 25,
      blur: 20,
      maxZoom: 18,
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [points, map]);

  return null;
}

export default function BandungHeatmapMap() {
  const [points, setPoints] = useState<HeatmapPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getBandungHeatmapPoints();
        if (res.success) {
          setPoints(res.data);
        }
      } catch (err) {
        console.error("Heatmap fetch error:", err);
      }
    };

    load();
  }, []);

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg relative z-0">
      <MapContainer
        center={[-6.9175, 107.6191]}
        zoom={12}
        scrollWheelZoom
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <Heatmap points={points} />
      </MapContainer>
    </div>
  );
}