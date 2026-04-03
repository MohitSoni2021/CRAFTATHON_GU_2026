"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/constants"
import { Plus_Jakarta_Sans } from "next/font/google"
import { 
  getAdherenceScore, 
  getRiskLevel, 
  getTodayDoses, 
  markDoseAsTaken 
} from "@/lib/api/routes"
import { 
  Activity, 
  Bell, 
  Settings, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  CalendarDays, 
  ActivitySquare, 
  ShieldCheck,
  TrendingUp,
  Loader2
} from "lucide-react"
import { format } from "date-fns"

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState<any>(null)
  const [risk, setRisk] = useState<any>(null)
  const [todayDoses, setTodayDoses] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
          fetchDashboardData()
        }
      }
    }
  }, [router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [scoreRes, riskRes, dosesRes] = await Promise.all([
        getAdherenceScore(),
        getRiskLevel(),
        getTodayDoses()
      ])

      if (scoreRes.success) setScore(scoreRes.data)
      if (riskRes.success) setRisk(riskRes.data)
      if (dosesRes.success) setTodayDoses(dosesRes.data)
    } catch (err: any) {
      console.error("Dashboard fetch error:", err)
      setError("Failed to fetch real-time data")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkTaken = async (logId: string) => {
    try {
      const res = await markDoseAsTaken(logId)
      if (res.success) {
        setTodayDoses(prev => prev.map(log => 
          log._id === logId ? { ...log, status: 'taken', takenAt: new Date().toISOString() } : log
        ))
        // Refresh score
        const scoreRes = await getAdherenceScore()
        if (scoreRes.success) setScore(scoreRes.data)
      }
    } catch (err) {
      console.error("Failed to mark dose:", err)
    }
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      router.push("/login")
    }
  }

  if (loading && !user) {
    return (
      <div className={`flex h-screen items-center justify-center bg-[#f8faff] ${jakarta.className}`}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-[#3bbdbf] animate-spin" />
          <p className="text-[#7b8ea6] font-semibold">Synchronizing with Health Engine...</p>
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
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{user?.name}</p>
              <p className="text-xs text-gray-500 mt-1">Status: {risk?.riskLevel?.toUpperCase() || 'CALCULATING'}</p>
            </div>
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-[#e6fcfa] object-cover" />
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-linear-to-r from-[#2b7a8c] to-[#3bbdbf] rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-center overflow-hidden relative">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 space-y-2 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Good morning, {user?.name?.split(' ')[0] || "User"}!</h1>
            <p className="text-white/80 font-medium text-lg">
              {todayDoses.filter(d => d.status === 'pending').length > 0 
                ? `You have ${todayDoses.filter(d => d.status === 'pending').length} medications scheduled for today.`
                : "You're all caught up with your medications today!"}
            </p>
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
             <h3 className="text-3xl font-bold flex items-end gap-2">
               {score?.score ?? '--'}% 
               {score?.trend > 0 && <span className="text-sm text-green-500 font-bold mb-1 flex items-center"><TrendingUp size={14} className="mr-1" />+{score.trend}%</span>}
             </h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-12 h-12 bg-[#e6fcfa] text-[#3bbdbf] rounded-2xl flex items-center justify-center mb-4">
               <ShieldCheck size={24} />
             </div>
             <p className="text-gray-500 font-semibold mb-1">Risk Classification</p>
             <h3 className={`text-2xl font-bold ${risk?.riskLevel === 'low' ? 'text-green-600' : risk?.riskLevel === 'medium' ? 'text-amber-500' : 'text-red-500'}`}>
               {(risk?.riskLevel || 'ANALYZING').toUpperCase()}
             </h3>
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

              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden min-h-[200px]">
                {todayDoses.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center">
                    <CheckCircle2 size={40} className="text-gray-200 mb-4" />
                    <p className="text-gray-400 font-medium">No medications scheduled for today.</p>
                    <Link href="/medications" className="text-[#3bbdbf] text-sm font-bold mt-2 hover:underline">Add medications to your cabinet</Link>
                  </div>
                ) : (
                  todayDoses.map((log) => (
                    <div key={log._id} className="p-6 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          log.status === 'taken' ? 'bg-[#e6faeb] text-[#28a745]' : 
                          log.status === 'missed' ? 'bg-[#fef1f2] text-red-500' : 'bg-[#f0f4ff] text-[#4a7ae6]'
                        }`}>
                          {log.status === 'taken' ? <CheckCircle2 size={28} /> : 
                           log.status === 'missed' ? <AlertCircle size={28} /> : 
                           <Clock size={28} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{log.medicationId?.name} ({log.medicationId?.dosage}{log.medicationId?.unit})</h4>
                          <div className="flex items-center gap-2 mt-1 text-sm font-medium text-gray-500">
                            <Clock size={14} /> 
                            {format(new Date(log.scheduledAt), 'hh:mm a')} — 
                            <span className={
                              log.status === 'taken' ? 'text-green-600' : 
                              log.status === 'missed' ? 'text-red-500' : 'text-blue-500'
                            }>
                              {log.status === 'taken' ? `Taken at ${format(new Date(log.takenAt), 'hh:mm a')}` : 
                               log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {log.status === 'pending' && (
                        <Button 
                          onClick={() => handleMarkTaken(log._id)}
                          className="bg-[#4a7ae6] hover:bg-[#3965ca] text-white rounded-xl shadow-md"
                        >
                          Mark Taken
                        </Button>
                      )}
                      {log.status === 'missed' && (
                        <span className="text-xs font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">Caregiver Notified</span>
                      )}
                    </div>
                  ))
                )}
              </div>
           </div>

           {/* Right Column: Connection & Info */}
           <div className="space-y-6">
              <h2 className="text-xl font-bold">System Connection</h2>
              
              <div className="bg-linear-to-br from-[#1E2A4F] to-[#2b3654] rounded-3xl shadow-xl p-6 text-white">
                 <div className="flex items-center gap-3 mb-4">
                   <Activity size={20} className="text-[#3bbdbf]" />
                   <h3 className="font-bold text-lg">Health Engine Status</h3>
                 </div>
                 <p className="text-sm text-gray-300 leading-relaxed mb-6">
                   Your account is securely connected to the Medication Adherence Monitoring System. Data is synced in real-time.
                 </p>
                 <div className="space-y-4">
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-gray-400">REST API</span>
                     <span className="text-green-400 font-bold flex items-center gap-1">
                       <div className="w-2 h-2 rounded-full bg-green-400"></div> Connected
                     </span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-gray-400">Encryption</span>
                     <span className="text-green-400 font-bold flex items-center gap-1">
                       <div className="w-2 h-2 rounded-full bg-green-400"></div> AES-256
                     </span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-gray-400">Adherence Hub</span>
                     <span className="text-green-400 font-bold flex items-center gap-1">
                       <div className="w-2 h-2 rounded-full bg-green-400"></div> Active
                     </span>
                   </div>
                 </div>
                 <Button variant="ghost" className="w-full mt-6 text-xs text-gray-400 hover:text-white hover:bg-white/5 font-bold rounded-xl border border-white/10">
                   Sync Diagnostics
                 </Button>
              </div>

              {/* Tips Section */}
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                 <h3 className="font-bold flex items-center gap-2 mb-3">
                   <AlertCircle size={18} className="text-blue-500" />
                   Adherence Tip
                 </h3>
                 <p className="text-sm text-gray-500 leading-relaxed">
                   Taking your medications at the same time every day helps maintain a consistent level of the drug in your body.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
