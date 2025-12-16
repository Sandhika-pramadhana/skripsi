"use client";

import { SidebarProvider, SidebarTrigger } from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
import ListLogApisMandiri from "./components/list-log-apis-mandiri";
import { DatabaseIcon } from "lucide-react";

export default function LogApisMandiriSection({
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

          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <DatabaseIcon />
              <h1 className="font-bold text-2xl my-4">
                Data Log APIs Mandiri
              </h1>
            </div>
          </div>

          {/* Wrapper table */}
          <div className="w-full overflow-x-auto">
            <ListLogApisMandiri />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
