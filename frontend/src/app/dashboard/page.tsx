"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import { Plus_Jakarta_Sans } from "next/font/google"
import { 
  getAdherenceScore, 
  getRiskLevel, 
  getTodayDoses, 
  markDoseAsTaken,
  getPatientDoctors
} from "@/lib/api/routes"
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  CalendarDays, 
  ActivitySquare, 
  ShieldCheck,
  TrendingUp,
  Loader2,
  Settings
} from "lucide-react"
import { format } from "date-fns"

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

import { useSocket } from "@/context/SocketContext"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState<any>(null)
  const [risk, setRisk] = useState<any>(null)
  const [todayDoses, setTodayDoses] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [takingId, setTakingId] = useState<string | null>(null)
  const { isConnected, socket } = useSocket()
  const [doctors, setDoctors] = useState<any[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (socket) {
      const handleDoctorLinked = (data: any) => {
        console.log("Doctor linked event:", data)
        setToastMessage(`You have been added by doctor: ${data.doctorName}`)
        setTimeout(() => setToastMessage(null), 5000)
        
        // Option 1: Refetch all dashboard data, or at least doctors
        fetchDashboardData()
      }
      
      socket.on("DOCTOR_LINKED", handleDoctorLinked)
      
      return () => {
        socket.off("DOCTOR_LINKED", handleDoctorLinked)
      }
    }
  }, [socket])

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
      const [scoreRes, riskRes, dosesRes, doctorsRes] = await Promise.all([
        getAdherenceScore(),
        getRiskLevel(),
        getTodayDoses(),
        getPatientDoctors()
      ])

      if (scoreRes.success) setScore(scoreRes.data)
      if (riskRes.success) setRisk(riskRes.data)
      if (dosesRes.success) setTodayDoses(dosesRes.data)
      if (doctorsRes.success) setDoctors(doctorsRes.data)
    } catch (err: any) {
      console.error("Dashboard fetch error:", err)
      setError("Failed to fetch real-time data")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkTaken = async (log: any) => {
    const uid = `${log.medicationId}_${log.scheduledTime}`
    if (takingId === uid) return
    setTakingId(uid)

    // Optimistic update — instant visual feedback
    setTodayDoses(prev => prev.map(d =>
      (d.medicationId === log.medicationId && d.scheduledTime === log.scheduledTime)
        ? { ...d, status: 'taken', takenAt: new Date().toISOString() }
        : d
    ))

    try {
      const res = await markDoseAsTaken({
        medicationId: log.medicationId,
        scheduledAt:  log.scheduledTime,
        takenAt:      new Date().toISOString(),
        status:       'taken',
      })
      if (res.success) {
        const scoreRes = await getAdherenceScore()
        if (scoreRes.success) setScore(scoreRes.data)
      }
    } catch (err) {
      // Revert on failure
      console.error("Failed to mark dose:", err)
      setTodayDoses(prev => prev.map(d =>
        (d.medicationId === log.medicationId && d.scheduledTime === log.scheduledTime)
          ? { ...d, status: 'pending', takenAt: null }
          : d
      ))
    } finally {
      setTakingId(null)
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
      
      <Navbar user={user} riskLevel={risk?.riskLevel} />

      <div className="w-full mx-auto p-6 md:p-10 space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-linear-to-r from-[#2b7a8c] to-[#3bbdbf] rounded-3xl p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-center overflow-hidden relative">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 space-y-2 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Good morning, {user?.name?.split(' ')[0] || "User"}!</h1>
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
             <h3 className="text-3xl font-bold flex items-end gap-2 text-[#2b3654]">
               {score?.score ?? '--'}% 
               {score?.trend > 0 && <span className="text-sm text-green-500 font-bold mb-1 flex items-center"><TrendingUp size={14} className="mr-1" />+{score.trend}%</span>}
             </h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-12 h-12 bg-[#e6fcfa] text-[#3bbdbf] rounded-2xl flex items-center justify-center mb-4">
               <ShieldCheck size={24} />
             </div>
             <p className="text-gray-500 font-semibold mb-1">Risk Classification</p>
             <h3 className={`text-2xl font-bold ${(risk?.riskLevel === 'low' || risk?.riskLevel === 'safe') ? 'text-green-600' : risk?.riskLevel === 'medium' ? 'text-amber-500' : 'text-red-500'}`}>
               {(risk?.riskLevel || 'ANALYZING').toUpperCase()}
             </h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
             <div>
               <div className="w-12 h-12 bg-gray-50 text-gray-500 rounded-2xl flex items-center justify-center mb-4">
                 <Settings size={24} />
               </div>
               <p className="text-gray-500 font-semibold mb-1">Configuration</p>
             </div>
             <div className="flex gap-2">
               <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-gray-700">Device Sync</Button>
               <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-gray-700">Preferences</Button>
             </div>
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
           
           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2"><CalendarDays size={20} className="text-[#3bbdbf]" /> Today's Schedule</h2>
                <div className="flex items-center gap-2">
                  <Link href="/today">
                    <Button variant="ghost" className="text-[#3bbdbf] font-bold hover:bg-[#e6fcfa] rounded-xl transition-colors">Full View</Button>
                  </Link>
                  <Link href="/history">
                    <Button variant="ghost" className="text-gray-400 font-bold hover:bg-gray-50 rounded-xl transition-colors">History</Button>
                  </Link>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden min-h-[200px]">
                {todayDoses.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center">
                    <CheckCircle2 size={40} className="text-gray-200 mb-4" />
                    <p className="text-gray-400 font-medium">No medications scheduled for today.</p>
                    <Link href="/medications" className="text-[#3bbdbf] text-sm font-bold mt-2 hover:underline">Add medications to your cabinet</Link>
                  </div>
                ) : (
                  todayDoses.map((log) => {
                    const uid = `${log.medicationId}_${log.scheduledTime}`
                    const isTaken  = log.status === 'taken' || log.status === 'delayed'
                    const isMissed = log.status === 'missed'
                    const isLoading = takingId === uid

                    return (
                      <div
                        key={log.id ?? uid}
                        className={`p-5 border-b border-gray-50 flex items-center justify-between transition-all duration-300
                          ${isTaken  ? 'bg-emerald-50/40' : ''}
                          ${isMissed ? 'bg-red-50/30 opacity-75' : ''}
                          ${!isTaken && !isMissed ? 'hover:bg-gray-50/80' : ''}
                        `}
                      >
                        {/* Left: checkbox + info */}
                        <div className="flex items-center gap-4">
                          {/* Circular checkbox button */}
                          <button
                            id={`dash-dose-${log.medicationId}-${encodeURIComponent(log.scheduledTime)}`}
                            onClick={() => !isTaken && !isMissed && handleMarkTaken(log)}
                            disabled={isTaken || isMissed || isLoading}
                            className={`relative w-11 h-11 rounded-full border-2 flex shrink-0 items-center justify-center transition-all duration-200
                              ${isTaken  ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-200 cursor-default' : ''}
                              ${isMissed ? 'bg-red-100 border-red-300 cursor-default' : ''}
                              ${!isTaken && !isMissed ? 'border-gray-300 hover:border-[#3bbdbf] hover:shadow-[0_0_0_4px_rgba(59,189,191,0.12)] cursor-pointer active:scale-90' : ''}
                              ${isLoading ? 'opacity-60' : ''}
                            `}
                          >
                            {isLoading ? (
                              <Loader2 size={16} className="animate-spin text-[#3bbdbf]" />
                            ) : isTaken ? (
                              <CheckCircle2 size={20} className="text-white" />
                            ) : isMissed ? (
                              <AlertCircle size={18} className="text-red-400" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border-2 border-gray-300" />
                            )}
                          </button>

                          {/* Medication info */}
                          <div>
                            <h4 className={`font-bold text-base text-[#2b3654] transition-all
                              ${isTaken ? 'line-through decoration-emerald-400 opacity-60' : ''}`}>
                              {log.medicationName}
                              <span className="font-medium text-sm text-gray-400 ml-1.5 no-underline" style={{textDecoration:'none'}}>
                                {log.dosage}
                              </span>
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-xs font-medium">
                              <Clock size={11} className="text-gray-400" />
                              <span className="text-gray-400">{format(new Date(log.scheduledTime), 'h:mm a')}</span>
                              <span className="text-gray-200">—</span>
                              <span className={
                                isTaken  ? 'text-emerald-500 font-semibold' :
                                isMissed ? 'text-red-400 font-semibold' :
                                'text-[#4a7ae6] font-semibold'
                              }>
                                {isTaken && log.takenAt
                                  ? `Taken at ${format(new Date(log.takenAt), 'h:mm a')}`
                                  : log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: action or badge */}
                        {!isTaken && !isMissed && (
                          <button
                            onClick={() => handleMarkTaken(log)}
                            disabled={isLoading}
                            className="text-xs font-bold bg-[#4a7ae6] hover:bg-[#3965ca] text-white px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                          >
                            {isLoading ? 'Saving…' : 'Mark Taken'}
                          </button>
                        )}
                        {isTaken && (
                          <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100 shrink-0">
                            ✓ Done
                          </span>
                        )}
                        {isMissed && (
                          <span className="text-xs font-bold bg-red-50 text-red-500 px-3 py-1.5 rounded-full border border-red-100 shrink-0">
                            Missed
                          </span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
           </div>

           <div className="space-y-6">
              <h2 className="text-xl font-bold">System Connection</h2>
              
              <div className="bg-linear-to-br from-[#1E2A4F] to-[#2b3654] rounded-3xl shadow-xl p-6 text-white">
                 <div className="flex items-center gap-3 mb-4">
                   <Activity size={20} className="text-[#3bbdbf]" />
                   <h3 className="font-bold text-lg text-white">Health Engine Status</h3>
                 </div>
                 <p className="text-sm text-gray-300 leading-relaxed mb-6">
                   Your account is securely connected to the Medication Adherence Monitoring System. Data is synced in real-time.
                 </p>
                 <div className="space-y-4 text-white">
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-gray-400">WebSocket</span>
                     <span className={`${isConnected ? 'text-green-400' : 'text-red-400'} font-bold flex items-center gap-1`}>
                       <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400 blink'}`}></div> {isConnected ? 'Real-time Active' : 'Connecting...'}
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

              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                 <h3 className="font-bold flex items-center gap-2 mb-3 text-[#2b3654]">
                   <AlertCircle size={18} className="text-blue-500" />
                   Adherence Tip
                 </h3>
                 <p className="text-sm text-gray-500 leading-relaxed">
                   Taking your medications at the same time every day helps maintain a consistent level of the drug in your body.
                 </p>
              </div>

              {/* Care Team Section (Doctors) */}
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                 <h3 className="font-bold flex items-center gap-2 mb-4 text-[#2b3654]">
                   <ShieldCheck size={18} className="text-emerald-500" />
                   Your Care Team
                 </h3>
                 {doctors.length === 0 ? (
                   <p className="text-sm text-gray-400">No doctors linked yet.</p>
                 ) : (
                   <div className="space-y-3">
                     {doctors.map((doc) => (
                       <div key={doc._id} className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100">
                         <div className="flex justify-between items-start">
                           <div>
                             <h4 className="font-semibold text-sm text-[#2b3654]">Dr. {doc.name}</h4>
                             <p className="text-xs text-gray-500">{doc.specialization || "General Physician"}</p>
                           </div>
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                             {doc.status}
                           </span>
                         </div>
                         <p className="text-xs text-gray-400 mt-1">{doc.email}</p>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#2b3654] text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 size={24} className="text-[#3bbdbf]" />
          <p className="font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  )
}
