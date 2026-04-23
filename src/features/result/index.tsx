"use client";

import {
  SidebarProvider,
  useSidebar,
} from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";

import ResultPage from "./components/result";

function ResultContent() {
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
        <main className="flex-1 w-full">
          <ResultPage />
        </main>
      </div>
    </div>
  );
}

export default function ResultSection() {
  return (
    <SidebarProvider defaultOpen={true}>
      <ResultContent />
    </SidebarProvider>
  );
}