"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { LogOutIcon } from "lucide-react";
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
import { LogoutUser } from "@/actions/auth/logout";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';

const Navbar: React.FC = () => {
  const [userDetails, setUserDetails] = useState({ name: "", roleName: "" });
  const { toast } = useToast();
  const router = useRouter();
  const [logoutSuccess, setLogoutSuccess] = useState(false);

  useEffect(() => {
    // Get user details from cookies
    const name = Cookies.get('name') || 'Admin POSFIN';
    const roleName = Cookies.get('roleName') || 'superadmin';
    setUserDetails({ name, roleName });
  }, []);

  useEffect(() => {
    if (logoutSuccess) {
      router.push('/auth/login');
    }
  }, [logoutSuccess, router]);

  const handleLogout = async () => {
    try {
      const response = await LogoutUser();
     
      // Clear all cookies regardless of API response
      Cookies.remove("token-auth");
      Cookies.remove("user_id");
      Cookies.remove("name");
      Cookies.remove("username");
      Cookies.remove("role_id");
      Cookies.remove("roleName");
     
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
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm sticky top-0 z-1">
      {/* Bagian Kanan */}
      <div className="ml-auto">
        <div className="flex items-center border px-4 rounded-lg p-2">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-200 flex items-center justify-center mr-3">
            <Image
              src="/images/avatar-icon.png"
              alt="Admin Avatar"
              width={40}
              height={40}
              objectFit="cover"
            />
          </div>
          {/* Nama Admin */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">{userDetails.name}</span>
            <span className="text-xs text-gray-500">{userDetails.roleName}</span>
          </div>
          
          {/* Alert Dialog dengan z-index yang tepat */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="p-1 ml-2 rounded-sm text-red-500 hover:bg-red-400 hover:text-white cursor-pointer transition-colors">
                <LogOutIcon />
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent className="z-20">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;