"use client";

import {
  SidebarProvider,
  useSidebar,
} from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
import { Map, MapPin, Database } from "lucide-react";

import BandungHeatmapMap from "./components/heatmap";
import AnalisisDashboard from "./components/analisis";  // ← tambah ini

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { open: isSidebarOpen } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AppSidebar />
      <Navbar />

      <div
        className="flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isSidebarOpen ? "260px" : "0",
          width: isSidebarOpen ? "calc(100vw - 260px)" : "100vw",
          paddingTop: "64px",
        }}
      >
        <main className="flex-1 p-6 w-full">
          {children}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 items-center">
              <Map className="w-7 h-7 text-blue-600" />
              <h1 className="font-bold text-2xl">Peta Bandung</h1>
            </div>
          </div>

          {/* MAP */}
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Heatmap Lokasi Usaha
              </h2>

              <BandungHeatmapMap />

              {/* Keterangan Sumber Data */}
              <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
                <h3 className="text-md font-semibold mb-2 flex items-center gap-2 text-gray-800">
                  <Database className="w-4 h-4 text-blue-600" />
                  Sumber dan Variabel Data
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>
                    <strong>Kepadatan Penduduk</strong> diperoleh dari jumlah
                    penduduk per kecamatan di Kota Bandung.
                  </li>
                  <li>
                    <strong>Pusat Keramaian</strong> gabungan seluruh titik
                    pendidikan dan pusat perbelanjaan, meliputi SD, SMP, SMA,
                    SMK, dan Kampus (negeri maupun swasta), serta Mall di tiap
                    kecamatan.
                  </li>
                  <li>
                    <strong>Kompetitor Smoothies Bar</strong> merupakan jumlah
                    usaha minuman sejenis (smoothies, juice bar, minuman sehat)
                    yang telah beroperasi di tiap kecamatan.
                  </li>
                  <li>
                    <strong>Jarak ke Jalan Utama</strong> merupakan rata-rata
                    jarak lokasi usaha ke jalan arteri atau kolektor terdekat di
                    tiap kecamatan, dalam satuan meter.
                  </li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  Sumber: Badan Pusat Statistik (BPS), Dinas Pendidikan Kota
                  Bandung, Google Maps, dan instansi terkait.
                </p>
              </div>
            </div>
          </div>

          {/* ANALYTICS — diganti dengan komponen AnalisisDashboard */}
          <AnalisisDashboard />

        </main>
      </div>
    </div>
  );
}

export default function DashboardSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}