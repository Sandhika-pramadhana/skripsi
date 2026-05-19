"use client";

import localFont from "next/font/local";
import "./globals.css";
import TanstackProviders from "@/features/core/providers/tanstack";
import { Toaster } from "@/features/core/components/ui/toaster";
import { AlertSession } from "@/features/core/components/modal-session";

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
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <TanstackProviders>
          {children}
          <AlertSession />
        </TanstackProviders>

        <Toaster />
      </body>
    </html>
  );
}