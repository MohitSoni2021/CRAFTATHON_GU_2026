import React from "react";
import Link from "next/link";
import { FaRobot, FaMicrophone, FaFileMedical, FaArrowRight } from "react-icons/fa";

export default function DashboardHero() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* AI Assistant Banner */}
      <div
        id="onboarding-ai-assistant"
        className="lg:col-span-2 relative overflow-hidden rounded-xl bg-gradient-primary shadow-ambient group"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-lg blur-3xl transition-transform duration-1000"></div>

        <div className="relative z-10 p-8 flex flex-col items-start h-full justify-between">
          <div>
            <div className="flex items-center space-x-3 text-on-primary/70 text-[11px] font-bold mb-6 tracking-widest uppercase">
              <FaRobot className="text-lg" /> <span>Clinical AI Assistant</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight max-w-md">
              Describe your symptoms naturally. <br /> Let our AI curate your care.
            </h2>
            <p className="text-on-primary/60 text-sm max-w-lg mt-2 leading-relaxed">
              Immediate insights derived from your medical history and real-time clinical data.
            </p>
          </div>
          <Link
            href="/consultation"
            className="mt-8 bg-white text-primary px-10 py-4 rounded-lg font-bold text-sm shadow-xl flex items-center space-x-3 hover:bg-opacity-90 transition-opacity"
          >
            <FaMicrophone /> <span>Start Voice Session</span>
          </Link>
        </div>
      </div>

      {/* Lab Reports Quick Link */}
      <Link
        id="onboarding-lab-reports"
        href="/lab-reports"
        className="group relative overflow-hidden rounded-xl bg-surface-container-low p-8 flex flex-col justify-between hover:bg-surface-container-high transition-all duration-500"
      >
        <div className="flex items-start justify-between mb-8 relative z-10">
          <div className="p-5 bg-white text-primary rounded-lg shadow-sm transition-transform duration-500 group-hover:scale-105">
            <FaFileMedical className="text-3xl" />
          </div>
        </div>

        <div className="relative z-10">
          <h3 className="text-xl font-bold text-[#2c3436] mb-2">Lab Reports</h3>
          <p className="text-[#635888]/70 text-xs leading-relaxed mb-8 font-medium">
            High-fidelity analysis of your clinical results.
          </p>
          <div className="text-primary font-bold text-sm flex items-center transition-transform group-hover:translate-x-1">
            Upload and Curate <FaArrowRight className="ml-3" />
          </div>
        </div>
      </Link>
    </div>
  );
}
