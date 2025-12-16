"use client";
import { SidebarProvider, SidebarTrigger } from "@/features/core/components/ui/sidebar";
import { AppSidebar } from "@/features/core/components/sidebar";
import Navbar from "@/features/core/components/navbar";
import { ZDRevenueProcess } from "../revenue/components/ZdProcess"; 
import { ZERevenueProcess } from "../revenue/components/ZeProcess";
import { ZFRevenueProcess } from "../revenue/components/ZfProcess";
import { ZGRevenueProcess } from "../revenue/components/ZgProcess"; 
import { FileSpreadsheet } from "lucide-react";
// Import action functions
import { insertZD, generateXmlZD } from "@/actions/sap/generate/ZD"; 
import { insertZE, generateXmlZE } from "@/actions/sap/generate/ZE";
import { insertZF, generateXmlZF } from "@/actions/sap/generate/ZF";
import { insertZG, generateXmlZG } from "@/actions/sap/generate/ZG"; 

export default function DataProcessSection() {
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
          
          {/* ZD Revenue Process Component */}
          <ZDRevenueProcess 
            insertAction={insertZD}
            generateXmlAction={generateXmlZD}
          />
          
          {/* ZE Revenue Process Component */}
          <ZERevenueProcess 
            insertAction={insertZE}
            generateXmlAction={generateXmlZE}
          />
          
          {/* ZF Revenue Process Component */}
          <ZFRevenueProcess 
            insertAction={insertZF}
            generateXmlAction={generateXmlZF}
          />
          
          {/* ZG Revenue Process Component - TAMBAHAN */}
          <ZGRevenueProcess 
            insertAction={insertZG}
            generateXmlAction={generateXmlZG}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}
