import React from "react";
import { FaArrowLeft, FaHeartbeat } from "react-icons/fa";

interface MemberHeaderProps {
  onBack: () => void;
  onLogVital: () => void;
}

export default function MemberHeader({ onBack, onLogVital }: MemberHeaderProps) {
  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-500 hover:text-primary transition-colors font-semibold text-sm"
      >
        <FaArrowLeft />
        <span>Return to Network</span>
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Clinical Profile</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">
            Reviewing member health intelligence and diagnostics.
          </p>
        </div>
        <button
          onClick={onLogVital}
          className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-3 text-sm font-bold shadow-md shadow-primary/20 transition-all active:scale-95"
        >
          <FaHeartbeat size={16} />
          <span>Log Vital Sign</span>
        </button>
      </div>
    </div>
  );
}
