"use client";

import localFont from "next/font/local";
import "./globals.css";
import TanstackProviders from "@/features/core/providers/tanstack";
import { Toaster } from "@/features/core/components/ui/toaster";
import { useRef } from "react";
import { AlertSession } from "@/features/core/components/modal-session";
import { AlertSessionMethods } from "@/types/def";

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
}: {
  children: React.ReactNode;
}) {
  const sessionAlertRef = useRef<AlertSessionMethods | null>(null);

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
