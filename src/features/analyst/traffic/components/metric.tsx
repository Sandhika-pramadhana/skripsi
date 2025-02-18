import { UserPlus, UsersIcon } from 'lucide-react';
import React from 'react';

const MetricCardSection = () => {
  return (
    <div className="justify-between col-span-1">
      <div className="flex p-6 bg-white rounded-xl w-full justify-between items-center my-2 border">
        <div className="">
            <p className="text-xl mb-3 font-semibold">Total Active User</p>
            <UsersIcon size={45} className="text-gray-500"/>
        </div>
        <p className="text-3xl font-bold">25287</p>
      </div>
      <div className="flex p-6 bg-white rounded-xl w-full justify-between items-center my-2 border">
        <div className="">
            <p className="text-xl mb-3 font-semibold">Total Traffic</p>
            <UserPlus size={45} className="text-gray-500"/>
        </div>
        <p className="text-3xl font-bold">25282</p>
      </div>
    </div>
  );
};

export default MetricCardSection;
