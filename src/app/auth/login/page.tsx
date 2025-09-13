"use client";

import { unstable_noStore as noStore } from "next/cache";
import AuthLayout from "@/features/core/context/AuthContext";
import LoginContainer from "@/features/page/auth/index";
import Image from "next/image";

noStore();

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="grid lg:grid-cols-8 min-h-screen h-full">
        {/* Bagian kiri */}
        <div className="lg:col-span-3 flex items-center justify-center p-16">
          <div className="w-full max-w-md">
            <LoginContainer />
          </div>
        </div>

       {/* Bagian kanan */}
<div className="lg:col-span-5 px-16 py-16">
  <div className="rounded-3xl overflow-hidden">
    <Image
      alt="bg.jpg"
      src="/images/bg-dashboard.jpg"
      width={1200}
      height={800}
      className="w-full h-full object-cover transform scale-x-[-1] rounded-3xl"
      priority
    />
  </div>
</div>

      </div>
    </AuthLayout>
  );
}
