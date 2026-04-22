import React from "react";
import { FaUserMd } from "react-icons/fa";

export default function DoctorDashboardHeader() {
  return (
    <header className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center justify-center text-3xl shadow-sm">
          <FaUserMd />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Doctor Dashboard
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-1">
            Review patient consultations and manage clinical schedule.
          </p>
        </div>
      </div>
    </header>
  );
}
