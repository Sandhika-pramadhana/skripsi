import React from "react";
import { useSidebar } from "@/features/core/components/ui/sidebar";

const Navbar: React.FC = () => {
  const { open: isSidebarOpen } = useSidebar();

  return (
    <nav
      className="fixed top-0 right-0 px-6 py-3 bg-white border-b shadow-sm z-50 h-16 flex items-center justify-between transition-all duration-300"
      style={{
        left: isSidebarOpen ? "260px" : "0",
        width: isSidebarOpen ? "calc(100vw - 260px)" : "100vw",
      }}
    >
      <div className="flex items-center ml-10 mt-2">
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">
          Dashboard Analisis Potensi Lokasi Smoothies Bar
          </h1>
          <p className="text-xs text-gray-500 font-medium">
          Kota Bandung - Geospatial Analysis
          </p>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
