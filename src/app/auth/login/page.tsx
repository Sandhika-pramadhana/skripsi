"use client";

import { unstable_noStore as noStore } from 'next/cache';
import AuthLayout from '@/features/core/context/AuthContext';
import LoginContainer from '@/features/page/auth/index';
import Image from 'next/image';

noStore();

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="grid lg:grid-cols-8 min-h-screen">
        {/* Bagian kiri: Form Login */}
        <div className="lg:col-span-3 flex items-center justify-center p-16">
          <div className="w-full max-w-md">
            <LoginContainer />
          </div>
        </div>

        {/* Bagian kanan: Background / ilustrasi */}
        <div className="lg:col-span-5 px-16 py-16">
          <div className="flex flex-col h-full bg-gray-300 rounded-3xl relative overflow-hidden p-16">
            <Image
              alt="bg.jpg"
              src="/images/bg-dashboard.jpg"
              className="transform scale-x-[-1]"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
