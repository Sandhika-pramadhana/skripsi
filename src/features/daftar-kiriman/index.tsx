"use client";

import { SidebarProvider, SidebarTrigger } from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
import ListTransaction from "./components/list-shipping";
import GoalSection from "./components/goal";
import TodaySection from "./components/today";
import { BoxIcon } from "lucide-react";
import { FilterDateSection } from "../core/components/filter";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
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
              <BoxIcon />
            <h1 className="font-bold text-2xl my-4">Daftar Kiriman</h1>
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
            {/* TodaySection */}
            <TodaySection />

            {/* Goal Section */}
            <GoalSection startDate={startDate} endDate={endDate}/>
          </div>

          {/* Booking Graph */}
          <ListTransaction startDate={startDate} endDate={endDate}/>

        </main>
      </div>
    </SidebarProvider>
  );
}