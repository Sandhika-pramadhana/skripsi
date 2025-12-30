'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center">
        {/* 404 Number */}
        <div className="relative">
          <h1 className="text-9xl font-bold text-slate-200 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>

        {/* Message */}
        <div className="mt-8">
          <h2 className="text-3xl font-semibold text-slate-800">
            This page could not be found
          </h2>
        </div>
      </div>
    </div>
  );
}