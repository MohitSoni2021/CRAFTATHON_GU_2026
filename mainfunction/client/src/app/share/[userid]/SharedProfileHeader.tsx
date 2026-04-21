import React from "react";
import { FaTint, FaRulerVertical, FaWeight } from "react-icons/fa";
import { SharedUser } from "./types";

interface SharedProfileHeaderProps {
  user: SharedUser;
}

export default function SharedProfileHeader({ user }: SharedProfileHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-primary to-primary/80 h-32 relative">
        <div className="absolute inset-0 bg-white/5 pattern-dots" />
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 bg-white rounded-xl p-1.5 shadow-lg shadow-primary/10 border border-white">
            <div className="w-full h-full rounded-lg bg-gray-50 overflow-hidden flex items-center justify-center text-4xl font-black text-primary/40 border border-gray-100">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="pt-20 pb-8 px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              {user?.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="bg-primary/5 text-primary border border-primary/10 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">
                Patient Profile
              </span>
              {user?.age && (
                <span className="text-gray-400 font-bold text-sm">• {user.age} Years Old</span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {user?.profile?.bloodGroup && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase">
                <FaTint size={10} /> {user.profile.bloodGroup}
              </div>
            )}
          </div>
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
              Gender
            </p>
            <p className="font-black text-gray-900 capitalize">
              {user?.profile?.gender || "--"}
            </p>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <FaRulerVertical /> Height
            </p>
            <p className="font-black text-gray-900">
              {user?.profile?.height ? `${user.profile.height} cm` : "--"}
            </p>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <FaWeight /> Weight
            </p>
            <p className="font-black text-gray-900">
              {user?.profile?.weight ? `${user.profile.weight} kg` : "--"}
            </p>
          </div>
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">
              Conditions
            </p>
            <p
              className="font-black text-gray-900 truncate"
              title={user?.profile?.chronicConditions?.join(", ")}
            >
              {user?.profile?.chronicConditions?.length
                ? user.profile.chronicConditions.join(", ")
                : "None"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
