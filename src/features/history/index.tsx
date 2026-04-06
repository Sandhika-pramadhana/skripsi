"use client";

import {
  SidebarProvider,
  useSidebar,
} from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
import { BarChart3 } from "lucide-react";

// 3 Komponen Model
import ActualPredictionChart from "./components/ActualPredictionChart";
import ModelPerformanceCard from "./components/ModelPerformanceCard";
import PredictionHistoryTable from "./components/PredictionHistoryTable";

function DashboardContent() {
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

          {/* ===== HEADER ===== */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="font-bold text-2xl">
              Model Prediction History
            </h1>
          </div>

          {/* ===== Chart + Performance ===== */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            <div className="xl:col-span-2">
              <ActualPredictionChart />
            </div>

            <ModelPerformanceCard />

          </div>

          {/* ===== Table ===== */}
          <div className="mt-6">
            <PredictionHistoryTable />
          </div>

        </main>
      </div>
    </div>
  );
}

export default function HistorySection() {
  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardContent />
    </SidebarProvider>
  );
}
