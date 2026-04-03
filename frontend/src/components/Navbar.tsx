"use client"

import React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Activity, Bell, LogOut } from "lucide-react"
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

  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-[#e6fcfa] p-2 rounded-xl text-[#3bbdbf]">
            <Activity size={24} />
          </div>
          <span className="font-bold text-xl text-[#2b3654]">{APP_NAME} <span className="font-medium text-gray-400">| Patient</span></span>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center gap-6 mx-auto">
        <Link 
          href="/dashboard" 
          className={`font-semibold transition-colors ${pathname === '/dashboard' ? 'text-[#3bbdbf] border-b-2 border-[#3bbdbf] pb-1' : 'text-gray-500 hover:text-[#3bbdbf]'}`}
        >
          Overview
        </Link>
        <Link 
          href="/medications" 
          className={`font-semibold transition-colors ${pathname === '/medications' ? 'text-[#3bbdbf] border-b-2 border-[#3bbdbf] pb-1' : 'text-gray-500 hover:text-[#3bbdbf]'}`}
        >
          Medicine Cabinet
        </Link>
        <Link href="#" className="text-gray-500 hover:text-[#3bbdbf] font-semibold transition-colors">Reports</Link>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-[#2b3654] transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none text-[#2b3654]">{user?.name}</p>
            {riskLevel && <p className="text-xs text-gray-500 mt-1">Status: {riskLevel.toUpperCase()}</p>}
          </div>
          <img 
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full border-2 border-[#e6fcfa] object-cover" 
          />
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  )
}
