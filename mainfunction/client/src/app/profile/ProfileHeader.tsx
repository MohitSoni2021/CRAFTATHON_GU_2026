import React from 'react';
import { FaUser } from 'react-icons/fa';

export default function ProfileHeader() {
  return (
    <header className="mb-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="flex justify-between items-end">
        <div>
          <div className="inline-flex items-center space-x-2 bg-primary/5 px-3 py-1 rounded-lg text-primary text-[10px] font-bold mb-3 border border-primary/10 uppercase tracking-widest">
            <FaUser /> <span>Account Settings</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Profile Central
          </h1>
        </div>
      </div>
    </header>
  );
}
