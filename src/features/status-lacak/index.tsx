"use client";

import { SidebarProvider, SidebarTrigger } from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
import ListTransaction from "./components/list-shipping";
import { StatusKirimSection } from "./components/status-kirim";
import GoalSection from "./components/goal";
import { FilterDateSection } from "../core/components/filter";
import { useState } from "react";
import { SendIcon } from "lucide-react";

export default function StatusLacakPage({ children }: { children: React.ReactNode }) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const resetDates = () => {
    setStartDate('');
    setEndDate('');
  };
  
  return (
    <SidebarProvider>
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <Navbar />

        {/* Main Section */}
        <main className="flex-1 p-4">
          <SidebarTrigger />
          {children}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <SendIcon />
              <h1 className="font-bold text-2xl my-4">Status Lacak</h1>
            </div>
            <div>
              <FilterDateSection
                startDate={startDate}
                endDate={endDate}
                onDateChange={handleDateChange}
                onReset={resetDates}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-2">

            {/* Pencapaian Section */}
            <GoalSection startDate={startDate} endDate={endDate}/>

            {/* Status Lacak */}
            <StatusKirimSection startDate={startDate} endDate={endDate}/>
            
          </div>

          {/* List Shipping with Status */}
          <ListTransaction />

        </main>
      </div>
    </SidebarProvider>
  );
}