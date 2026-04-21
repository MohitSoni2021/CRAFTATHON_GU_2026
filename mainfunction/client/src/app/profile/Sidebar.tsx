import React from "react";
import {
  FaShareAlt,
  FaChevronRight,
  FaQrcode,
  FaBolt,
  FaCrown,
  FaCog,
} from "react-icons/fa";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { User } from "./types";

interface SidebarProps {
  user: User | null;
  onShareProfile: () => void;
  onMedicalQR: () => void;
  labels: any;
}

export default function Sidebar({
  user,
  onShareProfile,
  onMedicalQR,
  labels,
}: SidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-10">
      {/* Actions & Sharing */}
      <div className="card-editorial rounded-xl p-8 border border-outline-variant shadow-ambient">
        <h3 className="text-base font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          <FaShareAlt className="text-primary" /> Profile Sharing
        </h3>
        <div className="space-y-4">
          <button
            onClick={onShareProfile}
            className="w-full flex items-center justify-between p-4 bg-surface-container-low hover:bg-primary/5 rounded-xl border border-outline-variant group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-outline-variant group-hover:scale-110 transition-transform">
                <FaShareAlt size={14} />
              </div>
              <div className="text-left">
                <p className="text-xs font-extrabold text-gray-900 uppercase tracking-widest">
                  Public Link
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  Share with caregivers
                </p>
              </div>
            </div>
            <FaChevronRight
              size={10}
              className="text-gray-300 group-hover:translate-x-1 transition-transform"
            />
          </button>

          <button
            onClick={onMedicalQR}
            className="w-full flex items-center justify-between p-4 bg-surface-container-low hover:bg-primary/5 rounded-xl border border-outline-variant group transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-outline-variant group-hover:scale-110 transition-transform">
                <FaQrcode size={14} />
              </div>
              <div className="text-left">
                <p className="text-xs font-extrabold text-gray-900 uppercase tracking-widest">
                  Medical QR
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  Instant scan access
                </p>
              </div>
            </div>
            <FaChevronRight
              size={10}
              className="text-gray-300 group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>

      {/* Subscription Summary */}
      <div className="card-editorial rounded-xl p-8 border border-outline-variant shadow-ambient relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <FaCrown size={80} />
        </div>
        <h3 className="text-base font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          <FaBolt className="text-amber-500" /> Subscription
        </h3>

        <div
          className={`p-6 rounded-xl border mb-6 ${
            user?.subscription?.plan === "premium"
              ? "bg-amber-50 border-amber-100"
              : "bg-surface-container-low border-outline-variant"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <p
              className={`text-[10px] font-extrabold uppercase tracking-widest ${user?.subscription?.plan === "premium" ? "text-amber-700" : "text-gray-500"}`}
            >
              {user?.subscription?.plan === "premium"
                ? "Concierge"
                : "Essential"}
            </p>
            {user?.subscription?.plan === "premium" && (
              <FaCrown className="text-amber-500" size={12} />
            )}
          </div>
          <p className="text-lg font-black text-gray-900 mb-1">
            {user?.subscription?.plan === "premium"
              ? "Unlimited Access"
              : "Monthly Quota"}
          </p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Status: {user?.subscription?.status || "Active"}
          </p>
        </div>

        {user?.subscription?.plan !== "premium" && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">
                <span>AI Consultations</span>
                <span>{user?.usage?.aiConsultations || 0}/5</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(((user?.usage?.aiConsultations || 0) / 5) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            <Link
              href="/pricing"
              className="block w-full py-4 text-center bg-gray-900 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-xl shadow-gray-200 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Upgrade Now
            </Link>
          </div>
        )}
      </div>

      {/* Settings & Identity */}
      <div className="card-editorial rounded-xl p-8 border border-outline-variant shadow-ambient relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <FaCog size={100} />
        </div>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-surface-container-low text-gray-400 rounded-xl flex items-center justify-center text-xl shadow-sm border border-outline-variant">
            <FaCog />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
              {labels.title}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Preference Configuration
            </p>
          </div>
        </div>
        <div className="space-y-6 ">
          <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant flex flex-col  justify-between items-start gap-6 group/item hover:border-primary/20 transition-colors">
            <div className="flex-1">
              <p className="font-black text-gray-900 text-sm mb-1 uppercase tracking-wider">
                {labels.appLang}
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed font-bold uppercase tracking-widest opacity-60">
                {labels.appLangDesc}
              </p>
            </div>
            <div className="relative shrink-0 w-full sm:w-auto">
              <LanguageSwitcher className="!relative !flex-row !bottom-auto !right-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
