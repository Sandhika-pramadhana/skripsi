"use client";

import { SidebarProvider, SidebarTrigger } from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
import ListCallbacks from "./components/list-callbacks";
import { PhoneCallIcon } from "lucide-react";

export default function CallbacksSection({ children }: { children: React.ReactNode }) {
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
              <PhoneCallIcon />
              <h1 className="font-bold text-2xl my-4">Data Callbacks</h1>
            </div>
          </div>

          {/* List Callbacks */}
          <ListCallbacks />
        </main>
      </div>
    </SidebarProvider>
  );
}