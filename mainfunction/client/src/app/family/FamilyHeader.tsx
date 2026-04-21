import React from "react";
import { FaUsers, FaUserPlus } from "react-icons/fa";

interface FamilyHeaderProps {
  onAddMember: () => void;
}

export default function FamilyHeader({ onAddMember }: FamilyHeaderProps) {
  return (
    <header className="mb-10 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-primary/5 px-3 py-1 rounded-lg text-primary text-[10px] font-bold mb-3 border border-primary/10 uppercase tracking-widest">
            <FaUsers /> <span>Network Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Family Health</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Unified diagnostic monitoring for your shared medical circle.</p>
        </div>
        <button
          onClick={onAddMember}
          className="w-full md:w-auto bg-gray-900 hover:bg-primary text-white px-8 py-4 rounded-xl flex items-center justify-center space-x-3 transition-all shadow-xl shadow-gray-200 active:scale-95 group"
        >
          <FaUserPlus className="group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Add New Node</span>
        </button>
      </div>
    </header>
  );
}
