"use client";
import { SidebarProvider, SidebarTrigger } from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
import ListGenerate from "../report/components/list-generate";
import { FileSpreadsheet } from "lucide-react";

export default function GenerateSection({ children }: { children: React.ReactNode }) {
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
          
          {/* Title */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2 items-center">
              <FileSpreadsheet />
              <h1 className="font-bold text-2xl my-4">Generate</h1>
            </div>
          </div>
          {/* List Transaction Mandiri */}
          <ListGenerate />
        </main>
      </div>
    </SidebarProvider>
  );
}