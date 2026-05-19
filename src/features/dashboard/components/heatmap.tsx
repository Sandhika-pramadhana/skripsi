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
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import {
  getDataKecamatan,
  type KecamatanData,
} from "@/actions/getData/getDataPenduduk";
import kecamatanGeoJson from "@/data/bandung-kecamatan.json";
import sdGeoJson from "@/data/titik-sd.json";
import smpGeoJson from "@/data/titik-smp.json";
import smaGeoJson from "@/data/titik-sma.json";
import smkGeoJson from "@/data/titik-smk.json";
import kampusGeoJson from "@/data/titik-universitas.json";
import mallGeoJson from "@/data/titik-mall.json";
import kompetitorGeoJson from "@/data/titik-kompetitor.json";
import kantorGeoJson from "@/data/titik-perkantoran.json";
import type { HasilRF, KecamatanFeature, GeoJSONType } from "@/types/def";

// ================= LIST KECAMATAN =================
const BANDUNG_KECAMATAN = [
  "Andir","Antapani","Arcamanik","Astanaanyar","Babakan Ciparay",
  "Bandung Kidul","Bandung Kulon","Bandung Wetan","Batununggal",
  "Bojongloa Kaler","Bojongloa Kidul","Buahbatu","Cibeunying Kaler",
  "Cibeunying Kidul","Cibiru","Cicendo","Cidadap","Cinambo",
  "Coblong","Gedebage","Kiaracondong","Lengkong","Mandalajati",
  "Panyileukan","Rancasari","Regol","Sukajadi","Sukasari",
  "Sumur Bandung","Ujungberung",
];


// ================= NORMALISASI NAMA =================
const normalizeName = (name: string) =>
  name.toLowerCase().replace(/\s+/g, "").trim();

