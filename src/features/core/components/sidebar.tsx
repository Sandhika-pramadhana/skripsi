"use client";

import { 
  Box, Database, FolderKanban, Home, 
  LogOut, PhoneCall, Send, Settings2, Users2,
  ChevronDown, ChevronRight, FolderKanbanIcon, Server
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useToast } from "@/features/core/hooks/use-toast";
import { LogoutUser } from "@/actions/auth/auth";
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

type MenuItem = {
  title: string;
  url?: string;
  icon: React.ElementType;
  readOnly?: boolean;
  children?: MenuItem[];
};

// Base menu items
const baseMenuItems: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Daftar Kiriman", url: "/daftar-kiriman", icon: Box },
  { title: "Status Lacak", url: "/status-lacak", icon: Send },

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
        ],
      },
    ],
  },
];

// Admin menu (view-only user management)
const adminMenuItems: MenuItem[] = [
  ...baseMenuItems,
  { title: "Data User", url: "/user", icon: Users2, readOnly: true },
  { title: "Role User", url: "/role", icon: Settings2, readOnly: true },
];

// Superadmin menu
const superadminMenuItems: MenuItem[] = [
  ...baseMenuItems,
  { title: "Data User", url: "/user", icon: Users2 },
  { title: "Role User", url: "/role", icon: Settings2 },
];

// Ambil menu sesuai role
const getMenuItemsByRole = (roleName: string): MenuItem[] => {
  switch (roleName.toLowerCase()) {
    case "superadmin":
      return superadminMenuItems;
    case "admin":
      return adminMenuItems;
    default:
      return baseMenuItems;
  }
};

export function AppSidebar() {
  const { toast } = useToast();
  const router = useRouter();
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>(baseMenuItems);
  // Changed to Set to track multiple open menus for nested structure
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());

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
      if (newSet.has(menuKey)) {
        newSet.delete(menuKey);
      } else {
        newSet.add(menuKey);
      }
      return newSet;
    });
  };

  // Fixed recursive menu renderer
  const renderMenuItems = (items: MenuItem[], parentKey = "", level = 0) => {
    return items.map((item, index) => {
      const itemKey = `${parentKey}-${item.title}-${index}`;
      const isOpen = openMenus.has(itemKey);
      
      return (
        <SidebarMenuItem key={itemKey}>
          {!item.children ? (
            <SidebarMenuButton asChild>
              <Link href={item.url || "#"} className={level > 0 ? `pl-${level * 4}` : ""}>
                <item.icon className="text-[#F48120]" size={16} />
                <span className="text-sm">
                  {item.title}
                  {item.readOnly && userRole.toLowerCase() === "admin" && (
                    <span className="text-xs text-gray-500 ml-1">(View Only)</span>
                  )}
                </span>
              </Link>
            </SidebarMenuButton>
          ) : (
            <div>
              <SidebarMenuButton 
                onClick={() => toggleMenu(itemKey)}
                className={level > 0 ? `pl-${level * 4}` : ""}
              >
                <item.icon className="text-[#F48120]" size={16} />
                <span className="text-sm">{item.title}</span>
                {isOpen ? (
                  <ChevronDown size={16} className="ml-auto" />
                ) : (
                  <ChevronRight size={16} className="ml-auto" />
                )}
              </SidebarMenuButton>
              
              {/* Render submenu with proper nesting */}
              {isOpen && item.children && (
                <div className="ml-4 mt-1">
                  <SidebarMenu>
                    {renderMenuItems(item.children, itemKey, level + 1)}
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
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel imageSrc="/logo/logo_posfin.png" imageAlt="Sidebar Icon" />
          <SidebarGroupContent>
            <p className="text-[12px] ml-3 my-1 font-semibold">Report Data</p>
            <SidebarMenu>
              {renderMenuItems(menuItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <div className="flex gap-2 items-center cursor-pointer">
                    <LogOut size={20} className="text-red-500" /> 
                    <span>Logout</span>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Keluar?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah anda yakin ingin keluar? Anda harus login ulang untuk akses halaman ini.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Kembali</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Keluar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}