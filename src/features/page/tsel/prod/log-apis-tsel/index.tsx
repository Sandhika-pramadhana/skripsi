"use client";

import { SidebarProvider, SidebarTrigger } from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
import ListLogApis from "./components/list-log-apis";
import { useState } from "react";

export default function LogApisSection({
  children,
}: {
  children: React.ReactNode;
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const resetDates = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      {/* min-w-0 WAJIB untuk flex + sidebar */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Navbar */}
        <Navbar />

        {/* Main Section */}
        {/* overflow-x-auto biar table bisa scroll */}
        <main className="flex-1 p-4 overflow-x-auto">
          <SidebarTrigger />

          {children}

          {/* Wrapper table */}
          <div className="w-full overflow-x-auto">
            <ListLogApis />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