// ================= GROUPING GEOJSON =================
const geoData: GeoJSONType = {
  type: "FeatureCollection",
  features: Object.values(
    (kecamatanGeoJson as any).features.reduce((acc: any, f: any) => {
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

// ================= PRE-COMPUTE TITIK PER KECAMATAN =================
function countPointsPerKecamatan(pointGeoJson: any): Map<string, number> {
  const features = pointGeoJson.features ?? [];
  if (features.length === 0) return new Map();

  const map = new Map<string, number>();
  geoData.features.forEach((feature) => {
    const key = normalizeName(feature.properties.nama_kecamatan);
    let count = 0;
    features.forEach((f: any) => {
      const coords = f.geometry?.coordinates;
      if (!coords) return;
      if (booleanPointInPolygon(point([coords[0], coords[1]]), feature as any)) count++;
    });
    map.set(key, count);
  });
  return map;
}

const sdCountMap         = countPointsPerKecamatan(sdGeoJson);
const smpCountMap        = countPointsPerKecamatan(smpGeoJson);
const smaCountMap        = countPointsPerKecamatan(smaGeoJson);
const smkCountMap        = countPointsPerKecamatan(smkGeoJson);
const kampusCountMap     = countPointsPerKecamatan(kampusGeoJson);
const mallCountMap       = countPointsPerKecamatan(mallGeoJson);
const kantorCountMap     = countPointsPerKecamatan(kantorGeoJson);
const kompetitorCountMap = countPointsPerKecamatan(kompetitorGeoJson);

// ================= HELPER WARNA KELAS =================
const getKelasColor = (kelas?: string) => {
  if (kelas === "Tinggi") return "#16a34a";
  if (kelas === "Sedang") return "#eab308";
  if (kelas === "Rendah") return "#dc2626";
  return "#9ca3af";
};
const getKelasTextColor = (kelas?: string) => {
  if (kelas === "Tinggi") return "#15803d";
  if (kelas === "Sedang") return "#b45309";
  if (kelas === "Rendah") return "#b91c1c";
  return "#6b7280";
};
const getKelasBg = (kelas?: string) => {
  if (kelas === "Tinggi") return "#f0fdf4";
  if (kelas === "Sedang") return "#fefce8";
  if (kelas === "Rendah") return "#fef2f2";
  return "#f9fafb";
};

// ================= ICON FACTORY =================
const createDotIcon = (color: string, delayMs: number = 0) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width:8px;height:8px;
      background:${color};
      border:1.5px solid rgba(255,255,255,0.9);
      border-radius:50%;
      box-shadow:0 0 3px rgba(0,0,0,0.4);
      animation: dotFadeIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
      animation-delay: ${delayMs}ms;
    "></div>`,
    iconSize: [8, 8],
    iconAnchor: [4, 4],
  });

// ================= FADE OUT HELPER =================
function fadeOutAndRemove(group: L.LayerGroup, map: L.Map, duration = 300) {
  let elapsed = 0;
  const timer = setInterval(() => {
    elapsed += 16;
    const opacity = Math.max(0, 1 - elapsed / duration);
    group.eachLayer((l) => {
      const el = (l as L.Marker).getElement();
      if (el) el.style.opacity = String(opacity);
    });
    if (elapsed >= duration) {
      clearInterval(timer);
      group.clearLayers();
      map.removeLayer(group);
    }
  }, 16);
}

// ================= LAYER CONFIG =================
const LAYER_CONFIG = {
  pusatKeramaian: { color: "#F59E0B", label: "Pusat Keramaian", icon: "🏙️" },
  kompetitor:     { color: "#000000", label: "Kompetitor",      icon: "📍" },
} as const;

const PUSAT_KERAMAIAN_SUB = {
  sd:          { color: "#EF4444", label: "SD",          icon: "🏫" },
  smp:         { color: "#3B82F6", label: "SMP",         icon: "🏫" },
  sma:         { color: "#6B7280", label: "SMA",         icon: "🏫" },
  smk:         { color: "#F97316", label: "SMK",         icon: "🏫" },
  kampus:      { color: "#8B5CF6", label: "Kampus",      icon: "🎓" },
  mall:        { color: "#FACC15", label: "Mall",        icon: "🛍️" },
  perkantoran: { color: "#10B981", label: "Perkantoran", icon: "🏢" },
} as const;

type LayerKey = keyof typeof LAYER_CONFIG;

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

// ================= LAYER KECAMATAN FILL (CHOROPLETH) =================
function KecamatanFillLayer({
  selected,
  pendudukMap,
  hasilMap,
  showHeatmap,
  onSelect,
}: {
  selected?: string;
  pendudukMap: Map<string, KecamatanData>;
  hasilMap: Map<string, HasilRF>;
  showHeatmap: boolean;
  onSelect: (name: string) => void;
}) {
  const selectedRef    = useRef(selected);
  const pendudukRef    = useRef(pendudukMap);
  const hasilRef       = useRef(hasilMap);
  const showHeatmapRef = useRef(showHeatmap);
  const onSelectRef    = useRef(onSelect);

  useEffect(() => { selectedRef.current    = selected; },    [selected]);
  useEffect(() => { pendudukRef.current    = pendudukMap; }, [pendudukMap]);
  useEffect(() => { hasilRef.current       = hasilMap; },    [hasilMap]);
  useEffect(() => { showHeatmapRef.current = showHeatmap; }, [showHeatmap]);
  useEffect(() => { onSelectRef.current    = onSelect; },    [onSelect]);

  return (
    <GeoJSON
      key={`fill-${selected}-${hasilMap.size}-${showHeatmap}`}
      data={geoData as any}
      style={(feature: any) => {
        const name       = feature.properties.nama_kecamatan;
        const key        = normalizeName(name);
        const hasil      = hasilMap.get(key);
        const isSelected = name === selected;

        if (!showHeatmap) {
          if (!selected) {
            return { stroke: false, fillColor: "#ffffff", fillOpacity: 0.15 };
          }
          if (isSelected) {
            return { stroke: false, fillColor: "#ffffff", fillOpacity: 0.5 };
          }
          return { stroke: false, fillColor: "#ffffff", fillOpacity: 0.08 };
        }

        return {
          stroke: false,
          fillColor: getKelasColor(hasil?.kelas),
          fillOpacity: isSelected ? 0.9 : 0.65,
        };
      }}
      onEachFeature={(feature, layer) => {
        const name = feature.properties.nama_kecamatan;
        const l    = layer as Path;

        const buildTooltip = () => {
          const key      = normalizeName(name);
          const penduduk = pendudukRef.current.get(key);
          const hasil    = hasilRef.current.get(key);

          const totalPusatKeramaian =
            (sdCountMap.get(key) ?? 0) +
            (smpCountMap.get(key) ?? 0) +
            (smaCountMap.get(key) ?? 0) +
            (smkCountMap.get(key) ?? 0) +
            (kampusCountMap.get(key) ?? 0) +
            (mallCountMap.get(key) ?? 0) +
            (kantorCountMap.get(key) ?? 0);

          const kompetitor = kompetitorCountMap.get(key) ?? 0;

          const jarakHtml = hasil
            ? `<div style="font-size:12px;color:#555;"> Jarak Jalan Utama: <b>${hasil.jarak_jalan_km} km</b></div>`
            : "";

          return `
            <div style="font-size:13px;font-weight:600;color:#222;">${name}</div>
            <div style="font-size:12px;color:#555;"> Penduduk: <b>${penduduk?.jumlah_penduduk?.toLocaleString("id-ID") ?? 0}</b> jiwa</div>
            <div style="font-size:12px;color:#555;"> Pusat Keramaian: <b>${totalPusatKeramaian}</b></div>
            <div style="font-size:12px;color:#555;"> Kompetitor: <b>${kompetitor}</b></div>
            ${jarakHtml}
          `;
        };

        l.bindTooltip(() => buildTooltip(), {
          sticky: true, direction: "top", opacity: 1,
          className: "kecamatan-tooltip",
        });

        l.on({
          mouseover: () => {
            if (name === selectedRef.current) return;
            l.setStyle({ fillOpacity: 0.85 });
          },
          mouseout: () => {
            if (name === selectedRef.current) return;
            l.setStyle({
              fillOpacity: showHeatmapRef.current
                ? 0.65
                : selectedRef.current ? 0.08 : 0.15,
            });
          },
          click: () => {
            const current = selectedRef.current;
            onSelectRef.current(current === name ? "" : name);
          },
        });
      }}
    />
  );
}

// ================= LAYER KECAMATAN STROKE (BORDER) =================
function KecamatanStrokeLayer({ selected }: { selected?: string }) {
  return (
    <GeoJSON
      key={`stroke-${selected ?? "all"}`}
      data={geoData as any}
      style={(feature: any) => {
        const name       = feature.properties.nama_kecamatan;
        const isSelected = name === selected;
        return {
          fill:    false,
          color:   isSelected ? "#0f172a" : "#334155",
          weight:  isSelected ? 2.5 : 1.2,
          opacity: 1,
        };
      }}
    />
  );
}

// ================= LAYER TITIK =================
function PointLayer({
  data,
  layerKey,
  visible,
  nameField,
  colorOverride,
  labelOverride,
  iconOverride,
}: {
  data: any;
  layerKey: LayerKey;
  visible: boolean;
  nameField?: string;
  colorOverride?: string;
  labelOverride?: string;
  iconOverride?: string;
}) {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Fade out dan hapus layer lama
    if (layerRef.current) {
      fadeOutAndRemove(layerRef.current, map);
      layerRef.current = null;
    }

    if (!visible) return;

    const cfg    = LAYER_CONFIG[layerKey];
    const color  = colorOverride ?? cfg.color;
    const label  = labelOverride ?? cfg.label;
    const icon   = iconOverride  ?? cfg.icon;
    const group  = L.layerGroup();
    const features = [...((data as any).features ?? [])];

    features.forEach((f: any, index: number) => {
      const coords = f.geometry?.coordinates;
      if (!coords) return;
      const latlng: L.LatLngExpression = [coords[1], coords[0]];
      const name =
        nameField && f.properties?.[nameField]
          ? f.properties[nameField]
          : f.properties?.name ?? f.properties?.nama ?? label;

      const delay   = Math.min(index * 30, 2000);
      const dotIcon = createDotIcon(color, delay);

      L.marker(latlng, { icon: dotIcon })
        .bindTooltip(
          `<div style="font-size:12px;font-weight:600;color:#222;">${icon} ${name}</div>
           <div style="font-size:11px;color:#777;">${label}</div>`,
          { direction: "top", opacity: 1, className: "kecamatan-tooltip" }
        )
        .addTo(group);
    });

    group.addTo(map);
    layerRef.current = group;
  }, [visible, data, layerKey, map, nameField, colorOverride, labelOverride, iconOverride]);

  return null;
}

