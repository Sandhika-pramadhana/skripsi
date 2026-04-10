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

import {
  getDataKecamatan,
  type KecamatanData,
} from "@/actions/getData/getDataPenduduk";

import {
  getDataKampus,
  type KampusData,
} from "@/actions/getData/getDataKampus";

import {
  getDataSekolah,
  type SekolahData,
} from "@/actions/getData/getDataSekolah";

import rawGeoJson from "@/data/bandung-kecamatan.json";

// ================= LIST KECAMATAN =================
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
  properties: { nama_kecamatan: string };
  geometry: { type: "MultiPolygon"; coordinates: any };
};

type GeoJSONType = {
  type: "FeatureCollection";
  features: KecamatanFeature[];
};

// ================= NORMALISASI NAMA =================
const normalizeName = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "").trim();

// ================= GROUPING GEOJSON =================
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
          geometry: { type: "MultiPolygon", coordinates: [] },
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

// ================= LAYER KECAMATAN =================
function KecamatanLayer({
  selected,
  pendudukMap,
  kampusMap,
  sekolahMap,
}: {
  selected?: string;
  pendudukMap: Map<string, KecamatanData>;
  kampusMap: Map<string, KampusData>;
  sekolahMap: Map<string, SekolahData>;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState<number>(map.getZoom());

  const selectedRef = useRef(selected);
  const zoomRef = useRef(zoom);
  const pendudukRef = useRef(pendudukMap);
  const kampusRef = useRef(kampusMap);
  const sekolahRef = useRef(sekolahMap);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    pendudukRef.current = pendudukMap;
  }, [pendudukMap]);

  useEffect(() => {
    kampusRef.current = kampusMap;
  }, [kampusMap]);

  useEffect(() => {
    sekolahRef.current = sekolahMap;
  }, [sekolahMap]);

  // ✅ FIX ERROR: Cleanup tidak mengembalikan nilai
  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on("zoomend", onZoom);

    return () => {
      map.off("zoomend", onZoom);
    };
  }, [map]);

  return (
    <GeoJSON
      key={zoom}
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

        const buildTooltip = () => {
          const key = normalizeName(name);

          const penduduk = pendudukRef.current.get(key);
          const kampus = kampusRef.current.get(key);
          const sekolah = sekolahRef.current.get(key);

          return `
            <div style="font-size:13px;font-weight:600;color:#222;">
              ${name}
            </div>
            <div style="font-size:12px;color:#555;">
              👥 Penduduk: <b>${penduduk?.jumlah_penduduk?.toLocaleString("id-ID") ?? 0}</b> jiwa
            </div>
            <div style="font-size:12px;color:#555;">
              🎓 Kampus: <b>${kampus?.jumlah_kampus ?? 0}</b>
            </div>
            <div style="font-size:12px;color:#555;">
              🏫 Sekolah: <b>${sekolah?.jumlah_sekolah ?? 0}</b>
            </div>
          `;
        };

        l.bindTooltip(() => buildTooltip(), {
          sticky: true,
          direction: "top",
          opacity: 1,
          className: "kecamatan-tooltip",
        });

        l.on({
          mouseover: () => {
            if (name === selectedRef.current) return;
            l.setStyle({ fillOpacity: 0.8 });
          },
          mouseout: () => {
            const currentSelected = selectedRef.current;
            const currentZoom = zoomRef.current;

            if (name === currentSelected) {
              l.setStyle({ fillOpacity: 0.9 });
              return;
            }

            l.setStyle({
              fillOpacity: currentSelected
                ? 0.1
                : Math.min(
                    0.6,
                    Math.max(0.05, (currentZoom - 10) * 0.1)
                  ),
            });
          },
        });
      }}
    />
  );
}

// ================= MAIN COMPONENT =================
export default function BandungHeatmapMap() {
  const [kecamatan, setKecamatan] = useState("");

  const [pendudukMap, setPendudukMap] = useState<
    Map<string, KecamatanData>
  >(new Map());

  const [kampusMap, setKampusMap] = useState<
    Map<string, KampusData>
  >(new Map());

  const [sekolahMap, setSekolahMap] = useState<
    Map<string, SekolahData>
  >(new Map());

  const kecamatanList = useMemo(() => {
    return geoData.features.map(
      (f) => f.properties.nama_kecamatan
    );
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const [penduduk, kampus, sekolah] = await Promise.all([
        getDataKecamatan(),
        getDataKampus(),
        getDataSekolah(),
      ]);

      const pendudukMapped = new Map<string, KecamatanData>();
      penduduk.forEach((d) =>
        pendudukMapped.set(normalizeName(d.kecamatan), d)
      );

      const kampusMapped = new Map<string, KampusData>();
      kampus.forEach((d) =>
        kampusMapped.set(normalizeName(d.kecamatan), d)
      );

      const sekolahMapped = new Map<string, SekolahData>();
      sekolah.forEach((d) =>
        sekolahMapped.set(normalizeName(d.kecamatan), d)
      );

      setPendudukMap(pendudukMapped);
      setKampusMap(kampusMapped);
      setSekolahMap(sekolahMapped);
    };

    loadData();
  }, []);

  return (
    <div>
      {/* Tooltip CSS */}
      <style>{`
        .kecamatan-tooltip {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 6px 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          pointer-events: none;
        }
        .kecamatan-tooltip::before {
          display: none;
        }
      `}</style>

      {/* SELECT KECAMATAN */}
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
          <KecamatanLayer
            selected={kecamatan}
            pendudukMap={pendudukMap}
            kampusMap={kampusMap}
            sekolahMap={sekolahMap}
          />
        </MapContainer>
      </div>
    </div>
  );
}