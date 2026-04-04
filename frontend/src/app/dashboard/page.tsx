"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/Sidebar"
import { Merriweather, Plus_Jakarta_Sans, Poppins } from "next/font/google"
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
  Bell,
  HeartPulse,
  LayoutDashboard,
  ArrowRight,
  User,
  Stethoscope,
  AlertTriangle,
  XCircle,
  HelpCircle
} from "lucide-react"
import { format } from "date-fns"
import { useSocket } from "@/context/SocketContext"

const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })
const poppins = Poppins({ weight: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] });

export default function Dashboard() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
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
    setMounted(true)
    
    const encryptedUser = localStorage.getItem("user")
    if (!encryptedUser || encryptedUser === 'undefined') {
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

    if (socket) {
      const handleDoctorLinked = (data: any) => {
        setToastMessage(`New care connection established with Dr. ${data.doctorName}`)
        setTimeout(() => setToastMessage(null), 5000)
        fetchDashboardData()
      }
      socket.on("DOCTOR_LINKED", handleDoctorLinked)
      return () => { socket.off("DOCTOR_LINKED", handleDoctorLinked) }
    }
  }, [socket, router])

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
      setError("Synchronizing failed. Re-trying hub connection.")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkTaken = async (log: any) => {
    const uid = `${log.medicationId}_${log.scheduledTime}`
    if (takingId === uid) return
    setTakingId(uid)

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
        const [scoreS, riskS] = await Promise.all([getAdherenceScore(), getRiskLevel()])
        if (scoreS.success) setScore(scoreS.data)
        if (riskS.success) setRisk(riskS.data)
      }
    } catch (err) {
      setTodayDoses(prev => prev.map(d =>
        (d.medicationId === log.medicationId && d.scheduledTime === log.scheduledTime)
          ? { ...d, status: 'pending', takenAt: null }
          : d
      ))
    } finally {
      setTakingId(null)
    }
  }

  // Prevent hydration mismatch by returning null during SSR or until mounted
  if (!mounted) {
    return null
  }

  if (loading && !user) {
    return (
      <div className={`flex h-screen items-center justify-center bg-[#fcfdfd] ${jakarta.className}`}>
        <div className="flex flex-col items-center gap-1">
          <Loader2 size={42} className="text-[#008080] animate-spin" />
        </div>
      </div>
    )
  }

  const pendingDoses = todayDoses.filter(d => d.status === 'pending').length
  const stats = {
      taken: todayDoses.filter(l => (l.status === 'taken' || l.status === 'completed') && !l.delayMinutes).length,
      delayed: todayDoses.filter(l => l.delayMinutes > 0 || l.status === 'delayed').length,
      missed: todayDoses.filter(l => l.status === 'missed').length
  }

  return (
    <div className={`min-h-screen bg-[#fcfdfd] text-[#1a2233] flex ${poppins.className}`}>
      
      {/* Fixed Sidebar */}
      <Sidebar user={user} riskLevel={risk?.riskLevel} />

      {/* Main Dashboard Canvas */}
      <main className="ml-72 flex-1 p-10 max-w-[1400px] w-full">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
          <div>
            <h1 className={`${merriweather.className} text-4xl font-black text-[#008080] mb-2`}>
               Care Context
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[11px] tracking-[3px]">
               Real-time Monitoring & Adherence Analytics
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-50 relative group cursor-pointer hover:bg-gray-50 transition-all">
                <Bell size={20} className="text-gray-300 group-hover:text-[#008080]" />
                <div className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
             </div>
             <Link href="/profile">
               <button className="bg-[#1a2233] text-white px-8 py-4 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#1a2233]/15 hover:scale-[1.03] active:scale-95 transition-all">
                  <User size={18} className="text-[#008080]" />
                  IDENTITY HUB
               </button>
             </Link>
          </div>
        </div>

        {/* Actionable Insights Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col justify-between">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Adherence Core</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-[#008080]">{score?.score ?? '--'}%</h3>
                    <TrendingUp className="text-green-500 mb-1" size={24} />
                </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col justify-between border-l-8 border-emerald-500">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Successful Logs</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-[#1a2233]">{stats.taken}</h3>
                    <CheckCircle2 className="text-emerald-500 mb-1" size={24} />
                </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col justify-between border-l-8 border-amber-500">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Delayed Doses</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-[#1a2233] text-amber-600">{stats.delayed}</h3>
                    <AlertTriangle className="text-amber-500 mb-1" size={24} />
                </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col justify-between border-l-8 border-red-500">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Critical Misses</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-red-500">{stats.missed}</h3>
                    <XCircle className="text-red-500 mb-1" size={24} />
                </div>
            </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-10">
           
           {/* Left Col: Core Stats & Today's Plan */}
           <div className="col-span-12 xl:col-span-8 space-y-10">
              
              {/* Welcome Card & Clinical Context */}
              <div className="bg-[#008080] p-10 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                 <div className="relative z-10">
                    <div className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[2px] mb-8 border border-white/10">
                       <ShieldCheck size={16} className="text-[#3bbdbf] animate-pulse" />
                       Therapeutic Protocol: Standard Monitoring
                    </div>
                    <h2 className={`${merriweather.className} text-4xl font-bold mb-6 leading-tight`}>
                       Hello, {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}. <br />
                       <span className="text-white/60 text-2xl">Dashboard synchronized.</span>
                    </h2>
                    <p className="text-white/80 text-lg max-w-2xl leading-relaxed mb-10 font-medium opacity-90">
                       {pendingDoses > 0 
                         ? `Our system identifies ${pendingDoses} critical intakes requiring your action today. Timely synchronization is essential for clinical accuracy.` 
                         : "All scheduled intakes for this session have been logged. System stability: Optimal."}
                    </p>
                    <div className="flex gap-6">
                       <Link href="/medications">
                          <button className="bg-white text-[#008080] px-10 py-5 rounded-[1.5rem] font-black shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest group">
                             MANAGE CABINET 
                             <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                       </Link>
                       <Link href="/history">
                          <button className="bg-black/10 backdrop-blur-sm border border-white/20 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center gap-3 hover:bg-white/10 transition-all text-xs uppercase tracking-widest">
                             FULL HISTORY
                          </button>
                       </Link>
                    </div>
                 </div>
              </div>

              {/* Today's Intake Table */}
              <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
                 <div className="px-10 py-8 flex justify-between items-center">
                    <div>
                        <h3 className={`${merriweather.className} text-2xl font-bold flex items-center gap-3 text-[#1a2233]`}>
                           <Clock size={24} className="text-[#008080]" />
                           Intake Schedule
                        </h3>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Pending & Historical Events for Today</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-[10px] font-black bg-gray-50 text-gray-400 px-4 py-2 rounded-full uppercase tracking-widest border border-gray-100">
                           {format(new Date(), 'EEEE, dd MMM')}
                        </span>
                    </div>
                 </div>

                 <div className="min-h-[300px]">
                    {todayDoses.length === 0 ? (
                      <div className="py-32 text-center flex flex-col items-center">
                         <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6 text-gray-200">
                           <Activity size={40} />
                         </div>
                         <h4 className={`${merriweather.className} text-xl font-bold text-[#1a2233] mb-2`}>No Daily Regimen</h4>
                         <p className="text-gray-400 font-bold text-sm max-w-sm mb-10">Zero medications are currently scheduled for this node today.</p>
                         <Link href="/medications">
                            <button className="bg-[#008080] text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#008080]/15">Register Regimen</button>
                         </Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {todayDoses.map((log) => {
                          const uid = `${log.medicationId}_${log.scheduledTime}`
                          const isTaken  = (log.status === 'taken' || log.status === 'completed' || log.status === 'delayed')
                          const isMissed = log.status === 'missed'
                          const isDelayed = log.delayMinutes > 0 || log.status === 'delayed'
                          const isLoading = takingId === uid

                          return (
                            <div key={uid} className={`group flex items-center justify-between p-8 hover:bg-gray-50/30 transition-all duration-300 ${isTaken ? 'opacity-60' : ''}`}>
                               <div className="flex items-center gap-8">
                                  <button
                                    onClick={() => !isTaken && !isMissed && handleMarkTaken(log)}
                                    disabled={isTaken || isMissed || isLoading}
                                    className={`w-16 h-16 rounded-[1.75rem] border-2 flex items-center justify-center transition-all duration-500 ${
                                       isTaken ? 'bg-[#008080] border-[#008080] text-white shadow-xl shadow-[#008080]/20' :
                                       isMissed ? 'bg-red-50 border-red-100 text-red-500' :
                                       'bg-white border-gray-100 text-[#008080]/10 hover:border-[#008080] group-hover:scale-105 group-hover:shadow-lg'
                                    }`}
                                  >
                                    {isLoading ? <Loader2 size={18} className="animate-spin text-[#008080]" /> : 
                                     isTaken ? <CheckCircle2 size={32} /> : 
                                     isMissed ? <XCircle size={32} /> :
                                     <Activity size={32} className="group-hover:text-[#008080] transition-colors" />}
                                  </button>
                                  
                                  <div className="space-y-1.5">
                                     <h4 className={`text-xl font-extrabold tracking-tight ${isTaken ? 'text-gray-400' : 'text-[#1a2233]'}`}>
                                        {log.medicationName}
                                        <span className="ml-3 py-1 px-3 bg-gray-100 text-gray-500 text-[10px] font-black rounded-xl uppercase border border-gray-100">
                                          {log.dosage}
                                        </span>
                                     </h4>
                                     <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                                           <Clock size={14} className="text-[#008080]" />
                                           Scheduled {format(new Date(log.scheduledTime), 'hh:mm a')}
                                        </div>
                                        <div className={`text-[10px] font-black uppercase tracking-[2px] px-3 py-1 rounded-lg border ${
                                           isTaken && !isDelayed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                           isDelayed ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                           isMissed ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-400'
                                        }`}>
                                           {isDelayed ? 'DELAYED' : log.status}
                                        </div>
                                     </div>
                                  </div>
                               </div>

                               <div className="flex items-center gap-8">
                                  {!isTaken && !isMissed ? (
                                     <button 
                                       onClick={() => handleMarkTaken(log)}
                                       disabled={isLoading}
                                       className="bg-[#008080] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#008080]/15 hover:scale-105 active:scale-95 transition-all"
                                     >
                                        Log Dose
                                     </button>
                                  ) : (
                                     <div className="text-right border-l pl-8 border-gray-50">
                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Audit Log</p>
                                        <p className={`text-xs font-black uppercase tracking-tight ${isTaken ? 'text-[#008080]' : 'text-red-500'}`}>
                                           {isTaken ? `Intake @ ${format(new Date(log.takenAt || new Date()), 'hh:mm a')}` : 'Missed Event'}
                                        </p>
                                        {isDelayed && log.delayMinutes > 0 && <p className="text-[10px] font-bold text-amber-500 mt-0.5">{log.delayMinutes}m Clinical Delay</p>}
                                     </div>
                                  )}
                               </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Right Col: Health Stats & Care Connections */}
           <div className="col-span-12 xl:col-span-4 space-y-10">
              
              {/* Clinical Assessment Card */}
              <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative group overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 translate-x-1/2 -translate-y-1/2 opacity-5 group-hover:opacity-10 transition-transform duration-700">
                    <ShieldCheck size={160} className="text-[#008080]" />
                 </div>
                 <h3 className={`${merriweather.className} text-2xl font-bold mb-10 text-[#1a2233] flex items-center gap-3`}>
                    <div className="w-1.5 h-8 bg-[#008080] rounded-full"></div>
                    Adherence Score
                 </h3>
                 
                 <div className="space-y-10">
                    <div className="flex flex-col items-center justify-center relative py-4">
                       <div className="w-56 h-56 rounded-full border-[12px] border-gray-50 flex flex-col items-center justify-center relative overflow-hidden group/chart">
                          <div 
                             className="absolute inset-0 bg-[#008080]/5 transition-all duration-1000" 
                             style={{ clipPath: `inset(${100 - (score?.score ?? 0)}% 0 0 0)` }}
                          ></div>
                          <span className="text-6xl font-black text-[#1a2233] relative z-10">{score?.score ?? '--'}</span>
                          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest relative z-10 mt-1">COMPLIANCE</span>
                       </div>
                       
                       <div className="mt-8 flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-full border border-emerald-100 shadow-sm">
                          <TrendingUp size={20} className="text-emerald-500" />
                          <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{score?.trend ?? 0}% Clinical Trend</span>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 pt-4">
                       <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                             Risk Hub <div className="w-1.5 h-1.5 rounded-full bg-[#008080]"></div>
                          </p>
                          <p className={`text-sm font-black uppercase tracking-tight ${risk?.riskLevel?.toLowerCase() === 'high' ? 'text-red-500' : 'text-[#008080]'}`}>
                             {risk?.riskLevel || 'SECURE'}
                          </p>
                       </div>
                       <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Streak</p>
                          <p className="text-sm font-black uppercase text-[#1a2233] tracking-tight">
                             {score?.streak || 0} DAY CYCLE
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Verified Clinicians Node */}
              <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm">
                 <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className={`${merriweather.className} text-2xl font-bold text-[#1a2233]`}>Care Network</h3>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Authorized Medical Nodes</p>
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    {doctors.length === 0 ? (
                      <div className="p-10 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                         <HelpCircle size={32} className="mx-auto text-gray-200 mb-4" />
                         <p className="text-xs font-black text-gray-400 uppercase tracking-[2px]">Clinical isolation</p>
                         <button className="text-[10px] font-black text-[#008080] mt-4 uppercase tracking-widest hover:underline">Link Primary Physician</button>
                      </div>
                    ) : (
                      doctors.map((doc) => (
                        <div key={doc._id} className="group flex items-center gap-6 p-5 rounded-[2.25rem] bg-gray-50 border border-transparent hover:border-[#008080]/10 hover:bg-white hover:shadow-xl transition-all duration-500 cursor-pointer">
                           <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center text-[#008080] group-hover:bg-[#008080] group-hover:text-white transition-all">
                             <Stethoscope size={28} />
                           </div>
                           <div className="flex-1">
                              <h4 className="text-base font-black text-[#1a2233]">Dr. {doc.name}</h4>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{doc.specialization || "Clinical Hub Supervisor"}</p>
                           </div>
                           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                        </div>
                      ))
                    )}
                 </div>
              </div>

           </div>
        </div>
      </main>

      {/* Persistence Notifications */}
      {toastMessage && (
        <div className="fixed bottom-12 right-12 bg-[#1a2233] text-white px-10 py-6 rounded-[2.5rem] shadow-3xl z-[100] flex items-center gap-6 animate-in slide-in-from-bottom-12 duration-700">
          <div className="w-14 h-14 bg-[#008080] rounded-2xl flex items-center justify-center shadow-lg shadow-[#008080]/20">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[3px] text-[#008080] mb-1">Security Alert</p>
            <p className="font-black text-base">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  )
}
