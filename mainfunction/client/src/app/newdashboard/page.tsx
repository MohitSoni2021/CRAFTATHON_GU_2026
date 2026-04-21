"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMeasurements } from "@/store/slices/measurementsSlice";
import {
  FaSearch,
  FaBell,
  FaCommentAlt,
  FaMicrophone,
  FaCalendarAlt,
  FaEllipsisH,
  FaVideo,
  FaMapMarkerAlt,
  FaUserMd,
  FaBars,
  FaFileMedical,
  FaChartLine,
} from "react-icons/fa";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";

// Components
import HealthTrendChart from "@/components/dashboard/HealthTrendChart";

export default function NewDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { measurements, loading } = useSelector(
    (state: RootState) => state.measurements,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMeasurements(user.id));
    }
  }, [dispatch, user]);

  const glucoseData = useMemo(() => {
    const data = measurements
      .filter((m) => m.readings.some((r) => r.type === "glucose"))
      .map((m) => {
        const reading = m.readings.find((r) => r.type === "glucose");
        return {
          date: m.date,
          value: reading ? Number(reading.value) : 0,
        };
      })
      .slice(0, 15);

    return [...data].reverse();
  }, [measurements]);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-surface font-jakarta text-[#2c3436]">
        {/* Sidebar Component */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
          {/* Header */}
          <header className="h-24 px-8 flex items-center justify-between bg-transparent sticky top-0 z-30">
            <div className="flex items-center gap-6 flex-1">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-3 text-[#635888] hover:bg-surface-container-low rounded-xl transition-colors"
              >
                <FaBars />
              </button>
              <div className="relative w-full max-w-xl hidden sm:block">
                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#635888]/40 text-sm" />
                <input
                  type="text"
                  placeholder="Search medical records or vitals..."
                  className="input-editorial pl-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4 text-[#635888]/50">
                <button className="p-2.5 hover:bg-surface-container-low rounded-full transition-colors relative">
                  <FaBell />
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#a83836] rounded-full"></span>
                </button>
                <button className="p-2.5 hover:bg-surface-container-low rounded-full transition-colors">
                  <FaCommentAlt />
                </button>
              </div>

              <div className="flex items-center gap-4 pl-8 border-l border-outline-variant">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-[#2c3436] font-jakarta leading-none">
                    {user?.name || "Editorial Curator"}
                  </p>
                  <p className="text-[10px] text-[#635888]/50 font-black uppercase tracking-widest mt-1.5">
                    ID: #{user?.id?.slice(-5) || "88219"}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-on-primary font-bold text-sm shadow-lg shadow-primary/20">
                  {user?.name?.[0] || <FaUserMd />}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-8 overflow-y-auto">
            {/* Top Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* AI Voice Card */}
              <div className="lg:col-span-2 bg-gradient-primary rounded-3xl p-12 text-on-primary relative overflow-hidden group shadow-ambient">
                <div className="absolute top-0 right-0 w-80 h-full opacity-10 pointer-events-none blur-3xl bg-white/20 transition-transform duration-1000"></div>
                <div className="relative z-10 max-w-lg">
                  <h2 className="text-4xl font-bold font-jakarta mb-6 tracking-tight">AI Voice Consultation</h2>
                  <p className="text-on-primary/70 text-sm leading-relaxed mb-10 font-medium">
                    Describe your symptoms naturally. Our empathetic AI curator analyzes your history to provide immediate clinical context and personalized care.
                  </p>
                  <Link href="/consultation" className="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-full font-bold text-sm shadow-xl transition-transform">
                    <FaMicrophone /> Start Voice Session
                  </Link>
                </div>
              </div>

              {/* Daily Insight Card - Tertiary Accent */}
              <div className="bg-[#635888]/5 rounded-3xl p-10 relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-tertiary/10 rounded-full blur-3xl transition-transform duration-1000"></div>
                <div>
                  <span className="bg-tertiary text-on-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">Daily Insight</span>
                  <h3 className="text-2xl font-bold font-jakarta text-[#2c3436] mt-8 mb-4 leading-tight">Optimal Hydration</h3>
                  <p className="text-[#635888]/70 text-sm leading-relaxed font-medium">
                    Based on your glucose levels today, increasing alkaline water intake could help stabilize evening readings.
                  </p>
                </div>
                <button className="text-tertiary text-xs font-black flex items-center gap-2 hover:underline uppercase tracking-widest mt-8">
                  Read full analysis <span>↗</span>
                </button>
              </div>
            </div>

            {/* Middle Section: Info Cards & News */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <div className="lg:col-span-3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Secure Storage */}
                  <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-ambient transition-all duration-500 group">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-8 transition-transform">
                      <FaFileMedical className="text-2xl" />
                    </div>
                    <h4 className="text-lg font-bold text-[#2c3436] font-jakarta mb-2">Secure Storage</h4>
                    <p className="text-[11px] text-[#635888]/50 font-bold leading-relaxed mb-8 uppercase tracking-wider">
                      256-bit encrypted medical records vault.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">1.2 GB USED</span>
                      <span className="text-primary text-xl">→</span>
                    </div>
                  </div>

                  {/* Vital Trends */}
                  <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-ambient transition-all duration-500 group">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-8 transition-transform">
                      <FaChartLine className="text-2xl" />
                    </div>
                    <h4 className="text-lg font-bold text-[#2c3436] font-jakarta mb-2">Vital Trends</h4>
                    <p className="text-[11px] text-[#635888]/50 font-bold leading-relaxed mb-8 uppercase tracking-wider">
                      Real-time monitoring of sync'd devices.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">3 ACTIVE FEEDS</span>
                      <span className="text-primary text-xl">→</span>
                    </div>
                  </div>

                  {/* Smart Insights */}
                  <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-ambient transition-all duration-500 group">
                    <div className="w-14 h-14 bg-tertiary/5 rounded-2xl flex items-center justify-center text-tertiary mb-8 transition-transform">
                      <FaBell className="text-2xl" />
                    </div>
                    <h4 className="text-lg font-bold text-[#2c3436] font-jakarta mb-2">Smart Insights</h4>
                    <p className="text-[11px] text-[#635888]/50 font-bold leading-relaxed mb-8 uppercase tracking-wider">
                      Curated health tips based on recent labs.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-tertiary text-[10px] font-black uppercase tracking-[0.2em]">12 NEW TIPS</span>
                      <span className="text-tertiary text-xl">→</span>
                    </div>
                  </div>
                </div>

                {/* Glucose Trends Chart */}
                <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-ambient">
                   <HealthTrendChart
                      title="Glucose Trends History"
                      data={glucoseData}
                      dataKey="value"
                      color="#006977"
                    />
                </div>
              </div>

              {/* Sidebar Right Column */}
              <div className="space-y-8">
                <HealthNewsWidget />
                <UpcomingAppointments />
              </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-ambient overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-2xl font-bold font-jakarta text-[#2c3436]">Recent Activity</h3>
                    <p className="text-[11px] text-[#635888]/60 font-black uppercase tracking-[0.2em] mt-1.5">Clinical Audit Trail</p>
                </div>
                <Link href="/history" className="text-[10px] font-black text-primary hover:underline uppercase tracking-[0.2em]">Full History Log</Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="text-[10px] text-[#635888]/50 font-black uppercase tracking-[0.25em] border-b border-surface-container-low">
                      <th className="text-left pb-6">Activity Name</th>
                      <th className="text-left pb-6">Clinical Department</th>
                      <th className="text-left pb-6">Date & Time</th>
                      <th className="text-left pb-6">Status</th>
                      <th className="text-right pb-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    {[
                      { name: "Blood Glucose Sync", dept: "Metabolic Care", time: "Today, 09:45 AM", status: "SUCCESSFUL", color: "text-primary bg-primary/5" },
                      { name: "Lab Results Uploaded", dept: "Diagnostic Labs", time: "Yesterday, 04:20 PM", status: "COMPLETED", color: "text-primary bg-primary/5" },
                      { name: "High Heart Rate Alert", dept: "Cardiology", time: "Oct 24, 02:15 PM", status: "ACTION REQUIRED", color: "text-[#a83836] bg-[#a83836]/5" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-surface-container-low transition-colors duration-300">
                        <td className="py-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 ${row.color.split(' ')[1]} rounded-xl flex items-center justify-center text-sm`}>
                              <FaFileMedical />
                            </div>
                            <span className="text-sm font-bold text-[#2c3436]">{row.name}</span>
                          </div>
                        </td>
                        <td className="py-6 text-[11px] text-[#635888]/70 font-bold uppercase tracking-wider">{row.dept}</td>
                        <td className="py-6 text-[11px] text-[#635888]/70 font-bold uppercase tracking-wider">{row.time}</td>
                        <td className="py-6">
                          <span className={`text-[9px] font-black px-3 py-1 rounded-lg tracking-widest ${row.color}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-6 text-right">
                          <button className="text-[#635888]/30 hover:text-primary transition-colors"><FaEllipsisH /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Branding */}
            <div className="mt-10 pt-10 border-t border-outline-variant flex flex-col lg:flex-row items-center justify-between gap-6 pb-8">
              <div className="flex-1">
                <h2 className="text-xl font-bold font-jakarta text-primary mb-3">The Clinical Editorial</h2>
                <p className="text-[12px] text-[#635888]/60 leading-relaxed max-w-lg font-medium">
                  Curating high-fidelity clinical data with empathy and precision. <br /> HIPAA compliant medical portal © 2024.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-10 text-[10px] font-black text-[#635888]/40 uppercase tracking-[0.2em]">
                <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
                <Link href="#" className="hover:text-primary transition-colors">Compliance</Link>
                <button className="btn-primary py-3 px-8 text-[11px]">Get Started with AI</button>
              </div>
            </div>
            <p className="text-[9px] text-center text-[#635888]/30 font-black uppercase tracking-[0.3em] mt-10">THE CLINICAL EDITORIAL • HIGH-FIDELITY MEDICAL PORTAL</p>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
