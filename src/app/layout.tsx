"use client";

import localFont from "next/font/local";
import "./globals.css";
import TanstackProviders from "@/features/core/providers/tanstack";
import { Toaster } from "@/features/core/components/ui/toaster";
import { useEffect, useRef } from "react";
import { parseCookies } from "nookies";
import { checkExpiredToken } from "@/actions/auth/getAccessUser";
import { useRouter } from "next/navigation";
import { AlertSession } from "@/features/core/components/modal-session";
import { AlertSessionMethods } from '@/types/def';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionAlertRef = useRef<AlertSessionMethods | null>(null);
  const router = useRouter();

  useEffect(() => {
    const cookies = parseCookies();
    const token = cookies['accessToken'];
    
    if (!token || checkExpiredToken(token).isExpired) {
      if (window.location.pathname !== '/auth/login') {
        if (sessionAlertRef.current) {
          sessionAlertRef.current.openDialog();
          setTimeout(() => {
            if (sessionAlertRef.current) {
              sessionAlertRef.current.closeDialog();
            }
            router.push("/auth/login");
          }, 3000);
        }
      }
    }
  }, [router]);
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <TanstackProviders>
          {children}
          <AlertSession ref={sessionAlertRef} />
        </TanstackProviders>

        <Toaster />
      </body>
    </html>
  );
}
