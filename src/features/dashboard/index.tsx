"use client";

import {
  SidebarProvider,
  useSidebar,
} from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
import { Map, Activity, MapPin } from "lucide-react";

import BandungHeatmapMap from "./components/heatmap";

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
              <h1 className="font-bold text-2xl">
                Peta Bandung
              </h1>
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
            </div>
          </div>

          {/* ANALYTICS */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Statistik */}
            <div className="xl:col-span-2 bg-white rounded-xl shadow-lg border p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Analisis Aktivitas Lokasi
              </h2>

              <p className="text-gray-600">
                Area dengan warna merah menunjukkan kepadatan aktivitas usaha
                lebih tinggi. Area biru menunjukkan potensi lokasi usaha baru.
              </p>
            </div>

            {/* Info Area */}
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Informasi Area
              </h2>

              <ul className="text-gray-600 space-y-2">
                <li>🔴 Merah → Aktivitas tinggi</li>
                <li>🟡 Kuning → Aktivitas sedang</li>
                <li>🔵 Biru → Potensi lokasi baru</li>
              </ul>
            </div>

          </div>

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