"use client";

import { SidebarProvider, SidebarTrigger } from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
// import { Users2Icon } from "lucide-react";
import ListRoles from "./components/list-role";

export default function RolesSection({ children }: { children: React.ReactNode }) {
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
          {/* <div className="flex items-center">
            <div className="flex gap-2 items-center">
              <Users2Icon />
              <h1 className="font-bold text-2xl my-4">Data User</h1>
            </div>
          </div> */}

          <ListRoles />

        </main>
      </div>
    </SidebarProvider>
  );
}