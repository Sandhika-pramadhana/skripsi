import React, { useEffect, useState } from "react";
import Image from "next/image";
import Cookies from 'js-cookie';

const Navbar: React.FC = () => {
  const [userDetails, setUserDetails] = useState({ name: "", roleName: "" });

  useEffect(() => {
    const name = Cookies.get('name') || 'Admin POSFIN';
    const roleName = Cookies.get('roleName') || 'superadmin';
    setUserDetails({ name, roleName });
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm sticky top-0 z-50">
      {/* Bagian Kanan */}
      <div className="ml-auto">
        <div className="flex items-center border px-4 rounded-lg p-2">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-200 flex items-center justify-center mr-3">
            <Image
              src="/asset/images/avatar-icon.png"
              alt="Admin Avatar"
              width={40}
              height={40}
              objectFit="cover"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">{userDetails.name}</span>
            <span className="text-xs text-gray-500">{userDetails.roleName}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
