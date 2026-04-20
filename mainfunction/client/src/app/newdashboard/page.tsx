"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchMeasurements } from "@/store/slices/measurementsSlice";
import {
  FaSearch,
  FaPills,
  FaVial,
  FaUserMd,
  FaExchangeAlt,
  FaHeartbeat,
  FaBookMedical,
  FaPlusCircle,
  FaTag,
  FaShoppingCart,
  FaUser,
  FaChevronRight,
  FaMicrophone,
  FaFileMedical,
  FaHistory,
  FaNotesMedical,
  FaWeight,
  FaCalendarAlt,
} from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Components
import HealthNewsWidget from "@/components/dashboard/HealthNewsWidget";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
import HealthTrendChart from "@/components/dashboard/HealthTrendChart";

const features = [
  {
    name: "Medicine",
    icon: <FaPills />,
    color: "text-rose-500",
    bgColor: "bg-rose-50",
    link: "/scan",
  },
  {
    name: "Lab Reports",
    icon: <FaVial />,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    link: "/lab-reports",
  },
  {
    name: "Consultation",
    icon: <FaUserMd />,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    link: "/consultation",
  },
  {
    name: "Health Vitals",
    icon: <FaHeartbeat />,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    link: "/measurements",
  },
  {
    name: "Appointments",
    icon: <FaCalendarAlt />,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    link: "/appointments",
  },
  {
    name: "Medical History",
    icon: <FaHistory />,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    link: "/medical-info",
  },
  {
    name: "Health Insights",
    icon: <FaBookMedical />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    link: "/insights",
  },
  {
    name: "Profile",
    icon: <FaUser />,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    link: "/profile",
  },
];

