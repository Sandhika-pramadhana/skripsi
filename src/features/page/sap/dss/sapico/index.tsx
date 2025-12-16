"use client";

import { SidebarProvider, SidebarTrigger } from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
import ListSapico from "./components/list-sapico";
import { DatabaseIcon } from "lucide-react";

export default function SapicoDssSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Navbar */}
        <Navbar />

        {/* Main Section */}
        <main className="flex-1 p-4 overflow-x-auto">
          <SidebarTrigger />

          {children}

          {/* Title */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2 items-center">
              <DatabaseIcon />
              <h1 className="font-bold text-2xl my-4">List Sapico</h1>
            </div>
          </div>

          {/*Table wrapper */}
          <div className="w-full overflow-x-auto">
            <ListSapico />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
