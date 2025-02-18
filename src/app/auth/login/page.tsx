import React from 'react';
import Image from 'next/image';
import LoginForm from '@/features/auth/login/components/login-form';

export default function LoginPage() {
  return (
    <div className="grid lg:grid-cols-8 min-h-screen"> {/* Memastikan tinggi penuh */}
      <div className="lg:col-span-3 flex items-center justify-center p-16">
        {/* Container untuk LoginForm dengan centering yang tepat */}
        <div className="w-full max-w-md"> {/* Mengontrol lebar LoginForm */}
          <LoginForm />
        </div>
      </div>
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
  );
};
