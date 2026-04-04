"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  Activity, 
  LayoutDashboard, 
  CalendarCheck, 
  Pill, 
  Brain, 
  History, 
  HeartPulse, 
  Stethoscope, 
  LogOut, 
  Settings,
  ShieldCheck,
  ChevronRight
} from "lucide-react"
import { APP_NAME } from "@/constants"
import { Poppins } from "next/font/google"

const poppins = Poppins({ weight: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] });

interface SidebarProps {
  user: any;
  riskLevel?: string;
}

export default function Sidebar({ user, riskLevel }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      router.push("/login")
    }
  }

  const isDoctor = user?.role === 'doctor'
  const isCaregiver = user?.role === 'caregiver'

  const navLinks = isDoctor ? [
    { name: "My Patients", href: "/doctor", icon: Stethoscope },
    { name: "Clinical Analytics", href: "/dashboard", icon: LayoutDashboard },
    { name: "Global Logs", href: "/history", icon: History },
    { name: "Profile & Identity", href: "/profile", icon: Settings },
  ] : [
    { name: "Health Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Today's Meds", href: "/today", icon: CalendarCheck },
    { name: "My Cabinet", href: "/medications", icon: Pill },
    { name: "Adherence AI", href: "/adherence", icon: Brain },
    { name: "Clinical History", href: "/history", icon: History },
    { name: "Care Network", href: "/caregiver", icon: HeartPulse },
  ]

  return (
    <aside className={`w-80 h-[calc(100vh-2rem)] bg-white flex flex-col fixed left-4 top-4 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[3rem] border border-gray-50/50 ${poppins.className}`}>
      {/* Sidebar Header: Logo Area */}
      <div className="p-8 pb-10">
        <Link href={isDoctor ? "/doctor" : "/dashboard"} className="flex items-center gap-3.5 group">
          <div className="bg-[#008080] p-3 rounded-2xl text-white shadow-xl shadow-[#008080]/20 group-hover:scale-110 transition-transform duration-500">
            <Activity size={26} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter text-[#1a2233] leading-none uppercase">{APP_NAME}</span>
            <span className="text-[9px] uppercase font-black text-[#008080] mt-1.5 tracking-[2px] leading-none opacity-60">
               {isDoctor ? 'Clinical' : isCaregiver ? 'Supervisor' : 'Patient'} Hub
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Space */}
      <div className="flex-1 px-5 space-y-1 overflow-y-auto no-scrollbar">
        <p className="px-5 text-[10px] font-black text-gray-300 uppercase tracking-[5px] mb-6 mt-4 flex items-center gap-2">
           <div className="w-5 h-[1px] bg-gray-200"></div> Menu
        </p>
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link 
              key={link.href}
              href={link.href}
              className={`flex items-center gap-4 px-6 py-4.5 rounded-[1.75rem] font-bold transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-[#008080] text-white shadow-lg shadow-[#008080]/20' 
                  : 'text-gray-400 hover:bg-[#f8fafb] hover:text-[#008080]'
              }`}
            >
              <link.icon size={20} className={`${isActive ? 'text-white' : 'text-gray-300 group-hover:text-[#008080]'} transition-colors duration-300`} />
              <span className="text-[12px] font-black uppercase tracking-wider">{link.name}</span>
              {!isActive && <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
            </Link>
          )
        })}
      </div>

      {/* User Information & System Status */}
      <div className="p-6 mt-auto">
        
        {riskLevel && (
           <div className={`mb-6 p-5 rounded-[2.5rem] border flex flex-col gap-2.5 transition-all hover:scale-[1.02] ${
              (riskLevel.toLowerCase() === 'low' || riskLevel.toLowerCase() === 'safe') 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm' 
                : (riskLevel.toLowerCase() === 'medium') 
                  ? 'bg-amber-50 border-amber-100 text-amber-700 shadow-sm' 
                  : 'bg-red-50 border-red-100 text-red-700 shadow-sm'
           }`}>
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Session Condition</span>
                <ShieldCheck size={16} className="animate-pulse text-[#008080]" />
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[12px] font-black uppercase tracking-wider">{riskLevel} RISK ENGINE</span>
                <div className={`w-3 h-3 rounded-full shadow-[0_0_12px_currentColor] animate-pulse ${
                   (riskLevel.toLowerCase() === 'low' || riskLevel.toLowerCase() === 'safe') ? 'bg-emerald-500' : riskLevel.toLowerCase() === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                }`}></div>
             </div>
           </div>
        )}

        <div className="bg-gray-50/50 p-4 rounded-[2rem] border border-gray-100/50 flex items-center gap-4 mb-4 shadow-sm hover:shadow-md hover:bg-white transition-all cursor-pointer group" onClick={() => router.push('/profile')}>
          <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-inner border-2 border-white group-hover:border-[#008080]/20 transition-all shrink-0">
             <img 
               src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} 
               alt="Avatar" 
               className="w-full h-full object-cover bg-white" 
             />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-black text-[#1a2233] truncate uppercase tracking-tight leading-none mb-1.5">{user?.name}</p>
            <p className="text-[9px] font-black text-[#008080] truncate uppercase tracking-[1.5px] leading-none opacity-60">{user?.role} NODE</p>
          </div>
          <ChevronRight size={14} className="text-gray-300 group-hover:text-[#008080] group-hover:translate-x-1 transition-all" />
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2.5 w-full py-4 text-[10px] font-black text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-all uppercase tracking-[3px]"
        >
          <LogOut size={16} />
          Terminate Session
        </button>
      </div>
    </aside>
  )
}
