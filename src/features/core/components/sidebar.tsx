"use client";

import { 
  Box, Database, FolderKanban, Home, 
  LogOut, PhoneCall, Send, Settings2, Users2,
  ChevronDown, ChevronRight, FolderKanbanIcon, Server, Menu, X,
  BoxIcon,
  PlusSquare
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/features/core/hooks/use-toast";
import { LogoutUser } from "@/actions/auth/logout";

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupLabel, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarSeparator,
} from "@/features/core/components/ui/sidebar";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/features/core/components/ui/alert-dialog";

import { Button } from "@/features/core/components/ui/button";

type MenuItem = {
  title: string;
  url?: string;
  icon: React.ElementType;
  readOnly?: boolean;
  children?: MenuItem[];
};

// ======================= MENU LIST =======================
const baseMenuItems: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: Home },

  {
    title: "Kurir Tsel",
    icon: FolderKanban,
    children: [
      {
        title: "Sandbox",
        icon: Box,
        children: [
          { title: "Log APIs", url: "/sandbox/tsel/log-apis", icon: Database },
          { title: "Callbacks", url: "/sandbox/tsel/callbacks", icon: PhoneCall },
        ],
      },
      {
        title: "Production",
        icon: Server,
        children: [
          { title: "Daftar Kiriman", url: "/daftar-kiriman", icon: Box },
          { title: "Status Lacak", url: "/status-lacak", icon: Send },
          { title: "Log APIs", url: "/prod/tsel/log-apis", icon: Database },
          { title: "Callbacks", url: "/prod/tsel/callbacks", icon: PhoneCall },
        ],
      },
    ],
  },

  {
    title: "Kurir Mandiri",
    icon: FolderKanbanIcon,
    children: [
      {
        title: "Sandbox",
        icon: Box,
        children: [
          { title: "Log APIs", url: "/sandbox/mandiri/log-apis-mandiri", icon: Database },
          { title: "Callbacks Transactions", url: "/sandbox/mandiri/callbacks-mandiri", icon: Database },
          { title: "Callbacks Registrations", url: "/sandbox/mandiri/callbacks-registrations-mandiri", icon: Database },
        ],
      },
      {
        title: "Production",
        icon: Server,
        children: [
          { title: "Log APIs", url: "/prod/mandiri/log-apis-mandiri", icon: Database },
          { title: "Callbacks Transactions", url: "/prod/mandiri/callbacks-mandiri", icon: Database },
          { title: "Callbacks Registrations", url: "/prod/mandiri/callbacks-registrations-mandiri", icon: Database },
          { title: "Transaction", url: "/prod/mandiri/transaction-mandiri", icon: Database },
        ],
      },
    ],
  },

  {
    title: "SAP",
    icon: Server,
    children: [
      { 
        title: "Generate",
        icon: BoxIcon,
        children:[ 
          { title: "Generate Data", url: "/sap/generate/report", icon: Database },
          { title: "Insert & Send Revenue Data", url: "/sap/generate/Revenue", icon:Send },
          { title: "Insert & Send COGS Data", url: "/sap/generate/cogs", icon:Send },
        ], 
      },
      {
        title: "Dss",
        icon: Box,
        children: [
          { title: "Sapico temp", url: "/sap/dss/sapico", icon: Database },
        ],
      },
      {
        title: "Ppob",
        icon: Box,
        children: [
          { title: "Log sapico", url: "/sap/ppob/log-sapico", icon: Database },
          { title: "Sapico temp", url: "/sap/ppob/sapico", icon: Database },
        ],
      },
    ],
  },
];

const superadminMenuItems: MenuItem[] = [
  ...baseMenuItems,
  { title: "Data User", url: "/user", icon: Users2 },
  { title: "Role User", url: "/role", icon: Settings2 },
];

const getMenuItemsByRole = (roleName: string): MenuItem[] => {
  switch (roleName.toLowerCase()) {
    case "superadmin":
      return superadminMenuItems;
    default:
      return baseMenuItems;
  }
};

