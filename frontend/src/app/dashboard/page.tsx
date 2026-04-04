"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { decryptData } from "@/lib/crypto"
import Sidebar from "@/components/Sidebar"
import AlertBanner from "@/components/AlertBanner"
import { Merriweather, Plus_Jakarta_Sans, Poppins } from "next/font/google"
import { 
  getAdherenceScore, 
  getRiskLevel, 
  getTodayDoses, 
  markDoseAsTaken,
  getPatientDoctors,
  listDoseLogs
} from "@/lib/api/routes"
import { 
  calculateWeightedScore, 
  filterLogsByPeriod, 
  computeDoseStatus,
  MedicationLog
} from "@/lib/adherence"
import { generateAlerts, AlertInstance } from "@/lib/reminders"
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp,
  Loader2,
  Bell,
  ArrowRight,
  User,
  Stethoscope,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Calendar,
  Lock
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { useSocket } from "@/context/SocketContext"

const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })
const poppins = Poppins({ weight: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] });

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const viewAs = searchParams.get('viewAs')
  
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [scores, setScores] = useState({ today: 0, weekly: 0, monthly: 0 })
  const [risk, setRisk] = useState<any>(null)
  const [todayDoses, setTodayDoses] = useState<any[]>([])
  const [alerts, setAlerts] = useState<AlertInstance[]>([])
  
  const [error, setError] = useState<string | null>(null)
  const [takingId, setTakingId] = useState<string | null>(null)
  const [doctors, setDoctors] = useState<any[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const { isConnected, socket } = useSocket()
  
  const alertRefreshInterval = useRef<NodeJS.Timeout | null>(null)

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
  }, [socket, router, viewAs])

  useEffect(() => {
    alertRefreshInterval.current = setInterval(() => {
      if (todayDoses.length > 0) setAlerts(generateAlerts(todayDoses))
    }, 60000)
    return () => { if (alertRefreshInterval.current) clearInterval(alertRefreshInterval.current) }
  }, [todayDoses])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const pId = viewAs || undefined
      const [riskRes, dosesRes, doctorsRes, allLogsRes] = await Promise.all([
        getRiskLevel(pId),
        getTodayDoses(pId),
        getPatientDoctors(), // Doctors for current user
        listDoseLogs({ patientId: pId, limit: 100 })
      ])

      if (riskRes.success) setRisk(riskRes.data)
      if (dosesRes.success) {
        const enrichedDoses = dosesRes.data.map((d: any) => ({
          ...d,
          status: computeDoseStatus(d.scheduledTime, d.takenAt)
        }))
        setTodayDoses(enrichedDoses)
        setAlerts(generateAlerts(enrichedDoses))
      }
      if (doctorsRes.success) setDoctors(doctorsRes.data)

      if (allLogsRes.success) {
        const logs = allLogsRes.data as MedicationLog[]
        setScores({
          today: calculateWeightedScore(filterLogsByPeriod(logs, 1)),
          weekly: calculateWeightedScore(filterLogsByPeriod(logs, 7)),
          monthly: calculateWeightedScore(filterLogsByPeriod(logs, 30))
        })
      }
    } catch (err: any) {
      setError("Synchronizing failed. Re-trying hub connection.")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkTaken = async (log: any) => {
    if (viewAs) return // Read-only mode
    const uid = `${log.medicationId}_${log.scheduledTime}`
    if (takingId === uid) return
    setTakingId(uid)

    const now = new Date().toISOString()
    setTodayDoses(prev => prev.map(d =>
      (d.medicationId === log.medicationId && d.scheduledTime === log.scheduledTime)
        ? { ...d, status: computeDoseStatus(log.scheduledTime, now), takenAt: now }
        : d
    ))

    try {
      await markDoseAsTaken({
        medicationId: log.medicationId,
        scheduledAt:  log.scheduledTime,
        takenAt:      now,
        status:       'taken',
      })
      fetchDashboardData()
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

  if (!mounted) return null
  if (loading && !user) {
    return (
      <div className={`flex h-screen items-center justify-center bg-[#f8fafb] ${jakarta.className}`}>
        <Loader2 size={42} className="text-[#008080] animate-spin" />
      </div>
    )
  }

  const pendingDoses = todayDoses.filter(d => d.status === 'pending').length
  const stats = {
      taken: todayDoses.filter(l => l.status === 'on_time' || l.status === 'taken').length,
      delayed: todayDoses.filter(l => l.status === 'late' || (l.delayMinutes && l.delayMinutes > 0)).length,
      missed: todayDoses.filter(l => l.status === 'missed').length
  }

  return (
    <div className={`min-h-screen bg-[#f8fafb] text-[#1a2233] flex no-scrollbar overflow-x-hidden ${poppins.className}`}>
      
      <Sidebar user={user} riskLevel={risk?.riskLevel} />

      <main className="ml-[30rem] flex-1 p-10 max-w-[1800px] w-full no-scrollbar">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
          <div>
            <h1 className={`${merriweather.className} text-4xl font-black text-[#008080] mb-2`}>
               {viewAs ? "Clinical Peer Review" : "Care Context"}
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[11px] tracking-[3px]">
               {viewAs ? `Viewing Authorized Health Vault: ID ${viewAs.slice(-6).toUpperCase()}` : "Real-time Monitoring & Phase 1 Analytics"}
            </p>
          </div>
          <div className="flex items-center gap-4">
             {viewAs && (
               <div className="bg-amber-50 text-amber-600 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-amber-100">
                  <Lock size={16} /> READ-ONLY VAULT
               </div>
             )}
             <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-50 relative group cursor-pointer hover:bg-gray-50 transition-all">
                <Bell size={20} className="text-gray-300 group-hover:text-[#008080]" />
                {alerts.length > 0 && <div className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>}
             </div>
             <Link href="/profile">
               <button className="bg-[#1a2233] text-white px-8 py-4 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-[#1a2233]/15 hover:scale-[1.03] active:scale-95 transition-all">
                  <User size={18} className="text-[#008080]" />
                  IDENTITY HUB
               </button>
             </Link>
          </div>
        </div>

        <AlertBanner alerts={alerts} />

        {/* Actionable Insights Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Adherence Sync</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-[#008080]">{scores.weekly}%</h3>
                    <TrendingUp className="text-green-500 mb-1" size={24} />
                </div>
            </div>
            <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Successful Logs</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-[#1a2233]">{stats.taken}</h3>
                    <CheckCircle2 className="text-emerald-500 mb-1" size={24} />
                </div>
            </div>
            <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4">Late Events</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-[#1a2233] text-amber-600">{stats.delayed}</h3>
                    <AlertTriangle className="text-amber-500 mb-1" size={24} />
                </div>
            </div>
            <div className="bg-red-50/50 p-8 rounded-[2.5rem] border border-red-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4">Critical Misses</p>
                <div className="flex items-end justify-between">
                    <h3 className="text-4xl font-black text-red-500">{stats.missed}</h3>
                    <XCircle className="text-red-500 mb-1" size={24} />
                </div>
            </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-10">
           
           <div className="col-span-12 xl:col-span-8 space-y-10">
              
              <div className="bg-[#008080] p-10 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                 <div className="relative z-10">
                    <div className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[2px] mb-8 border border-white/10">
                       <ShieldCheck size={16} className="text-[#3bbdbf] animate-pulse" />
                       Therapeutic Protocol: Adaptive Oversight
                    </div>
                    <h2 className={`${merriweather.className} text-4xl font-bold mb-6 leading-tight`}>
                       {viewAs ? "Secure Patient Node Data" : `Hello, ${user?.name?.split(' ')[0]}.`} <br />
                       <span className="text-white/60 text-2xl">Clinical Status: {risk?.riskLevel || 'Synchronizing'}</span>
                    </h2>
                    <p className="text-white/80 text-lg max-w-2xl leading-relaxed mb-10 font-medium opacity-90">
                       Analysis of this health node reveals {pendingDoses} pending tasks for today. Adherence score weighted: On Time (1.0), Late (0.7).
                    </p>
                    { !viewAs && (
                      <div className="flex gap-6">
                        <Link href="/medications">
                            <button className="bg-white text-[#008080] px-10 py-5 rounded-[1.5rem] font-black shadow-xl flex items-center gap-3 hover:scale-105 transition-all text-xs uppercase tracking-widest">
                              MANAGE CABINET <ArrowRight size={18} />
                            </button>
                        </Link>
                      </div>
                    )}
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
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Status detected by clinical hub protocol</p>
                    </div>
                 </div>

                 <div className="min-h-[300px] divide-y divide-gray-50">
                    {todayDoses.length === 0 ? (
                       <div className="py-32 text-center">No regimen found.</div>
                    ) : (
                      todayDoses.map((log) => {
                        const uid = `${log.medicationId}_${log.scheduledTime}`
                        const isTaken  = (log.status === 'on_time' || log.status === 'late' || log.status === 'taken' || log.status === 'delayed')
                        const isMissed = log.status === 'missed'
                        const isLoading = takingId === uid

                        return (
                          <div key={uid} className={`group flex items-center justify-between p-8 hover:bg-gray-50/30 transition-all duration-300 ${isTaken ? 'opacity-60' : ''}`}>
                             <div className="flex items-center gap-8">
                                <button
                                  onClick={() => handleMarkTaken(log)}
                                  disabled={isTaken || isMissed || isLoading || !!viewAs}
                                  className={`w-16 h-16 rounded-[1.75rem] border-2 flex items-center justify-center transition-all ${
                                     isTaken ? 'bg-[#008080] border-[#008080] text-white shadow-lg' :
                                     isMissed ? 'bg-red-50 border-red-100 text-red-500' :
                                     'bg-white border-gray-100 text-[#008080]/10 hover:border-[#008080]'
                                  }`}
                                >
                                  {isLoading ? <Loader2 size={18} className="animate-spin text-[#008080]" /> : 
                                   isTaken ? <CheckCircle2 size={32} /> : 
                                   isMissed ? <XCircle size={32} /> :
                                   <Activity size={32} className="group-hover:text-[#008080]" />}
                                </button>
                                
                                <div className="space-y-1.5">
                                   <h4 className={`text-xl font-extrabold tracking-tight ${isTaken ? 'text-gray-400' : 'text-[#1a2233]'}`}>
                                      {log.medicationName}
                                      <span className="ml-3 py-1 px-3 bg-gray-100 text-gray-500 text-[10px] font-black rounded-xl uppercase">{log.dosage}</span>
                                   </h4>
                                   <div className="flex items-center gap-6">
                                      <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                                         <Clock size={14} className="text-[#008080]" />
                                         Plan: {format(parseISO(log.scheduledTime), 'hh:mm a')}
                                      </div>
                                      <div className={`text-[10px] font-black uppercase tracking-[2px] px-3 py-1 rounded-lg border ${
                                         log.status === 'on_time' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                         log.status === 'late' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                         log.status === 'missed' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-400'
                                      }`}>
                                         {log.status.replace('_', ' ')}
                                      </div>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-8">
                                {!isTaken && !isMissed && !viewAs && (
                                  <button onClick={() => handleMarkTaken(log)} className="bg-[#008080] text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest">Log Dose</button>
                                )}
                             </div>
                          </div>
                        )
                      })
                    )}
                 </div>
              </div>
           </div>

           <div className="col-span-12 xl:col-span-4 space-y-10">
              
              <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                 <h3 className={`${merriweather.className} text-2xl font-bold mb-10 text-[#1a2233] flex items-center gap-3`}>
                    <Calendar size={24} className="text-[#008080]" />
                    Adherence Summary
                 </h3>
                 
                 <div className="space-y-8">
                    {[
                      { label: 'Session Adherence', score: scores.today, color: 'text-[#008080]', bg: 'bg-[#e6f2f2]' },
                      { label: 'Weekly Compliance', score: scores.weekly, color: 'text-[#008080]', bg: 'bg-[#e6f2f2]' },
                      { label: 'Clinical Portfolio Audit', score: scores.monthly, color: 'text-[#1a2233]', bg: 'bg-gray-100' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-6 rounded-[2.5rem] border border-gray-50">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                          <p className={`text-3xl font-black ${s.color}`}>{s.score}%</p>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center font-black ${s.color}`}>
                           <TrendingUp size={24} />
                        </div>
                      </div>
                    ))}
                    
                    <div className="p-6 bg-red-50/30 rounded-[2rem] border border-red-100">
                       <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Clinical Risk Hub</p>
                       <p className={`text-sm font-black uppercase tracking-tight ${risk?.riskLevel?.toLowerCase() === 'high' ? 'text-red-500' : 'text-[#008080]'}`}>
                          {risk?.riskLevel || 'SYNCING...'}
                       </p>
                    </div>
                 </div>
              </div>

              {/* Verified Clinicians Node */}
              {!viewAs && (
                <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm">
                   <h3 className={`${merriweather.className} text-2xl font-bold text-[#1a2233] mb-8`}>Care Network</h3>
                   <div className="space-y-6">
                      {doctors.map((doc) => (
                        <div key={doc._id} className="flex items-center gap-6 p-5 rounded-[2.25rem] bg-[#f8fafb] border border-transparent">
                           <div className="w-12 h-12 rounded-[1.25rem] bg-white shadow-sm flex items-center justify-center text-[#008080]"><Stethoscope size={24} /></div>
                           <div className="flex-1">
                              <h4 className="text-sm font-black text-[#1a2233]">Dr. {doc.name}</h4>
                              <p className="text-[9px] font-black text-gray-400 uppercase mt-0.5">{doc.specialization}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
           </div>
        </div>
      </main>

      {toastMessage && (
        <div className="fixed bottom-12 right-12 bg-[#1a2233] text-white px-10 py-6 rounded-[2.5rem] shadow-3xl z-[100] flex items-center gap-6">
          <ShieldCheck size={28} className="text-[#008080]" />
          <p className="font-black text-base">{toastMessage}</p>
        </div>
      )}
    </div>
  )
}
