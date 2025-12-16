"use client";

import { SidebarProvider, SidebarTrigger } from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";

/* Component untuk Internal (POSFIN) */
import GtvSection from "./internal/components/gtv";
import UserSection from "./internal/components/user";
import GoalSection from "./internal/components/goal";
import RevenueSection from "./internal/components/revenue";

/* Component untuk Eksternal (Pos IND) */
import UserExternalPosSection from "@/features/dashboard/eksternal/pos/components/user";
import GoalExternalPosSection from "@/features/dashboard/eksternal/pos/components/goal";

/* Component untuk Eksternal (MyTsel) */
import TrxExternalMyTselSection from "@/features/dashboard/eksternal/mytsel/components/trx";
import ListMyTselTransaction from "@/features/dashboard/eksternal/mytsel/components/list-shipping";

import { FilterDateSection } from "../core/components/filter";
import { useState } from "react";
import { HomeIcon } from "lucide-react";
import { BookTrxGraph } from "./internal/components/book_trx";

export default function DashboardSection({ children }: { children: React.ReactNode }) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  
  const [userRole] = useState<"Superadmin" | "Client" | "Client Pos">("Superadmin");

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
      <AppSidebar />

      <div className="flex flex-col flex-1">
        <Navbar />

        <main className="flex-1 p-4">
          <SidebarTrigger />
          {children}

          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <HomeIcon />
              <h1 className="font-bold text-2xl my-4">Dashboard Layanan Kurir</h1>
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

          {userRole === "Superadmin" && (
            <>
              <div className="flex gap-2 mt-2">
                <GoalSection startDate={startDate} endDate={endDate}/>
                <UserSection startDate={startDate} endDate={endDate}/>
              </div>
              <BookTrxGraph startDate={startDate} endDate={endDate}/>
              <div className="flex gap-2 mt-2">
                <RevenueSection startDate={startDate} endDate={endDate}/>
                <GtvSection startDate={startDate} endDate={endDate}/>
              </div>
            </>
          )}

          {userRole === "Client" && (
            <>
              <TrxExternalMyTselSection startDate={startDate} endDate={endDate}/>
              <ListMyTselTransaction/>
            </>
          )}

          {userRole === "Client Pos" && (
            <>
              <div className="flex gap-2 mt-2">
                <GoalExternalPosSection startDate={startDate} endDate={endDate}/>
                <UserExternalPosSection startDate={startDate} endDate={endDate}/>
              </div>
              <BookTrxGraph startDate={startDate} endDate={endDate}/>
            </>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