// ======================= COMPONENT =======================
export function AppSidebar() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname() || "";

  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>(baseMenuItems);
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Ambil role dari cookie
  useEffect(() => {
    const roleName = Cookies.get("roleName") || "client";
    setUserRole(roleName);
    setMenuItems(getMenuItemsByRole(roleName));
  }, []);

  useEffect(() => {
    if (logoutSuccess) router.push("/auth/login");
  }, [logoutSuccess, router]);

  const handleLogout = async () => {
    try {
      const response = await LogoutUser();
      Cookies.remove("token-auth");
      Cookies.remove("user_id");
      Cookies.remove("name");
      Cookies.remove("username");
      Cookies.remove("role_id");
      Cookies.remove("roleName");

      if (response.success) {
        toast({ title: "Berhasil", description: "Logout berhasil!" });
        setLogoutSuccess(true);
      } else {
        toast({
          variant: "destructive",
          title: "Gagal",
          description: "Logout gagal, terjadi kesalahan.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: `Terjadi kesalahan: ${error}`,
      });
    }
  };

  const toggleMenu = (menuKey: string) => {
    setOpenMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuKey)) newSet.delete(menuKey);
      else newSet.add(menuKey);
      return newSet;
    });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderMenuItems = (items: MenuItem[], parentKey = "", level = 0) => {
    return items.map((item, index) => {
      const itemKey = `${parentKey}-${item.title}-${index}`;
      const isOpen = openMenus.has(itemKey);
      const isActive = item.url ? pathname === item.url : false;
      const paddingClass = level > 0 ? `pl-${level * 4}` : "";

      return (
        <SidebarMenuItem key={itemKey}>
          {!item.children ? (
            <SidebarMenuButton
              asChild
              className={`
                ${paddingClass}
                rounded-lg
                transition-all
                text-sm
                ${isActive
                  ? "bg-white text-[#1e1b4b] shadow-sm"
                  : "bg-transparent text-white hover:bg-white/10"}
              `}
            >
              <Link href={item.url || "#"} className="flex items-center gap-2">
                <item.icon
                  size={16}
                  className={isActive ? "text-[#1e1b4b]" : "text-white"}
                />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          ) : (
            <div>
              <SidebarMenuButton
                onClick={() => toggleMenu(itemKey)}
                className={`
                  ${paddingClass}
                  rounded-lg
                  transition-all
                  text-sm
                  bg-transparent text-white hover:bg-white/10
                `}
              >
                <item.icon size={16} className="text-white" />
                <span>{item.title}</span>
                {isOpen ? (
                  <ChevronDown size={16} className="ml-auto text-white" />
                ) : (
                  <ChevronRight size={16} className="ml-auto text-white" />
                )}
              </SidebarMenuButton>

              {isOpen && (
                <div className="ml-4 mt-1">
                  <SidebarMenu>
                    {renderMenuItems(item.children!, itemKey, level + 1)}
                  </SidebarMenu>
                </div>
              )}
            </div>
          )}
        </SidebarMenuItem>
      );
    });
  };

  return (
    <>
      {/* Toggle Button - POSISI SUDAH FIX */}
      <Button
        onClick={toggleSidebar}
        className="fixed top-4 z-[1000] bg-[#1e1b4b] hover:bg-[#2a254b] text-white p-2 rounded-md shadow-lg transition-all duration-300 border border-[#1e1b4b]"
        style={{ 
          left: isSidebarOpen ? "276px" : "16px",
          transition: "left 300ms ease-in-out"
        }}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Sidebar - TIDAK AKAN KEPOTONG */}
      <div
  className="h-full transition-all duration-300 ease-in-out overflow-y-auto"
  style={{
    backgroundColor: "#1e1b4b",
    width: isSidebarOpen ? "260px" : "0px",
  }}
>
        {isSidebarOpen && (
          <Sidebar className="h-full bg-[#1e1b4b] border-r border-[#2a254b]">
            <SidebarContent className="bg-[#1e1b4b]">
              <SidebarGroup className="bg-[#1e1b4b] px-4 pt-4">
                <Link href="/dashboard" >
                  <div className="flex items-center justify-center rounded-xl p-3 shadow-md bg-white">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center pt-2">
                      <SidebarGroupLabel
                        imageSrc="/asset/logo/logo_posfin.png"
                        imageAlt="Posfin Logo"
                        className="m-0 p-0 h-10 w-10 object-contain"
                      />
                    </div>
                  </div>
                </Link>

                <SidebarGroupContent className="bg-[#1e1b4b] mt-6">
                  <p className="text-[12px] ml-1 mb-2 font-semibold text-white/70">
                    Report Data
                  </p>
                  <SidebarMenu>{renderMenuItems(menuItems)}</SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="bg-[#1a162f] mt-auto">
              <SidebarSeparator className="bg-white/20" />
              <SidebarMenu className="bg-[#1a162f]">
                <SidebarMenuItem>
                  <SidebarMenuButton className="text-white hover:bg-white/10">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <div className="flex gap-2 items-center cursor-pointer w-full">
                          <LogOut size={20} className="text-red-400" />
                          <span className="text-sm">Logout</span>
                        </div>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Konfirmasi Keluar?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah anda yakin ingin keluar? Anda harus login ulang
                            untuk akses halaman ini.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Kembali</AlertDialogCancel>
                          <AlertDialogAction onClick={handleLogout}>
                            Keluar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
        )}
      </div>

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[998] lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}