import React from "react";
import { FaCamera, FaEnvelope, FaUserMd, FaCrown } from "react-icons/fa";
import { User } from "./types";

interface ProfileHeroProps {
  user: User | null;
  onPhotoClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileHero({
  user,
  onPhotoClick,
  fileInputRef,
  onFileChange,
}: ProfileHeroProps) {
  return (
    <div className="bg-gradient-primary rounded-xl p-8 mb-10 shadow-ambient relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-700"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
        <div className="relative group/avatar">
          <div className="w-40 h-40 bg-surface-container-low rounded-xl ring-4 ring-white/10 shadow-2xl flex items-center justify-center text-6xl font-bold text-primary overflow-hidden transition-transform duration-500 group-hover/avatar:scale-[1.02]">
            {user?.profileImage || user?.profile?.photoUrl ? (
              <img
                src={user.profileImage || user.profile.photoUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase() || "U"
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <FaCamera className="text-white text-2xl" />
            </div>
          </div>
          <button
            onClick={onPhotoClick}
            className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-xl shadow-xl hover:scale-110 transition-all border-2 border-white/10"
          >
            <FaCamera size={14} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={onFileChange}
          />
        </div>

        <div className="text-center md:text-left flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              {user?.name || "Incomplete Profile"}
            </h2>
            <div className="flex gap-2 justify-center md:justify-start">
              {user?.type === "doctor" ? (
                <span className="bg-blue-500 text-white px-4 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <FaUserMd /> Verified Specialist
                </span>
              ) : (
                <span className="bg-white/10 backdrop-blur-md text-white px-4 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/10">
                  Standard Member
                </span>
              )}
              {user?.subscription?.plan === "premium" && (
                <span className="bg-amber-500 text-white px-4 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <FaCrown /> Concierge
                </span>
              )}
            </div>
          </div>

          <p className="text-gray-400 text-lg flex items-center justify-center md:justify-start gap-3 mb-8 font-medium">
            <FaEnvelope className="text-primary/60" />
            {user?.email || "No email associated"}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
              <p className="text-[10px] text-gray-100 font-bold uppercase tracking-widest mb-1">
                Status
              </p>
              <p className="text-white font-bold capitalize">
                {user?.type || "Patient"}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
              <p className="text-[10px] text-gray-100 font-bold uppercase tracking-widest mb-1">
                Age
              </p>
              <p className="text-white font-bold">
                {user?.age ? `${user.age} Y` : "--"}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
              <p className="text-[10px] text-gray-100 font-bold uppercase tracking-widest mb-1">
                Blood
              </p>
              <p className="text-white font-bold">
                {user?.profile?.bloodGroup || "--"}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
              <p className="text-[10px] text-gray-100 font-bold uppercase tracking-widest mb-1">
                Weight
              </p>
              <p className="text-white font-bold">
                {user?.profile?.weight ? `${user.profile.weight}kg` : "--"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
