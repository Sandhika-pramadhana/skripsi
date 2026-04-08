"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  GeoJSON,
} from "react-leaflet";
import L, { Path } from "leaflet";
import "leaflet.heat";

import {
  getBandungHeatmapPoints,
  type HeatmapPoint,
} from "@/actions/dashboard/heatmap";

import rawGeoJson from "@/data/bandung-kecamatan.json";

// ================= LIST =================
const BANDUNG_KECAMATAN = [
  "Andir","Antapani","Arcamanik","Astanaanyar","Babakan Ciparay",
  "Bandung Kidul","Bandung Kulon","Bandung Wetan","Batununggal",
  "Bojongloa Kaler","Bojongloa Kidul","Buahbatu","Cibeunying Kaler",
  "Cibeunying Kidul","Cibiru","Cicendo","Cidadap","Cinambo",
  "Coblong","Gedebage","Kiaracondong","Lengkong","Mandalajati",
  "Panyileukan","Rancasari","Regol","Sukajadi","Sukasari",
  "Sumur Bandung","Ujung Berung"
];

// ================= TYPES =================
type KecamatanFeature = {
  type: "Feature";
  properties: {
    nama_kecamatan: string;
  };
  geometry: {
    type: "MultiPolygon";
    coordinates: any;
  };
};

type GeoJSONType = {
  type: "FeatureCollection";
  features: KecamatanFeature[];
};

// ================= GROUPING =================
const geoData: GeoJSONType = {
  type: "FeatureCollection",
  features: Object.values(
    (rawGeoJson as any).features.reduce((acc: any, f: any) => {
      const kec = f.properties.nama_kecamatan;

      if (!BANDUNG_KECAMATAN.includes(kec)) return acc;

      if (!acc[kec]) {
        acc[kec] = {
          type: "Feature",
          properties: { nama_kecamatan: kec },
          geometry: {
            type: "MultiPolygon",
            coordinates: [],
          },
        };
      }

      if (f.geometry.type === "Polygon") {
        acc[kec].geometry.coordinates.push(f.geometry.coordinates);
      } else if (f.geometry.type === "MultiPolygon") {
        acc[kec].geometry.coordinates.push(...f.geometry.coordinates);
      }

      return acc;
    }, {})
  ),
};

// ================= HEATMAP =================
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

// ================= AUTO ZOOM =================
function ZoomController({ selected }: { selected?: string }) {
  const map = useMap();

  useEffect(() => {
    if (!selected) {
      const layer = L.geoJSON(geoData as any);
      map.fitBounds(layer.getBounds(), { padding: [20, 20] });
      return;
    }

    const feature = geoData.features.find(
      (f) => f.properties.nama_kecamatan === selected
    );

    if (feature) {
      const layer = L.geoJSON(feature as any);
      map.fitBounds(layer.getBounds(), { padding: [20, 20] });
    }
  }, [selected, map]);

  return null;
}

// ================= LAYER =================
function KecamatanLayer({ selected }: { selected?: string }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  // ✅ FIX: useRef agar closure di event handler selalu baca nilai terbaru
  const selectedRef = useRef(selected);
  const zoomRef = useRef(zoom);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on("zoomend", onZoom);
    return () => {
      map.off("zoomend", onZoom);
    };
  }, [map]);

  return (
    <GeoJSON
      data={geoData as any}
      style={(feature: any) => {
        const name = feature.properties.nama_kecamatan;

        const dynamicOpacity = Math.min(
          0.6,
          Math.max(0.05, (zoom - 10) * 0.1)
        );

        if (!selected) {
          return {
            color: "#000",
            weight: 2,
            fillColor: "#ffffff",
            fillOpacity: dynamicOpacity,
          };
        }

        if (name === selected) {
          return {
            color: "#000",
            weight: 3,
            fillColor: "#ffffff",
            fillOpacity: 0.9,
          };
        }

        return {
          color: "#000",
          weight: 1,
          fillColor: "#ffffff",
          fillOpacity: dynamicOpacity * 0.5,
        };
      }}
      onEachFeature={(feature, layer) => {
        const name = feature.properties.nama_kecamatan;
        const l = layer as Path;

        l.bindTooltip(name);

        l.on({
          mouseover: () => {
            // ✅ Jangan override highlight kecamatan yang sedang dipilih
            if (name === selectedRef.current) return;
            l.setStyle({ fillOpacity: 0.8 });
          },
          mouseout: () => {
            // ✅ Baca ref terbaru, bukan nilai dari closure lama
            const currentSelected = selectedRef.current;
            const currentZoom = zoomRef.current;

            if (name === currentSelected) {
              // Pertahankan highlight kecamatan yang dipilih
              l.setStyle({ fillOpacity: 0.9 });
              return;
            }

            l.setStyle({
              fillOpacity: currentSelected
                ? 0.1
                : Math.min(0.6, Math.max(0.05, (currentZoom - 10) * 0.1)),
            });
          },
        });
      }}
    />
  );
}

// ================= MAIN =================
export default function BandungHeatmapMap() {
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [kecamatan, setKecamatan] = useState("");

  const kecamatanList = useMemo(() => {
    return geoData.features.map(
      (f) => f.properties.nama_kecamatan
    );
  }, []);

  useEffect(() => {
    const load = async () => {
      const res = await getBandungHeatmapPoints(
        kecamatan || undefined
      );
      if (res.success) setPoints(res.data);
    };

    load();
  }, [kecamatan]);

  return (
    <div>
      {/* SELECT */}
      <div className="mb-4 relative w-[260px]">
        <select
          value={kecamatan}
          onChange={(e) => setKecamatan(e.target.value)}
          className="px-4 py-2 w-full text-sm bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 hover:shadow-md transition appearance-none cursor-pointer"
        >
          <option value="">Semua Kecamatan</option>
          {kecamatanList.map((kec) => (
            <option key={kec} value={kec}>
              {kec}
            </option>
          ))}
        </select>

        {/* ICON */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* MAP */}
      <div className="w-full h-[400px] rounded-xl overflow-hidden relative z-0">
        <MapContainer
          center={[-6.9175, 107.6191]}
          zoom={12}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <ZoomController selected={kecamatan} />
          <KecamatanLayer selected={kecamatan} />

          <Heatmap points={points} />
        </MapContainer>
      </div>
    </div>
  );
}