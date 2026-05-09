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
const createDotIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width:8px;height:8px;
      background:${color};
      border:1.5px solid rgba(255,255,255,0.9);
      border-radius:50%;
      box-shadow:0 0 3px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [8, 8],
    iconAnchor: [4, 4],
  });

const LAYER_CONFIG = {
  sd:          { color: "#3B82F6", label: "SD",          icon: "🏫" },
  smp:         { color: "#10B981", label: "SMP",         icon: "🏫" },
  sma:         { color: "#F59E0B", label: "SMA",         icon: "🏫" },
  smk:         { color: "#F97316", label: "SMK",         icon: "🏫" },
  kampus:      { color: "#8B5CF6", label: "Kampus",      icon: "🎓" },
  mall:        { color: "#EF4444", label: "Mall",        icon: "🛍️" },
  perkantoran: { color: "#0EA5E9", label: "Perkantoran", icon: "🏢" },
  kompetitor:  { color: "#000000", label: "Kompetitor",  icon: "📍" },
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
  kampusMap,
  sekolahMap,
  hasilMap,
  showHeatmap,
}: {
  selected?: string;
  pendudukMap: Map<string, KecamatanData>;
  kampusMap: Map<string, KampusData>;
  sekolahMap: Map<string, SekolahData>;
  hasilMap: Map<string, HasilRF>;
  showHeatmap: boolean;
}) {
  const selectedRef    = useRef(selected);
  const pendudukRef    = useRef(pendudukMap);
  const kampusRef      = useRef(kampusMap);
  const sekolahRef     = useRef(sekolahMap);
  const hasilRef       = useRef(hasilMap);
  const showHeatmapRef = useRef(showHeatmap);

  useEffect(() => { selectedRef.current    = selected; },    [selected]);
  useEffect(() => { pendudukRef.current    = pendudukMap; }, [pendudukMap]);
  useEffect(() => { kampusRef.current      = kampusMap; },   [kampusMap]);
  useEffect(() => { sekolahRef.current     = sekolahMap; },  [sekolahMap]);
  useEffect(() => { hasilRef.current       = hasilMap; },    [hasilMap]);
  useEffect(() => { showHeatmapRef.current = showHeatmap; }, [showHeatmap]);


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
          const kampus   = kampusRef.current.get(key);
          const sekolah  = sekolahRef.current.get(key);
          const hasil    = hasilRef.current.get(key);
          const textColor = getKelasTextColor(hasil?.kelas);

          const kelasHtml = hasil ? `
            <div style="margin-top:6px;padding-top:6px;border-top:1px solid #eee;">
              <div style="font-size:12px;color:#555;">
                📊 Peluang: <b style="color:${textColor}">${hasil.kelas}</b>
                <span style="color:#999;font-size:11px;"> (${hasil.kepercayaan_persen}%)</span>
              </div>
              <div style="font-size:12px;color:#555;">🏆 Level: <b>${hasil.level_lokasi}</b></div>
              <div style="font-size:12px;color:#555;">🏪 Kompetitor: <b>${hasil.jumlah_kompetitor}</b></div>
            </div>` : "";

          return `
            <div style="font-size:13px;font-weight:600;color:#222;">${name}</div>
            <div style="font-size:12px;color:#555;">👥 Penduduk: <b>${penduduk?.jumlah_penduduk?.toLocaleString("id-ID") ?? 0}</b> jiwa</div>
            <div style="font-size:12px;color:#555;">🎓 Kampus: <b>${kampus?.jumlah_kampus ?? 0}</b></div>
            <div style="font-size:12px;color:#555;">🏫 Sekolah: <b>${sekolah?.jumlah_sekolah ?? 0}</b></div>
            ${kelasHtml}
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
            l.setStyle({ fillOpacity: showHeatmapRef.current ? 0.65 : 0.08 });
          },
        });
      }}
    />
  );
}

// ================= LAYER KECAMATAN STROKE (BORDER) =================
function KecamatanStrokeLayer({
  selected,
  hasilMap,
}: {
  selected?: string;
  hasilMap: Map<string, HasilRF>;
}) {
  return (
    <GeoJSON
      key={`stroke-${selected}-${hasilMap.size}`}
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
  data, layerKey, visible, nameField,
}: {
  data: any; layerKey: LayerKey; visible: boolean; nameField?: string;
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

    const cfg   = LAYER_CONFIG[layerKey];
    const icon  = createDotIcon(cfg.color);
    const group = L.layerGroup();

    (data as any).features?.forEach((f: any) => {
      const coords = f.geometry?.coordinates;
      if (!coords) return;
      const latlng: L.LatLngExpression = [coords[1], coords[0]];
      const name =
        nameField && f.properties?.[nameField]
          ? f.properties[nameField]
          : f.properties?.name ?? f.properties?.nama ?? cfg.label;

      L.marker(latlng, { icon })
        .bindTooltip(
          `<div style="font-size:12px;font-weight:600;color:#222;">${cfg.icon} ${name}</div>
           <div style="font-size:11px;color:#777;">${cfg.label}</div>`,
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
  }, [visible, data, layerKey, map, nameField]);

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

    hasilMap.forEach((hasil) => {
      if (hasil.centroid_lat == null || hasil.centroid_lng == null) return;

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:10px;height:10px;
          background:#7c3aed;
          border:2px solid white;
          border-radius:50%;
          box-shadow:0 0 5px rgba(124,58,237,0.6), 0 0 2px rgba(0,0,0,0.4);
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
  const [kampusMap,   setKampusMap]   = useState<Map<string, KampusData>>(new Map());
  const [sekolahMap,  setSekolahMap]  = useState<Map<string, SekolahData>>(new Map());

  const [visibleLayers, setVisibleLayers] = useState<Record<LayerKey, boolean>>({
    sd: false, smp: false, sma: false, smk: false,
    kampus: false, mall: false, kompetitor: false, perkantoran: false,
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

  const selectedHasil = useMemo(() => {
    if (!kecamatan) return undefined;
    return hasilMap.get(normalizeName(kecamatan));
  }, [kecamatan, hasilMap]);

  const kecamatanList = useMemo(
    () =>
      geoData.features
        .map((f) => f.properties.nama_kecamatan)
        .sort((a, b) => a.localeCompare(b, "id")),
    []
  );

  useEffect(() => {
    const loadData = async () => {
      const [penduduk, kampus, sekolah] = await Promise.all([
        getDataKecamatan(), getDataKampus(), getDataSekolah(),
      ]);
      const pm = new Map<string, KecamatanData>();
      penduduk.forEach((d) => pm.set(normalizeName(d.kecamatan), d));
      const km = new Map<string, KampusData>();
      kampus.forEach((d) => km.set(normalizeName(d.kecamatan), d));
      const sm = new Map<string, SekolahData>();
      sekolah.forEach((d) => sm.set(normalizeName(d.kecamatan), d));
      setPendudukMap(pm);
      setKampusMap(km);
      setSekolahMap(sm);
    };
    loadData();
  }, []);

  return (
    <div>
      <style>{`
        .kecamatan-tooltip {
          background: white; border: 1px solid #ddd;
          border-radius: 8px; padding: 6px 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15); pointer-events: none;
        }
        .kecamatan-tooltip::before { display: none; }
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
      </div>

      {/* TOGGLE LAYER TITIK + CENTROID + HEATMAP */}
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
            kampusMap={kampusMap}
            sekolahMap={sekolahMap}
            hasilMap={hasilMap}
            showHeatmap={showHeatmap}
          />
          <KecamatanStrokeLayer
            selected={kecamatan}
            hasilMap={hasilMap}
          />
          <PointLayer data={sdGeoJson}         layerKey="sd"          visible={visibleLayers.sd}          nameField="nama" />
          <PointLayer data={smpGeoJson}        layerKey="smp"         visible={visibleLayers.smp}         nameField="nama" />
          <PointLayer data={smaGeoJson}        layerKey="sma"         visible={visibleLayers.sma}         nameField="nama" />
          <PointLayer data={smkGeoJson}        layerKey="smk"         visible={visibleLayers.smk}         nameField="nama" />
          <PointLayer data={kampusGeoJson}     layerKey="kampus"      visible={visibleLayers.kampus}      nameField="nama" />
          <PointLayer data={mallGeoJson}       layerKey="mall"        visible={visibleLayers.mall}        nameField="nama" />
          <PointLayer data={kompetitorGeoJson} layerKey="kompetitor"  visible={visibleLayers.kompetitor}  nameField="nama" />
          <PointLayer data={kantorGeoJson}     layerKey="perkantoran" visible={visibleLayers.perkantoran} nameField="nama" />
          <CentroidLayer visible={showCentroid} hasilMap={hasilMap} />
        </MapContainer>
      </div>

      {/* DETAIL PANEL */}
      {kecamatan && <DetailPanel hasil={selectedHasil} />}
    </div>
  );
}