"use client";

import { SidebarProvider, SidebarTrigger } from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
import { TrafficGraph } from "./components/traffic";
import { Globe2Icon } from "lucide-react";
// import MetricCardSection from "./components/metric";
import ListTrafficMyTsel from "./components/table/list-traffic";
import { CumulativeTrafficBar } from "./components/cumulative-traffic";
import { FilterDateSection } from "@/features/core/components/filter";
import { useState } from "react";

export default function TrafficSection({ children }: { children: React.ReactNode }) {
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
              <Globe2Icon />
              <h1 className="font-bold text-2xl my-4">Analisis Traffic</h1>
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
              <div className="w-full">
                <CumulativeTrafficBar startDate={startDate} endDate={endDate} />
              </div>
              <div className="w-full">
                <TrafficGraph startDate={startDate} endDate={endDate}/>
              </div>
          </div>
          
          <ListTrafficMyTsel startDate={startDate} endDate={endDate}/>

        </main>
      </div>
    </SidebarProvider>
  );
}