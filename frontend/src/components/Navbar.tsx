"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { 
  Activity, 
  Bell, 
  LogOut, 
  Pill, 
  History, 
  LayoutDashboard, 
  Brain, 
  HeartPulse, 
  Stethoscope, 
  CalendarCheck,
  User,
  Settings,
  ChevronDown
} from "lucide-react"
import { APP_NAME } from "@/constants"
import NotificationPopover from "./NotificationPopover"

interface NavbarProps {
  user: any;
  riskLevel?: string;
}

export default function Navbar({ user, riskLevel }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
  ] : [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Today's Meds", href: "/today", icon: CalendarCheck },
    { name: "Medications", href: "/medications", icon: Pill },
    { name: "Adherence AI", href: "/adherence", icon: Brain },
    { name: "Dose Logs", href: "/history", icon: History },
    { name: "Care Network", href: "/caregiver", icon: HeartPulse },
  ]

  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
      <div className="flex items-center gap-3">
        <Link href={isDoctor ? "/doctor" : "/dashboard"} className="flex items-center gap-3 group">
          <div className="bg-[#e6fcfa] p-2 rounded-xl text-[#3bbdbf] group-hover:scale-110 transition-transform">
            <Activity size={24} />
          </div>
          <span className="font-bold text-xl text-[#2b3654]">{APP_NAME} <span className="font-medium text-gray-400">| {isDoctor ? 'Doctor' : isCaregiver ? 'Caregiver' : 'Patient'}</span></span>
        </Link>
      </div>
      
      <div className="hidden lg:flex items-center gap-2 mx-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link 
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-[#f0f9fa] text-[#3bbdbf]' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#2b3654]'
              }`}
            >
              <link.icon size={18} />
              {link.name}
            </Link>
          )
        })}
      </div>

      <div className="flex items-center gap-4">
        <NotificationPopover />
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 relative" ref={dropdownRef}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none text-[#2b3654]">{user?.name}</p>
            {riskLevel && (
              <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block ${
                (riskLevel === 'low' || riskLevel === 'safe' || riskLevel === 'LOW') 
                  ? 'bg-green-50 text-green-600 border-green-100' 
                  : (riskLevel === 'medium' || riskLevel === 'MEDIUM') 
                    ? 'bg-amber-50 text-amber-600 border-amber-100' 
                    : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {riskLevel} Risk
              </p>
            )}
          </div>
          
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 focus:outline-none"
          >
            <img 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} 
              alt="Avatar" 
              className={`w-10 h-10 rounded-full border-2 object-cover shadow-sm transition-all duration-200 ${
                showDropdown ? 'border-[#3bbdbf] scale-105' : 'border-[#e6fcfa]'
              }`} 
            />
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-60">
               <div className="px-4 py-3 border-b border-gray-50">
                 <p className="text-sm font-bold text-[#2b3654] truncate">{user?.name}</p>
                 <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5 tracking-widest">{user?.role}</p>
               </div>
               
               <div className="p-1">
                 <Link 
                   href="/profile" 
                   onClick={() => setShowDropdown(false)}
                   className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-[#f0f9fa] hover:text-[#3bbdbf] rounded-xl transition-all"
                 >
                   <User size={18} />
                   My Profile
                 </Link>
                 <Link 
                   href="/dashboard" 
                   onClick={() => setShowDropdown(false)}
                   className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                 >
                   <Settings size={18} />
                   Account Settings
                 </Link>
               </div>

               <div className="p-1 mt-1 pt-1 border-t border-gray-50">
                 <button 
                   onClick={handleLogout}
                   className="flex items-center gap-3 w-full text-left px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                 >
                   <LogOut size={18} />
                   Sign Out
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
