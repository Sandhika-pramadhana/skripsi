// pages/generate/cogs/index.tsx (atau app/generate/cogs/page.tsx)
"use client";
import { SidebarProvider, SidebarTrigger } from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
import { ZyProcess } from "./components/ZyProcess"; 
import { ZzProcess } from "./components/ZzProcess"; 
import { insertZY, generateXmlZY } from "@/actions/sap/generate/ZY";
import { insertZZ, generateXmlZZ } from "@/actions/sap/generate/ZZ";
import { FileSpreadsheet, Package } from "lucide-react";

export default function COGSProcessSection() {
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
          
          {/* Title */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2 items-center">
              <FileSpreadsheet />
              <h1 className="font-bold text-2xl my-4">Insert & Send Data</h1>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>
          
          {/* ZY COGS Process Component*/}
          <ZyProcess 
            insertAction={insertZY}
            generateXmlAction={generateXmlZY}
          />

          {/* ZZ COGS Process Component*/}
          <ZzProcess 
            insertAction={insertZZ}
            generateXmlAction={generateXmlZZ}
          />
          
        </main>
      </div>
    </SidebarProvider>
  );
}