export default function NewDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { measurements, loading } = useSelector(
    (state: RootState) => state.measurements,
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMeasurements(user.id));
    }
  }, [dispatch, user]);

  // Chart Data Preparation for Glucose Trends
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
      .slice(0, 7);

    return [...data].reverse();
  }, [measurements]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white font-inter">
        {/* Header */}
        <header className="border-b border-gray-100 sticky top-0 bg-white z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#3AAFA9] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#3AAFA9]/20">
                  D
                </div>
                <span className="font-extrabold text-xl text-gray-900 tracking-tight">
                  Docmetry
                </span>
              </Link>
              <nav className="hidden lg:flex items-center gap-6 text-[12px] font-semibold text-gray-600 uppercase tracking-wide">
                <Link
                  href="/measurements"
                  className="hover:text-[#3AAFA9] transition-colors"
                >
                  Vitals
                </Link>
                <Link
                  href="/lab-reports"
                  className="hover:text-[#3AAFA9] transition-colors"
                >
                  Lab Reports
                </Link>
                <Link
                  href="/consultation"
                  className="hover:text-[#3AAFA9] transition-colors"
                >
                  Consult
                </Link>
                <Link
                  href="/medical-info"
                  className="hover:text-[#3AAFA9] transition-colors"
                >
                  Records
                </Link>
                <Link
                  href="/insights"
                  className="hover:text-[#3AAFA9] transition-colors"
                >
                  Insights
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-6 text-gray-600 font-semibold text-[12px]">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 hover:text-[#3AAFA9]"
              >
                <FaUser size={12} /> <span>{user?.name || "Profile"}</span>
              </Link>
              <Link
                href="/share"
                className="flex items-center gap-1.5 hover:text-[#3AAFA9]"
              >
                <FaTag size={12} /> <span>Invite</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Search Section */}
          <div className="text-center mb-10">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">
              How can we help you today?
            </h1>
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#3AAFA9] transition-colors">
                <FaSearch size={14} />
              </div>
              <input
                type="text"
                placeholder="Search your medical records, vitals, or symptoms"
                className="w-full h-12 pl-12 pr-28 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#3AAFA9] focus:ring-4 focus:ring-[#3AAFA9]/10 outline-none transition-all text-sm text-gray-700 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-[#3AAFA9] text-white rounded-full font-bold text-xs hover:bg-[#2B7A78] transition-all shadow-md active:scale-95">
                Search
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-12">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.link}
                className="flex flex-col items-center group"
              >
                <div
                  className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center text-2xl ${feature.color} mb-2 group-hover:-translate-y-1 transition-all duration-300 shadow-sm group-hover:shadow-md`}
                >
                  {feature.icon}
                </div>
                <span className="text-[12px] font-bold text-gray-800 text-center">
                  {feature.name}
                </span>
              </Link>
            ))}
          </div>

          {/* AI Assistant & Lab Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#17252A] to-[#2B7A78] shadow-lg group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="relative z-10 p-8 flex flex-col items-start h-full justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-[#DEF2F1] text-[10px] font-bold mb-4 tracking-widest uppercase">
                    <FaHistory className="animate-pulse" />{" "}
                    <span>AI Health Assistant</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2 leading-tight">
                    Voice Consultation <br /> Powered by AI
                  </h2>
                  <p className="text-[#DEF2F1]/80 text-[11px] max-w-lg mt-1 font-medium">
                    Describe your symptoms naturally using voice and get instant
                    preliminary analysis.
                  </p>
                </div>
                <Link
                  href="/consultation"
                  className="mt-8 bg-white text-[#2B7A78] px-6 py-2.5 rounded-xl font-bold text-xs shadow-xl hover:bg-gray-50 hover:scale-105 transition-all flex items-center space-x-2"
                >
                  <FaMicrophone /> <span>Start Session</span>
                </Link>
              </div>
            </div>

            <Link
              href="/lab-reports"
              className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-8 flex flex-col justify-between hover:border-[#3AAFA9]/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#3AAFA9] opacity-5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="p-4 bg-teal-50 text-[#3AAFA9] rounded-2xl group-hover:rotate-12 transition-transform duration-300">
                  <FaFileMedical className="text-2xl" />
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  Smart Lab Reports
                </h3>
                <p className="text-gray-500 text-[10px] leading-relaxed mb-4 font-medium">
                  AI-driven analysis of your medical blood work and tests.
                </p>
                <div className="text-[#3AAFA9] font-bold text-xs flex items-center group-hover:translate-x-1 transition-transform">
                  View Reports <FaArrowRight size={10} className="ml-2" />
                </div>
              </div>
            </Link>
          </div>

          {/* Banners Section - Now Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            <div className="relative h-40 rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <div className="absolute inset-0 bg-[#f8fcfb]"></div>
              <div className="absolute inset-0 p-5 flex flex-col justify-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#3AAFA9] mb-1.5">
                  SECURE STORAGE
                </span>
                <h3 className="text-base font-bold text-gray-800 mb-1">
                  All your records in one place.
                </h3>
                <p className="text-[11px] text-gray-500 mb-3 font-medium">
                  Encrypted and accessible only by you.
                </p>
                <Link
                  href="/medical-info"
                  className="text-[#3AAFA9] font-bold text-[10px] uppercase hover:underline"
                >
                  Manage Records
                </Link>
              </div>
            </div>

            <div className="relative h-40 rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <div className="absolute inset-0 bg-[#fffbf8]"></div>
              <div className="absolute inset-0 p-5 flex flex-col justify-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500 mb-1.5">
                  VITAL MONITORING
                </span>
                <h3 className="text-base font-bold text-gray-800 mb-1">
                  Track your trends over time.
                </h3>
                <p className="text-[11px] text-gray-500 mb-3 font-medium">
                  Visualize your health data with smart charts.
                </p>
                <Link
                  href="/measurements"
                  className="text-orange-500 font-bold text-[10px] uppercase hover:underline"
                >
                  Check Vitals
                </Link>
              </div>
            </div>

            <div className="relative h-40 rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <div className="absolute inset-0 bg-[#f8f8ff]"></div>
              <div className="absolute inset-0 p-5 flex flex-col justify-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 mb-1.5">
                  SMART INSIGHTS
                </span>
                <h3 className="text-base font-bold text-gray-800 mb-1">
                  Personalized health tips.
                </h3>
                <p className="text-[11px] text-gray-500 mb-3 font-medium">
                  Articles tailored to your health profile.
                </p>
                <Link
                  href="/insights"
                  className="text-indigo-600 font-bold text-[10px] uppercase hover:underline"
                >
                  Read More
                </Link>
              </div>
            </div>
          </div>

          {/* Trends & Health News Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Glucose Trends Chart & Appointments Column */}
            <div className="lg:col-span-2 grid grid-rows-2 gap-8">
              {/* Glucose Trends Chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-800">
                    Glucose Trends History
                  </h3>
                  <Link
                    href="/measurements"
                    className="text-[#3AAFA9] font-bold hover:underline text-[11px]"
                  >
                    View Details
                  </Link>
                </div>
                <div className="flex-1 min-h-0">
                  <HealthTrendChart
                    title=""
                    data={glucoseData}
                    dataKey="value"
                    color="#3AAFA9"
                  />
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="h-full">
                <UpcomingAppointments />
              </div>
            </div>

            {/* Health News Column */}
            <div className="space-y-6">
              <HealthNewsWidget />
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-gray-800">
                  Your Recent Activity
                </h3>
                <Link
                  href="/measurements"
                  className="text-[#3AAFA9] font-bold hover:underline text-[11px]"
                >
                  View Full History
                </Link>
              </div>

              {measurements.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-xs font-medium">
                    No activity yet.
                  </p>
                  <p className="text-gray-300 text-[10px] mt-1">
                    Your health updates will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {measurements.slice(0, 3).map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 group"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#DEF2F1] text-[#2B7A78] rounded-full flex items-center justify-center mr-3">
                          <FaCalendarAlt size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-[12px] text-gray-800">
                            Health Check-in
                          </p>
                          <p className="text-[10px] text-gray-500 font-medium">
                            {new Date(m.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                        {m.readings.length} readings recorded
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* App Branding Info */}
          <div className="bg-[#17252A] rounded-2xl p-8 text-white flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-black mb-3">Docmetry Health.</h2>
              <p className="text-[12px] text-[#DEF2F1]/80 leading-relaxed max-w-lg mb-6 font-medium">
                A comprehensive platform for managing your lifelong health
                journey. From AI-assisted analysis to smart record keeping, we
                put you in control of your data.
              </p>
            </div>
            <div className="flex-1 w-full max-w-sm bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 text-center">
              <h4 className="font-bold text-sm mb-3">Get Started with AI</h4>
              <p className="text-[11px] text-[#DEF2F1]/70 mb-5 font-medium">
                Ready for your first smart consultation?
              </p>
              <Link
                href="/consultation"
                className="block w-full py-3 bg-[#3AAFA9] text-white rounded-lg font-bold text-xs hover:bg-[#2B7A78] transition-all"
              >
                Launch Voice Assistant
              </Link>
            </div>
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around h-16 px-4 z-50">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 text-gray-400"
          >
            <FaHistory size={20} />
            <span className="text-[10px] font-bold">Dashboard</span>
          </Link>
          <Link
            href="/newdashboard"
            className="flex flex-col items-center gap-1 text-[#3AAFA9]"
          >
            <FaSearch size={20} />
            <span className="text-[10px] font-bold">Search</span>
          </Link>
          <div className="relative -top-6">
            <Link
              href="/consultation"
              className="w-14 h-14 bg-[#3AAFA9] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#3AAFA9]/40 border-4 border-white"
            >
              <FaMicrophone size={24} />
            </Link>
          </div>
          <Link
            href="/lab-reports"
            className="flex flex-col items-center gap-1 text-gray-400"
          >
            <FaVial size={20} />
            <span className="text-[10px] font-bold">Labs</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center gap-1 text-gray-400"
          >
            <FaUser size={20} />
            <span className="text-[10px] font-bold">Profile</span>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
