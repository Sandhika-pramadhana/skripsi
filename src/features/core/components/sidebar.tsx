import { Box, ChartColumn, Home, LogOut, Send, Settings2Icon, Users2Icon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/features/core/components/ui/sidebar";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";
import { decodeAndFormatToken } from "@/actions/auth/getAccessUser";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/features/core/components/ui/alert-dialog";
import { useToast } from '@/features/core/hooks/use-toast';
import { LogoutUser } from "@/actions/auth/auth";
import { useRouter } from "next/navigation";
import { DecodedType } from "@/types/def";

// Menu items.
const report = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Daftar Kiriman",
    url: "/daftar-kiriman",
    icon: Box,
  },
  {
    title: "Status Lacak",
    url: "/status-lacak",
    icon: Send,
  }
];

const master = [
  {
    title: "Data User",
    url: "/user",
    icon: Users2Icon,
  },
  {
    title: "Role User",
    url: "/role",
    icon: Settings2Icon
  }
];

const analyts = [
  {
    title: "Traffic Analyst",
    url: "/analyst/traffic",
    icon: ChartColumn,
  }
];

export function AppSidebar() {
  const { toast } = useToast();
  const router = useRouter();
  const [logoutSuccess, setLogoutSuccess] = useState(false);

    useEffect(() => {
      if (logoutSuccess) {
          router.push('/');
      }
  }, [logoutSuccess, router]);
  const [user, setRole] = useState<DecodedType>({ roleName: "" });

  useEffect(() => {
    const cookieStore = parseCookies();
    const token = cookieStore['accessToken'];

    if (token) {
      const decoded = decodeAndFormatToken(token.toString()) as DecodedType;

      if (decoded) {
        setRole({ roleName: decoded.roleName });
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      const response = await LogoutUser();
        if (response.success) {
          toast({
              title: "Berhasil",
              description: "Logout berhasil!",
          });
          setLogoutSuccess(true);
      } else {
          toast({
              variant: "destructive",
              title: "Gagal",
              description: "Logout gagal, terjadi kesalahan ketika logout.",
          });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: `Terjadi kesalahan ketika logout. ${error}`,
    });
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel imageSrc="/logo/logo_posfin.png" imageAlt="Sidebar Icon"></SidebarGroupLabel>
          <SidebarGroupContent>
            {user.roleName !== "Admin" && (
            <>
              <p className="text-[12px] ml-3 my-1 font-semibold">Report Data</p>
              <SidebarMenu>
                {report.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon className="text-[#F48120]" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </>
            )}

            {user.roleName === "Superadmin" && (
            <>
              <p className="text-[12px] ml-3 my-1 mt-5 font-semibold">Data Master</p>
              <SidebarMenu>
                {master.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon className="text-[#F48120]"/>
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
              </>
            )}

            {(user.roleName === "Superadmin" || user.roleName === "Client Pos" || user.roleName === "Admin") && (
            <>
              <p className="text-[12px] ml-3 my-1 mt-5 font-semibold">Google Data Analyst</p>
              <SidebarMenu>
                {analyts.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon className="text-[#F48120]"/>
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </>
            )}

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
                  <LogOut size={20} className="text-red-500"/> <span>Logout</span>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Keluar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah anda yakin ingin keluar? Anda harus masuk kembali untuk akses halaman ini.
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
};
