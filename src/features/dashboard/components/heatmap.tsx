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
import hasilAnalisis from "@/data/hasil_analisis.json";


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
type HasilRF = {
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
  const map = new Map<string, number>();
  geoData.features.forEach((feature) => {
    const key = normalizeName(feature.properties.nama_kecamatan);
    let count = 0;
    (pointGeoJson.features ?? []).forEach((f: any) => {
      const coords = f.geometry?.coordinates;
      if (!coords) return;
      const pt = point([coords[0], coords[1]]);
      if (booleanPointInPolygon(pt, feature as any)) count++;
    });
    map.set(key, count);
  });
  return map;
}

// Dihitung sekali saat module load
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


// ================= LAYER CONFIG =================
const LAYER_CONFIG = {
  pusatKeramaian: { color: "#F59E0B", label: "Pusat Keramaian", icon: "🏙️" },
  kompetitor:     { color: "#000000", label: "Kompetitor",      icon: "📍" },
} as const;

const PUSAT_KERAMAIAN_SUB = {
  sd:          { color: "#3B82F6", label: "SD",          icon: "🏫" },
  smp:         { color: "#10B981", label: "SMP",         icon: "🏫" },
  sma:         { color: "#F59E0B", label: "SMA",         icon: "🏫" },
  smk:         { color: "#F97316", label: "SMK",         icon: "🏫" },
  kampus:      { color: "#8B5CF6", label: "Kampus",      icon: "🎓" },
  mall:        { color: "#EF4444", label: "Mall",        icon: "🛍️" },
  perkantoran: { color: "#0EA5E9", label: "Perkantoran", icon: "🏢" },
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

  const leafletLayersRef = useRef<Map<string, L.Path>>(new Map());
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => { selectedRef.current    = selected; },    [selected]);
  useEffect(() => { pendudukRef.current    = pendudukMap; }, [pendudukMap]);
  useEffect(() => { hasilRef.current       = hasilMap; },    [hasilMap]);
  useEffect(() => { showHeatmapRef.current = showHeatmap; }, [showHeatmap]);
  useEffect(() => { onSelectRef.current    = onSelect; },    [onSelect]);

  // ── Update style saat selected berubah ──
  useEffect(() => {
    const layers = leafletLayersRef.current;
    if (layers.size === 0) return;
    layers.forEach((layer, name) => {
      const key   = normalizeName(name);
      const hasil = hasilRef.current.get(key);
      const isSel = name === selected;
      if (showHeatmapRef.current) {
        layer.setStyle({
          fillColor:   getKelasColor(hasil?.kelas),
          fillOpacity: isSel ? 0.9 : 0.65,
        });
      } else {
        if (!selected) {
          layer.setStyle({ fillColor: "#ffffff", fillOpacity: 0.15 });
        } else {
          layer.setStyle({
            fillColor:   "#ffffff",
            fillOpacity: isSel ? 0.5 : 0.08,
          });
        }
      }
    });
  }, [selected]);

  // ── Animasi fade heatmap ──
  useEffect(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const layers = leafletLayersRef.current;
    if (layers.size === 0) return;
    const DURATION = 600;
    const startTime = performance.now();

    if (showHeatmap) {
      const animate = (now: number) => {
        const progress = Math.min((now - startTime) / DURATION, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        layers.forEach((layer, name) => {
          const key      = normalizeName(name);
          const hasil    = hasilRef.current.get(key);
          const isSel    = name === selectedRef.current;
          const targetOp = isSel ? 0.9 : 0.65;
          layer.setStyle({
            fillColor:   getKelasColor(hasil?.kelas),
            fillOpacity: eased * targetOp,
          });
        });
        if (progress < 1) animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      const animate = (now: number) => {
        const progress = Math.min((now - startTime) / DURATION, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        layers.forEach((layer, name) => {
          const isSel  = name === selectedRef.current;
          const fromOp = isSel ? 0.9 : 0.65;
          const toOp   = selectedRef.current
            ? (isSel ? 0.5 : 0.08)
            : 0.15;
          layer.setStyle({
            fillColor:   "#ffffff",
            fillOpacity: fromOp + (toOp - fromOp) * eased,
          });
        });
        if (progress < 1) animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [showHeatmap]);

  return (
    <GeoJSON
      key="fill-layer"
      data={geoData as any}
      style={() => ({ stroke: false, fillColor: "#ffffff", fillOpacity: 0.15 })}
      onEachFeature={(feature, layer) => {
        const name = feature.properties.nama_kecamatan;
        const l    = layer as Path;
        leafletLayersRef.current.set(name, l);

        const buildTooltip = () => {
          const key      = normalizeName(name);
          const penduduk = pendudukRef.current.get(key);
          const hasil    = hasilRef.current.get(key);  // ← tambah ini
        
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
            ? `<div style="font-size:12px;color:#555;">🛣️ Jarak Jalan Utama: <b>${hasil.jarak_jalan_km} km</b></div>`
            : "";
        
          return `
            <div style="font-size:13px;font-weight:600;color:#222;">${name}</div>
            <div style="font-size:12px;color:#555;">👥 Penduduk: <b>${penduduk?.jumlah_penduduk?.toLocaleString("id-ID") ?? 0}</b> jiwa</div>
            <div style="font-size:12px;color:#555;">🏙️ Pusat Keramaian: <b>${totalPusatKeramaian}</b></div>
            <div style="font-size:12px;color:#555;">🏪 Kompetitor: <b>${kompetitor}</b></div>
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
    if (layerRef.current) {
      layerRef.current.clearLayers();
      map.removeLayer(layerRef.current);
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

    return () => {
      if (layerRef.current) {
        layerRef.current.clearLayers();
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
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
    if (layerRef.current) {
      layerRef.current.clearLayers();
      map.removeLayer(layerRef.current);
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

    return () => {
      if (layerRef.current) {
        layerRef.current.clearLayers();
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [visible, hasilMap, map]);

  return null;
}


// ================= DETAIL PANEL =================
function DetailPanel({ hasil }: { hasil: HasilRF | undefined }) {
  if (!hasil) return null;
  const kelasColor = getKelasTextColor(hasil.kelas);
  const kelasBg    = getKelasBg(hasil.kelas);
  return (
    <div style={{
      marginTop: "12px", background: "#fff",
      border: "1px solid #e5e7eb", borderRadius: "12px",
      padding: "14px 16px", fontSize: "13px", lineHeight: "1.6",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontWeight: 600, fontSize: "14px", color: "#111" }}>{hasil.kecamatan}</span>
        <span style={{
          background: kelasBg, color: kelasColor, fontWeight: 600,
          fontSize: "12px", padding: "3px 10px", borderRadius: "20px",
          border: `1px solid ${kelasColor}33`,
        }}>
          {hasil.level_lokasi}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
        {[
          { label: "Peluang",    value: `${hasil.kelas} (${hasil.kepercayaan_persen}%)` },
          { label: "Kepadatan",  value: `${hasil.kepadatan_jiwa_km2.toLocaleString("id-ID")} jiwa/km²` },
          { label: "Skor POI",   value: hasil.skor_poi.toString() },
          { label: "Kompetitor", value: `${hasil.jumlah_kompetitor} dalam 1 km` },
        ].map((item) => (
          <div key={item.label} style={{ background: "#f9fafb", borderRadius: "8px", padding: "8px 10px" }}>
            <div style={{ color: "#6b7280", fontSize: "11px" }}>{item.label}</div>
            <div style={{ color: "#111", fontWeight: 600, fontSize: "12px" }}>{item.value}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: "8px" }}>
        {hasil.poin_analisis.map((poin, i) => (
          <div key={i} style={{
            color: "#374151", fontSize: "12px",
            paddingLeft: "10px", borderLeft: `2px solid ${kelasColor}`, marginBottom: "4px",
          }}>
            {poin}
          </div>
        ))}
      </div>
      <div style={{
        background: kelasBg, borderRadius: "8px", padding: "8px 10px",
        color: kelasColor, fontSize: "12px", fontWeight: 500,
      }}>
        💡 {hasil.rekomendasi}
      </div>
    </div>
  );
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

  const hasilMap = useMemo(() => {
    const map = new Map<string, HasilRF>();
    (hasilAnalisis as HasilRF[]).forEach((d) => {
      map.set(normalizeName(d.kecamatan), d);
    });
    return map;
  }, []);

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

  return (
    <div>
      <style>{`
        @keyframes dotFadeIn {
          from { opacity: 0; transform: scale(0) translateY(-6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .kecamatan-tooltip {
          background: white; border: 1px solid #ddd;
          border-radius: 8px; padding: 6px 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15); pointer-events: none;
        }
        .kecamatan-tooltip::before { display: none; }
        .leaflet-interactive { cursor: pointer; }
      `}</style>

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
        {(Object.keys(LAYER_CONFIG) as LayerKey[]).map((key) => {
          const cfg    = LAYER_CONFIG[key];
          const active = visibleLayers[key];
          return (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                active
                  ? "text-white shadow-sm"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
              style={active ? { backgroundColor: cfg.color, borderColor: cfg.color } : {}}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full border border-white/60"
                style={{ backgroundColor: active ? "rgba(255,255,255,0.8)" : cfg.color }}
              />
              {cfg.label}
            </button>
          );
        })}

        {/* TOGGLE CENTROID */}
        <button
          onClick={() => setShowCentroid((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            showCentroid
              ? "text-white shadow-sm"
              : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
          }`}
          style={showCentroid ? { backgroundColor: "#7c3aed", borderColor: "#7c3aed" } : {}}
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-white/60"
            style={{ backgroundColor: showCentroid ? "rgba(255,255,255,0.8)" : "#7c3aed" }}
          />
          Centroid
        </button>

        {/* TOGGLE HEATMAP */}
        <button
          onClick={() => setShowHeatmap((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            showHeatmap
              ? "text-white shadow-sm"
              : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
          }`}
          style={showHeatmap ? { backgroundColor: "#64748b", borderColor: "#64748b" } : {}}
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-white/60"
            style={{ backgroundColor: showHeatmap ? "rgba(255,255,255,0.8)" : "#64748b" }}
          />
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

          {/* ── PUSAT KERAMAIAN ── */}
          <PointLayer data={sdGeoJson}         layerKey="pusatKeramaian" visible={visibleLayers.pusatKeramaian} nameField="nama" colorOverride={PUSAT_KERAMAIAN_SUB.sd.color}          labelOverride={PUSAT_KERAMAIAN_SUB.sd.label}          iconOverride={PUSAT_KERAMAIAN_SUB.sd.icon} />
          <PointLayer data={smpGeoJson}        layerKey="pusatKeramaian" visible={visibleLayers.pusatKeramaian} nameField="nama" colorOverride={PUSAT_KERAMAIAN_SUB.smp.color}         labelOverride={PUSAT_KERAMAIAN_SUB.smp.label}         iconOverride={PUSAT_KERAMAIAN_SUB.smp.icon} />
          <PointLayer data={smaGeoJson}        layerKey="pusatKeramaian" visible={visibleLayers.pusatKeramaian} nameField="nama" colorOverride={PUSAT_KERAMAIAN_SUB.sma.color}         labelOverride={PUSAT_KERAMAIAN_SUB.sma.label}         iconOverride={PUSAT_KERAMAIAN_SUB.sma.icon} />
          <PointLayer data={smkGeoJson}        layerKey="pusatKeramaian" visible={visibleLayers.pusatKeramaian} nameField="nama" colorOverride={PUSAT_KERAMAIAN_SUB.smk.color}         labelOverride={PUSAT_KERAMAIAN_SUB.smk.label}         iconOverride={PUSAT_KERAMAIAN_SUB.smk.icon} />
          <PointLayer data={kampusGeoJson}     layerKey="pusatKeramaian" visible={visibleLayers.pusatKeramaian} nameField="nama" colorOverride={PUSAT_KERAMAIAN_SUB.kampus.color}      labelOverride={PUSAT_KERAMAIAN_SUB.kampus.label}      iconOverride={PUSAT_KERAMAIAN_SUB.kampus.icon} />
          <PointLayer data={mallGeoJson}       layerKey="pusatKeramaian" visible={visibleLayers.pusatKeramaian} nameField="nama" colorOverride={PUSAT_KERAMAIAN_SUB.mall.color}        labelOverride={PUSAT_KERAMAIAN_SUB.mall.label}        iconOverride={PUSAT_KERAMAIAN_SUB.mall.icon} />
          <PointLayer data={kantorGeoJson}     layerKey="pusatKeramaian" visible={visibleLayers.pusatKeramaian} nameField="nama" colorOverride={PUSAT_KERAMAIAN_SUB.perkantoran.color} labelOverride={PUSAT_KERAMAIAN_SUB.perkantoran.label} iconOverride={PUSAT_KERAMAIAN_SUB.perkantoran.icon} />

          {/* ── KOMPETITOR ── */}
          <PointLayer data={kompetitorGeoJson} layerKey="kompetitor" visible={visibleLayers.kompetitor} nameField="nama" />

          <CentroidLayer visible={showCentroid} hasilMap={hasilMap} />
        </MapContainer>
      </div>
      
    </div>
  );
}