// ================= LAYER CENTROID =================
function CentroidLayer({
  visible,
  hasilMap,
}: {
  visible: boolean;
  hasilMap: Map<string, HasilRF>;
}) {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Fade out dan hapus layer lama
    if (layerRef.current) {
      fadeOutAndRemove(layerRef.current, map);
      layerRef.current = null;
    }

    if (!visible) return;

    const group = L.layerGroup();
    let index = 0;

    hasilMap.forEach((hasil) => {
      if (hasil.centroid_lat == null || hasil.centroid_lng == null) return;
      const delay = Math.min(index * 40, 1500);
      index++;
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:10px;height:10px;
          background:#7c3aed;
          border:2px solid white;
          border-radius:50%;
          box-shadow:0 0 5px rgba(124,58,237,0.6), 0 0 2px rgba(0,0,0,0.4);
          animation: dotFadeIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
          animation-delay: ${delay}ms;
        "></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });
      L.marker([hasil.centroid_lat, hasil.centroid_lng], { icon })
        .bindTooltip(
          `<div style="font-size:12px;font-weight:600;color:#222;">📍 Centroid Kecamatan</div>
           <div style="font-size:11px;color:#555;margin-top:2px;">${hasil.kecamatan}</div>
           <div style="font-size:10px;color:#888;margin-top:2px;">
             Lat: ${hasil.centroid_lat}<br/>
             Lng: ${hasil.centroid_lng}
           </div>`,
          { direction: "top", opacity: 1, className: "kecamatan-tooltip" }
        )
        .addTo(group);
    });

    group.addTo(map);
    layerRef.current = group;
  }, [visible, hasilMap, map]);

  return null;
}

