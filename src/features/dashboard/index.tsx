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
// import GtvExternalPosSection from "@/features/dashboard/eksternal/pos/components/gtv";
// import TrxExternalPosSection from "@/features/dashboard/eksternal/pos/components/trx";
// import BookingExternalPosSection from "@/features/dashboard/eksternal/pos/components/booking";
import UserExternalPosSection from "@/features/dashboard/eksternal/pos/components/user";
import GoalExternalPosSection from "@/features/dashboard/eksternal/pos/components/goal";
// import RevenueExternalPosSection from "@/features/dashboard/eksternal/pos/components/revenue";

/* Component untuk Eksternal (MyTsel) */
import TrxExternalMyTselSection from "@/features/dashboard/eksternal/mytsel/components/trx";
import ListMyTselTransaction from "@/features/dashboard/eksternal/mytsel/components/list-shipping";

import { FilterDateSection } from "../core/components/filter";
import { useEffect, useState } from "react";
import { HomeIcon } from "lucide-react";
import { parseCookies } from "nookies";
import { decodeAndFormatToken } from "@/actions/auth/getAccessUser";
import { DecodedType } from "@/types/def";
import { useRouter } from "next/navigation";
import { BookTrxGraph } from "./internal/components/book_trx";

export default function DashboardSection({ children }: { children: React.ReactNode }) {
  const [startDate, setStartDate] = useState<string>('');
  const router = useRouter();
  const [endDate, setEndDate] = useState<string>('');
  const [userDetails, setUserDetails] = useState<DecodedType>({ name: "", roleName: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cookieStore = parseCookies();
    const token = cookieStore['accessToken'];
  
    if (token) {
      const decoded = decodeAndFormatToken(token.toString()) as DecodedType;
  
      if (decoded) {
        setUserDetails({ name: decoded.name, roleName: decoded.roleName });
  
        if (decoded.roleName === "Admin") {
          router.push('/analyst/traffic');
        } else {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [router]);
  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const resetDates = () => {
    setStartDate('');
    setEndDate('');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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

          {userDetails.roleName === "Superadmin" && (
            <>
              <div className="flex gap-2 mt-2">
                <GoalSection startDate={startDate} endDate={endDate}/>
                <UserSection startDate={startDate} endDate={endDate}/>
              </div>
              {/* <BookingSection startDate={startDate} endDate={endDate}/>
              <TrxSection startDate={startDate} endDate={endDate}/> */}
              <BookTrxGraph startDate={startDate} endDate={endDate}/>
              <div className="flex gap-2 mt-2">
                <RevenueSection startDate={startDate} endDate={endDate}/>
                <GtvSection startDate={startDate} endDate={endDate}/>
              </div>
            </>
          )}

          {userDetails.roleName === "Client" && (
            <>
              <TrxExternalMyTselSection startDate={startDate} endDate={endDate}/>
              <ListMyTselTransaction/>
            </>
          )}

          {userDetails.roleName === "Client Pos" && (
            <>
              <div className="flex gap-2 mt-2">
                <GoalExternalPosSection startDate={startDate} endDate={endDate}/>
                <UserExternalPosSection startDate={startDate} endDate={endDate}/>
              </div>
              {/* <BookingExternalPosSection startDate={startDate} endDate={endDate}/>
              <TrxExternalPosSection startDate={startDate} endDate={endDate}/> */}
              <BookTrxGraph startDate={startDate} endDate={endDate}/>
            </>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}