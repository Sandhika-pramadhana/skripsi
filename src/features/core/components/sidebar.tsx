import { 
  Box, ChartColumn, Database, FolderKanban, Home, 
  LogOut, PhoneCall, Send, Settings2, Users2,
  ChevronDown, ChevronRight, FolderKanbanIcon
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

// 🔹 definisikan tipe MenuItem
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
      { title: "Log APIs", url: "/log-apis", icon: Database },
      { title: "Callbacks", url: "/callbacks", icon: PhoneCall },
    ],
  },
  {
    title: "Kurir Mandiri",
    icon: FolderKanbanIcon,
    children: [
      { title: "Log Apis", url: "/log-apis-mandiri", icon: Database },
      { title: "Callbacks Transactions", url: "/callbacks-mandiri", icon: Database },
      { title: "Callbacks Registrations", url: "/callbacks-registrations-mandiri", icon: Database },
    ],
  },
];

// Admin menu (view-only user management)
const adminMenuItems: MenuItem[] = [
  ...baseMenuItems,
  { title: "Data User", url: "/user", icon: Users2, readOnly: true },
  { title: "Role User", url: "/role", icon: Settings2, readOnly: true },
];

// Superadmin menu (full CRUD)
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
  const [openMenu, setOpenMenu] = useState<string | null>(null);

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

  const toggleMenu = (title: string) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel imageSrc="/logo/logo_posfin.png" imageAlt="Sidebar Icon" />
          <SidebarGroupContent>
            <p className="text-[12px] ml-3 my-1 font-semibold">Report Data</p>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {!item.children ? (
                    <SidebarMenuButton asChild>
                      <Link href={item.url || "#"}>
                        <item.icon className="text-[#F48120]" />
                        <span>
                          {item.title}
                          {item.readOnly && userRole.toLowerCase() === "admin" && (
                            <span className="text-xs text-gray-500 ml-1">(View Only)</span>
                          )}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <>
                      <SidebarMenuButton onClick={() => toggleMenu(item.title)}>
                        <item.icon className="text-[#F48120]" />
                        <span>{item.title}</span>
                        {openMenu === item.title ? (
                          <ChevronDown size={16} className="ml-auto" />
                        ) : (
                          <ChevronRight size={16} className="ml-auto" />
                        )}
                      </SidebarMenuButton>
                      {openMenu === item.title && (
                        <SidebarMenu className="ml-6">
                          {item.children.map((child) => (
                            <SidebarMenuItem key={child.title}>
                              <SidebarMenuButton asChild>
                                <Link href={child.url || "#"}>
                                  <child.icon className="text-[#F48120]" />
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      )}
                    </>
                  )}
                </SidebarMenuItem>
              ))}
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
                  <div className="flex gap-2 items-center">
                    <LogOut size={20} className="text-red-500" /> <span>Logout</span>
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