// ================= MAIN COMPONENT =================
export default function BandungHeatmapMap() {
  const [kecamatan, setKecamatan]     = useState("");
  const [pendudukMap, setPendudukMap] = useState<Map<string, KecamatanData>>(new Map());
  const [visibleLayers, setVisibleLayers] = useState<Record<LayerKey, boolean>>({
    pusatKeramaian: false,
    kompetitor:     false,
  });
  const [showCentroid, setShowCentroid] = useState(false);
  const [showHeatmap,  setShowHeatmap]  = useState(false);

  const toggleLayer = (key: LayerKey) =>
    setVisibleLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  const [hasilAnalisis, setHasilAnalisis] = useState<HasilRF[]>([]);

  useEffect(() => {
    fetch("/hasil_analisis.json")
      .then((res) => res.json())
      .then((data) => setHasilAnalisis(data));
  }, []);

  const hasilMap = useMemo(() => {
    const map = new Map<string, HasilRF>();
    hasilAnalisis.forEach((d) => {
      map.set(normalizeName(d.kecamatan), d);
    });
    return map;
  }, [hasilAnalisis]);

  const kecamatanList = useMemo(
    () =>
      geoData.features
        .map((f) => f.properties.nama_kecamatan)
        .sort((a, b) => a.localeCompare(b, "id")),
    []
  );

  useEffect(() => {
    const loadData = async () => {
      const penduduk = await getDataKecamatan();
      const pm = new Map<string, KecamatanData>();
      penduduk.forEach((d) => pm.set(normalizeName(d.kecamatan), d));
      setPendudukMap(pm);
    };
    loadData();
  }, []);

  const btnBase     = "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all";
  const btnActive   = "bg-gray-800 text-white border-gray-800 shadow-sm";
  const btnInactive = "bg-white text-gray-600 border-gray-300 hover:border-gray-400";

  return (
    <div>
      {/* SELECT KECAMATAN */}
      <div className="mb-3 flex items-center gap-3 flex-wrap">
        <div className="relative w-[220px]">
          <select
            value={kecamatan}
            onChange={(e) => setKecamatan(e.target.value)}
            className="px-4 py-2 w-full text-sm bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-400 hover:shadow-md transition appearance-none cursor-pointer"
          >
            <option value="">Semua Kecamatan</option>
            {kecamatanList.map((kec) => (
              <option key={kec} value={kec}>{kec}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {kecamatan && (
          <button
            onClick={() => setKecamatan("")}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reset
          </button>
        )}
      </div>

      {/* TOGGLE BUTTONS */}
      <div className="mb-3 flex flex-wrap gap-2">
        <button
          onClick={() => toggleLayer("pusatKeramaian")}
          className={`${btnBase} ${visibleLayers.pusatKeramaian ? btnActive : btnInactive}`}
        >
          Pusat Keramaian
        </button>

        <button
          onClick={() => toggleLayer("kompetitor")}
          className={`${btnBase} ${visibleLayers.kompetitor ? btnActive : btnInactive}`}
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border-2 border-white"
            style={{ backgroundColor: "#000000" }}
          />
          Kompetitor
        </button>

        <button
          onClick={() => setShowCentroid((prev) => !prev)}
          className={`${btnBase} ${showCentroid ? btnActive : btnInactive}`}
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: "#7c3aed" }}
          />
          Centroid
        </button>

        <button
          onClick={() => setShowHeatmap((prev) => !prev)}
          className={`${btnBase} ${showHeatmap ? btnActive : btnInactive}`}
        >
          Heatmap
        </button>
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
          <KecamatanFillLayer
            selected={kecamatan}
            pendudukMap={pendudukMap}
            hasilMap={hasilMap}
            showHeatmap={showHeatmap}
            onSelect={(name) => setKecamatan(name)}
          />
          <KecamatanStrokeLayer selected={kecamatan} />

          <PointLayer data={sdGeoJson}      layerKey="pusatKeramaian" visible={visibleLayers.pusatKeramaian} nameField="nama" colorOverride={PUSAT_KERAMAIAN_SUB.sd.color}          labelOverride={PUSAT_KERAMAIAN_SUB.sd.label}          iconOverride={PUSAT_KERAMAIAN_SUB.sd.icon} />
          <PointLayer data={smpGeoJson}     layerKey="pusatKeramaian" visible={visibleLayers.pusatKeramaian} nameField="nama" colorOverride={PUSAT_KERAMAIAN_SUB.smp.color}         labelOverride={PUSAT_KERAMAIAN_SUB.smp.label}         iconOverride={PUSAT_KERAMAIAN_SUB.smp.icon} />
          <PointLayer data={smaGeoJson}     layerKey="pusatKeramaian" visible={visibleLayers.pusatKeramaian} nameField="nama" colorOverride={PUSAT_KERAMAIAN_SUB.sma.color}         labelOverride={PUSAT_KERAMAIAN_SUB.sma.label}         iconOverride={PUSAT_KERAMAIAN_SUB.sma.icon} />
          <PointLayer data={smkGeoJson}     layerKey="pusatKeramaian" visible={visibleLayers.pusatKeramaian} nameField="nama" colorOverride={PUSAT_KERAMAIAN_SUB.smk.color}         labelOverride={PUSAT_KERAMAIAN_SUB.smk.label}         iconOverride={PUSAT_KERAMAIAN_SUB.smk.icon} />
          <PointLayer data={kampusGeoJson}  layerKey="pusatKeramaian" visible={visibleLayers.pusatKeramaian} nameField="nama" colorOverride={PUSAT_KERAMAIAN_SUB.kampus.color}      labelOverride={PUSAT_KERAMAIAN_SUB.kampus.label}      iconOverride={PUSAT_KERAMAIAN_SUB.kampus.icon} />
          <PointLayer data={mallGeoJson}    layerKey="pusatKeramaian" visible={visibleLayers.pusatKeramaian} nameField="nama" colorOverride={PUSAT_KERAMAIAN_SUB.mall.color}        labelOverride={PUSAT_KERAMAIAN_SUB.mall.label}        iconOverride={PUSAT_KERAMAIAN_SUB.mall.icon} />
          <PointLayer data={kantorGeoJson}  layerKey="pusatKeramaian" visible={visibleLayers.pusatKeramaian} nameField="nama" colorOverride={PUSAT_KERAMAIAN_SUB.perkantoran.color} labelOverride={PUSAT_KERAMAIAN_SUB.perkantoran.label} iconOverride={PUSAT_KERAMAIAN_SUB.perkantoran.icon} />

          <PointLayer data={kompetitorGeoJson} layerKey="kompetitor" visible={visibleLayers.kompetitor} nameField="nama" />

          <CentroidLayer visible={showCentroid} hasilMap={hasilMap} />
        </MapContainer>
      </div>
    </div>
  );
}