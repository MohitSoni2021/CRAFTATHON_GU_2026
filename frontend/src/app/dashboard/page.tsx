"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/constants"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Activity, Bell, Settings, LogOut, CheckCircle2, AlertCircle, Clock, CalendarDays, ActivitySquare, ShieldCheck } from "lucide-react"

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      const encryptedUser = localStorage.getItem("user")
      
      if (!encryptedUser) {
        router.push("/login")
      } else {
        const decryptedUser = decryptData(encryptedUser)
        if (!decryptedUser) {
          localStorage.removeItem("user")
          router.push("/login")
        } else {
          setUser(decryptedUser)
          setLoading(false)
        }
      }
    }
  }, [router])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      router.push("/login")
    }
  }

  if (loading) {
    return (
      <div className={`flex h-screen items-center justify-center bg-[#f8faff] ${jakarta.className}`}>
        <div className="flex flex-col items-center gap-4">
          <Activity size={40} className="text-[#3bbdbf] animate-pulse" />
          <p className="text-[#7b8ea6] font-semibold">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-[#f8faff] text-[#2b3654] ${jakarta.className}`}>
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#e6fcfa] p-2 rounded-xl text-[#3bbdbf]">
            <Activity size={24} />
          </div>
          <span className="font-bold text-xl">{APP_NAME} <span className="font-medium text-gray-400">| Patient</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 mx-auto">
          <Link href="/dashboard" className="text-[#3bbdbf] font-bold border-b-2 border-[#3bbdbf] pb-1">Overview</Link>
          <Link href="/medications" className="text-gray-500 hover:text-[#3bbdbf] font-semibold transition-colors">Medicine Cabinet</Link>
          <Link href="#" className="text-gray-500 hover:text-[#3bbdbf] font-semibold transition-colors">Reports</Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-400 hover:text-[#2b3654] transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{user?.name}</p>
              <p className="text-xs text-gray-500 mt-1">Status: Adherent</p>
            </div>
            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#e6fcfa] object-cover" />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#2b7a8c] to-[#3bbdbf] rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-center overflow-hidden relative">
          {/* Decorative background circle */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 space-y-2 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Good morning, {user?.name?.split(' ')[0] || "User"}!</h1>
            <p className="text-white/80 font-medium text-lg">You have <strong className="text-white">2 medications</strong> scheduled for today.</p>
          </div>
          
          <div className="relative z-10 mt-6 md:mt-0 flex gap-3">
             <Link href="/medications">
               <Button className="bg-white text-[#2b7a8c] hover:bg-gray-50 rounded-full px-6 font-bold shadow-lg">
                 Manage My Cabinet
               </Button>
             </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-12 h-12 bg-[#f0f4ff] text-[#4a7ae6] rounded-2xl flex items-center justify-center mb-4">
               <ActivitySquare size={24} />
             </div>
             <p className="text-gray-500 font-semibold mb-1">Adherence Score</p>
             <h3 className="text-3xl font-bold flex items-end gap-2">94% <span className="text-sm text-green-500 font-bold mb-1">+2%</span></h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-12 h-12 bg-[#e6fcfa] text-[#3bbdbf] rounded-2xl flex items-center justify-center mb-4">
               <ShieldCheck size={24} />
             </div>
             <p className="text-gray-500 font-semibold mb-1">Risk Classification</p>
             <h3 className="text-3xl font-bold text-green-600">LOW RISK</h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-12 h-12 bg-gray-50 text-gray-500 rounded-2xl flex items-center justify-center mb-4">
               <LogOut size={24} />
             </div>
             <p className="text-gray-500 font-semibold mb-1">Account Options</p>
             <div className="flex gap-2 mt-2">
               <Button variant="outline" size="sm" className="rounded-xl border-gray-200" onClick={handleLogout}>Log Out</Button>
               <Button variant="outline" size="sm" className="rounded-xl border-gray-200">Settings</Button>
             </div>
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
           
           {/* Left Column: Today's Schedule */}
           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2"><CalendarDays size={20} className="text-[#3bbdbf]" /> Today's Schedule</h2>
                <Button variant="ghost" className="text-[#3bbdbf] font-bold">View History</Button>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                {/* Single Item */}
                <div className="p-6 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#e6faeb] text-[#28a745] flex items-center justify-center">
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Metformin (500mg)</h4>
                      <div className="flex items-center gap-2 mt-1 text-sm font-medium text-gray-500">
                        <Clock size={14} /> 08:00 AM — <span className="text-green-600">Taken on time</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Single Item (Upcoming) */}
                <div className="p-6 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#f0f4ff] text-[#4a7ae6] flex items-center justify-center">
                      <Clock size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Amlodipine (5mg)</h4>
                      <div className="flex items-center gap-2 mt-1 text-sm font-medium text-gray-500">
                        <Clock size={14} /> 01:00 PM — Upcoming
                      </div>
                    </div>
                  </div>
                  <Button className="bg-[#4a7ae6] hover:bg-[#3965ca] text-white rounded-xl shadow-md">Mark Taken</Button>
                </div>

                {/* Single Item (Missed) */}
                <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#fef1f2] text-red-500 flex items-center justify-center">
                      <AlertCircle size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Atorvastatin (20mg)</h4>
                      <div className="flex items-center gap-2 mt-1 text-sm font-medium text-gray-500">
                        <Clock size={14} /> Yesterday, 10:00 PM — <span className="text-red-500">Missed</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">Caregiver Notified</span>
                </div>
              </div>
           </div>

           {/* Right Column: Caregiver & Alerts */}
           <div className="space-y-6">
              <h2 className="text-xl font-bold">Caregiver Network</h2>
              
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80" alt="Caregiver" className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-sm">Dr. Sarah Jenkins</p>
                      <p className="text-xs text-gray-500">Primary Doctor</p>
                    </div>
                  </div>
                  <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded-md">Linked</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&q=80" alt="Caregiver" className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-sm">Marcus Kumar</p>
                      <p className="text-xs text-gray-500">Son / Assistant</p>
                    </div>
                  </div>
                  <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded-md">Linked</span>
                </div>
                
                <Button variant="outline" className="w-full rounded-xl border-dashed border-2 text-gray-500 hover:border-[#3bbdbf] hover:text-[#3bbdbf] font-bold">
                  + Add Coordinator
                </Button>
              </div>

              <div className="bg-gradient-to-br from-[#1E2A4F] to-[#2b3654] rounded-3xl shadow-xl p-6 text-white mt-8">
                 <div className="flex items-center gap-3 mb-4">
                   <Activity size={20} className="text-[#3bbdbf]" />
                   <h3 className="font-bold">System Connection</h3>
                 </div>
                 <p className="text-sm text-gray-300 leading-relaxed mb-4">The application is currently synchronized seamlessly with the Hackathon API.</p>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-gray-400">Database</span>
                     <span className="text-green-400 font-bold flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400"></div> Connected</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-gray-400">Auth Check</span>
                     <span className="text-green-400 font-bold flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400"></div> Secure</span>
                   </div>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  )
}
