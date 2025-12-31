"use client";
import { SidebarProvider, SidebarTrigger } from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
import ListUsers from "./components/list-management";

export default function UserManagementSection({ children }: { children: React.ReactNode }) {
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
          <ListUsers />
        </main>
      </div>
    </SidebarProvider>
  );
}