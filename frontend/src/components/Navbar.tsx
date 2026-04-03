"use client"

import React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Activity, Bell, LogOut, Pill, History, LayoutDashboard, Brain, HeartPulse } from "lucide-react"
import { APP_NAME } from "@/constants"

interface NavbarProps {
  user: any;
  riskLevel?: string;
}

export default function Navbar({ user, riskLevel }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      router.push("/login")
    }
  }

  const navLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Medications", href: "/medications", icon: Pill },
    { name: "Adherence AI", href: "/adherence", icon: Brain },
    { name: "Dose Logs", href: "/history", icon: History },
    { name: "Care Network", href: "/caregiver", icon: HeartPulse },
  ]

  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-[#e6fcfa] p-2 rounded-xl text-[#3bbdbf] group-hover:scale-110 transition-transform">
            <Activity size={24} />
          </div>
          <span className="font-bold text-xl text-[#2b3654]">{APP_NAME} <span className="font-medium text-gray-400">| {user?.role === 'caregiver' ? 'Caregiver' : 'Patient'}</span></span>
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
        <button className="p-2 text-gray-400 hover:text-[#2b3654] transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
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
          <img 
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full border-2 border-[#e6fcfa] object-cover shadow-sm" 
          />
          <button 
            onClick={handleLogout}
            className="p-2 ml-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  )
}
