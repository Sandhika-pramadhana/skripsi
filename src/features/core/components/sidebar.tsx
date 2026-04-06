"use client";

import { Home, Users2, Menu, X, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/features/core/components/ui/sidebar";

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
  { title: "History", url: "/history", icon: Clock }, // 
];

const superadminMenuItems: MenuItem[] = [
  ...baseMenuItems,
  { title: "User Management", url: "/user-management", icon: Users2 },
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
  const router = useRouter();
  const pathname = usePathname() || "";
  const { open: isSidebarOpen, toggleSidebar } = useSidebar();

  const [userRole, setUserRole] = useState<string>("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>(baseMenuItems);
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());

  // Override CSS untuk memastikan tidak ada bg putih
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      [data-sidebar="sidebar"] {
        background-color: #1a162f !important;
      }
      [data-sidebar="content"] {
        background-color: #1a162f !important;
      }
      [data-sidebar="group"] {
        background-color: #1a162f !important;
      }
      [data-sidebar="footer"] {
        background-color: #1a162f !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Ambil role dari cookie
  useEffect(() => {
    const roleName = Cookies.get("roleName") || "client";
    setUserRole(roleName);
    setMenuItems(getMenuItemsByRole(roleName));
  }, []);

  const toggleMenu = (menuKey: string) => {
    setOpenMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuKey)) newSet.delete(menuKey);
      else newSet.add(menuKey);
      return newSet;
    });
  };

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
                ${
                  isActive
                    ? "bg-white text-[#1e1b4b] shadow-sm"
                    : "bg-transparent text-white hover:bg-white/10"
                }
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
              </SidebarMenuButton>

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
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 z-[1000] bg-[#1e1b4b] hover:bg-[#2a254b] text-white p-2 rounded-md shadow-lg transition-all duration-300 border border-[#1e1b4b]"
        style={{
          left: isSidebarOpen ? "276px" : "16px",
          transition: "left 300ms ease-in-out",
        }}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Wrapper */}
      <div
        className={`fixed top-0 left-0 bottom-0 transition-all duration-300 ease-in-out overflow-hidden bg-[#1a162f] ${
          isSidebarOpen ? "w-[260px]" : "w-0"
        } z-[999]`}
        style={{ border: "none", height: "100vh" }}
      >
        {isSidebarOpen && (
          <div className="h-full overflow-y-auto">
            <Sidebar
              className="h-full bg-[#1a162f] !border-0 flex flex-col min-h-screen"
              style={{ border: "none" }}
            >
              <SidebarContent
                className="bg-[#1a162f] !border-0 flex-1 overflow-y-auto"
                style={{ border: "none" }}
              >
                <SidebarGroup className="bg-[#1a162f] px-4 pt-4">
                  {/* Logo */}
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors mb-4"
                  >
                    <img
                      src="/asset/logo/binus.png"
                      alt="Binus Logo"
                      className="h-10 w-10 object-contain flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-bold text-base leading-tight truncate">
                        Binus University
                      </div>
                      <div className="text-white/70 text-xs font-medium truncate">
                        Bandung
                      </div>
                    </div>
                  </Link>

                  {/* Divider */}
                  <div className="w-full h-px bg-white/20 my-2 mx-1" />

                  {/* Menu */}
                  <SidebarGroupContent className="bg-[#1a162f] pb-8">
                    <p className="text-[12px] ml-1 mb-3 font-semibold text-white/70">
                      Menu
                    </p>
                    <SidebarMenu>
                      {renderMenuItems(menuItems)}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              {/* Footer */}
              <SidebarFooter className="bg-[#1a162f] flex-shrink-0 flex justify-center items-center text-white text-sm py-3 border-t border-white/10">
                © Binus University 2026
              </SidebarFooter>
            </Sidebar>
          </div>
        )}
      </div>

      {/* Overlay mobile */}
      {!isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[998] lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
