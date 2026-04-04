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
    <aside className={`w-72 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.01)] ${poppins.className}`}>
      {/* Sidebar Header: Logo Area */}
      <div className="p-8 pb-12">
        <Link href={isDoctor ? "/doctor" : "/dashboard"} className="flex items-center gap-3.5 group">
          <div className="bg-[#008080] p-2.5 rounded-2xl text-white shadow-xl shadow-[#008080]/20 group-hover:scale-110 transition-transform duration-500">
            <Activity size={26} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl tracking-tighter text-[#1a2233] leading-none">{APP_NAME}</span>
            <span className="text-[9px] uppercase font-black text-[#008080] mt-1.5 tracking-[2.5px] leading-none opacity-60">
               {isDoctor ? 'Clinical' : isCaregiver ? 'Supervisor' : 'Patient'} Hub
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Space */}
      <div className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <p className="px-5 text-[10px] font-black text-gray-300 uppercase tracking-[4px] mb-6 mt-2 flex items-center gap-2">
           <div className="w-4 h-[1px] bg-gray-200"></div> Menu
        </p>
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link 
              key={link.href}
              href={link.href}
              className={`flex items-center gap-4 px-5 py-4 rounded-[1.25rem] font-bold transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-[#e6f2f2] text-[#008080] shadow-sm' 
                  : 'text-gray-400 hover:bg-gray-50/80 hover:text-[#1a2233]'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 w-1.5 h-6 bg-[#008080] rounded-full scale-y-100 opacity-100 transition-all"></div>
              )}
              <link.icon size={20} className={`${isActive ? 'text-[#008080]' : 'text-gray-300 group-hover:text-[#008080]'} transition-colors duration-300`} />
              <span className="text-[13px] font-bold uppercase tracking-wider">{link.name}</span>
            </Link>
          )
        })}
      </div>

      {/* User Information & System Status */}
      <div className="p-6 mt-auto border-t border-gray-50 bg-gray-50/30">
        
        {riskLevel && (
           <div className={`mb-6 p-4 rounded-3xl border flex flex-col gap-2 transition-all hover:scale-[1.02] ${
              (riskLevel.toLowerCase() === 'low' || riskLevel.toLowerCase() === 'safe') 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm' 
                : (riskLevel.toLowerCase() === 'medium') 
                  ? 'bg-amber-50 border-amber-100 text-amber-700 shadow-sm' 
                  : 'bg-red-50 border-red-100 text-red-700 shadow-sm'
           }`}>
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Condition</span>
                <ShieldCheck size={14} className="animate-pulse" />
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-widest">{riskLevel} RISK</span>
                <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ${
                   (riskLevel.toLowerCase() === 'low' || riskLevel.toLowerCase() === 'safe') ? 'bg-emerald-500' : riskLevel.toLowerCase() === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                }`}></div>
             </div>
           </div>
        )}

        <div className="bg-white p-4 rounded-[1.5rem] border border-gray-100 flex items-center gap-3 mb-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/profile')}>
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-inner border border-gray-100 shrink-0">
             <img 
               src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} 
               alt="Avatar" 
               className="w-full h-full object-cover bg-white" 
             />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-[#1a2233] truncate uppercase tracking-tight leading-none mb-1">{user?.name}</p>
            <p className="text-[9px] font-semibold text-gray-400 truncate uppercase tracking-[1px] leading-none">{user?.role}</p>
          </div>
          <ChevronRight size={14} className="text-gray-300" />
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2.5 w-full py-4 text-[10px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all uppercase tracking-[2.5px]"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
