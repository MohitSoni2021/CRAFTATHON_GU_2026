"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/Sidebar"
import { Merriweather, Plus_Jakarta_Sans, Poppins } from "next/font/google"
import { 
  listDoseLogs, 
  getRiskLevel,
  getTodayDoses
} from "@/lib/api/routes"
import { 
  History as HistoryIcon,
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Filter,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Activity,
  Search,
  FileText,
  ShieldCheck,
  TrendingUp,
  XCircle,
  AlertTriangle,
  HelpCircle
} from "lucide-react"
import { format, startOfDay, endOfDay, subDays, addDays, isToday } from "date-fns"

const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })
const poppins = Poppins({ weight: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] });

export default function HistoryPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<any[]>([])
  const [risk, setRisk] = useState<any>(null)
  const [date, setDate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'missed' | 'successful' | 'delayed'>('all')

  useEffect(() => {
    setMounted(true)
    setDate(new Date())
    
    const encryptedUser = localStorage.getItem("user")
    if (!encryptedUser || encryptedUser === 'undefined') {
      router.push("/login")
    } else {
      const decryptedUser = decryptData(encryptedUser)
      if (!decryptedUser) {
         router.push("/login")
      } else {
         setUser(decryptedUser)
      }
    }
  }, [router])

  useEffect(() => {
    if (mounted && user && date) {
      fetchData()
    }
  }, [mounted, user, date])

  const fetchData = async () => {
    try {
      setLoading(true)
      const startDate = startOfDay(date!).toISOString()
      const endDate = endOfDay(date!).toISOString()
      
      let logsRes;
      if (isToday(date!)) {
          logsRes = await getTodayDoses()
      } else {
          logsRes = await listDoseLogs({ startDate, endDate })
      }
      
      const riskRes = await getRiskLevel().catch(() => null)

      if (logsRes.success) setLogs(logsRes.data)
      if (riskRes?.success) setRisk(riskRes.data)
    } catch (err: any) {
      setError("Failed to sync clinical history.")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || !date) {
    return null
  }

  const filteredLogs = logs.filter(log => {
      const status = log.status?.toLowerCase()
      if (filter === 'all') return true
      if (filter === 'missed') return status === 'missed'
      if (filter === 'successful') return (status === 'taken' || status === 'completed') && (log.delayMinutes || 0) === 0
      if (filter === 'delayed') return (log.delayMinutes || 0) > 0 || status === 'delayed'
      return true
  })

  const stats = {
      taken: logs.filter(l => {
          const s = l.status?.toLowerCase()
          return (s === 'taken' || s === 'completed') && (l.delayMinutes || 0) === 0
      }).length,
      delayed: logs.filter(l => (l.delayMinutes || 0) > 0 || l.status?.toLowerCase() === 'delayed').length,
      missed: logs.filter(l => l.status?.toLowerCase() === 'missed').length
  }

  return (
    <div className={`min-h-screen bg-[#f8fafb] text-[#1a2233] flex no-scrollbar overflow-x-hidden ${poppins.className}`}>
      
      <Sidebar user={user} riskLevel={risk?.riskLevel} />

      <main className="ml-[30rem] flex-1 p-10 max-w-[1800px] w-full no-scrollbar">
        
        {/* Professional Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className={`${merriweather.className} text-4xl font-black text-[#008080] mb-2`}>
               Clinical Logs
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[11px] tracking-[2px]">
               Historical Adherence & Medication Events
            </p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-[2rem] border border-gray-100 shadow-sm items-center">
             <button 
               className="p-3 text-gray-400 hover:text-[#008080] hover:bg-gray-50 rounded-2xl transition-all"
               onClick={() => setDate(subDays(date!, 1))}
             >
               <ChevronLeft size={22} />
             </button>
             <div className="flex items-center gap-3 px-6 font-black text-sm min-w-[220px] justify-center text-[#1a2233]">
               <Calendar size={18} className="text-[#008080]" />
               {format(date!, 'MMMM dd, yyyy').toUpperCase()}
             </div>
             <button 
               className="p-3 text-gray-400 hover:text-[#008080] hover:bg-gray-50 rounded-2xl transition-all"
               onClick={() => setDate(addDays(date!, 1))}
               disabled={isToday(date!)}
             >
               <ChevronRight size={22} className={isToday(date!) ? "opacity-20" : ""} />
             </button>
          </div>
        </div>

        {/* Adherence Summary Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><CheckCircle2 size={70} className="text-emerald-500" /></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Taken on time</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-emerald-500">{stats.taken}</span>
                    <span className="text-xs font-bold text-gray-400">DOSES</span>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><AlertTriangle size={70} className="text-amber-500" /></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delayed / late logs</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-amber-500">{stats.delayed}</span>
                    <span className="text-xs font-bold text-gray-400">EVENTS</span>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border-l-8 border-red-500 border-y border-r border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><XCircle size={70} className="text-red-500" /></div>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">Missed sessions</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-red-500">{stats.missed}</span>
                    <span className="text-xs font-bold text-gray-400 text-red-300">CRITICAL</span>
                </div>
            </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-4">
           
           {/* Sidebar Filters */}
           <div className="space-y-8">
              <div className="bg-white border border-gray-100 shadow-sm rounded-[2.5rem] p-8 overflow-hidden">
                  <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Filter size={16} className="text-[#008080]" /> Filter Records
                  </h3>
                  <div className="space-y-2">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`w-full text-left px-5 py-4 rounded-2xl font-black text-xs uppercase transition-all ${filter === 'all' ? 'bg-[#e6f2f2] text-[#008080] border border-[#008080]/10 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        All History
                    </button>
                    <button 
                        onClick={() => setFilter('successful')}
                        className={`w-full text-left px-5 py-4 rounded-2xl font-black text-xs uppercase transition-all ${filter === 'successful' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Taken on Time
                    </button>
                    <button 
                        onClick={() => setFilter('delayed')}
                        className={`w-full text-left px-5 py-4 rounded-2xl font-black text-xs uppercase transition-all ${filter === 'delayed' ? 'bg-amber-50 text-amber-600 border border-amber-100 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Delayed Doses
                    </button>
                    <button 
                        onClick={() => setFilter('missed')}
                        className={`w-full text-left px-5 py-4 rounded-2xl font-black text-xs uppercase transition-all ${filter === 'missed' ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Missed Doses
                    </button>
                    
                    <div className="pt-6 mt-6 border-t border-gray-50">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Daily Performance</p>
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-black text-gray-500 uppercase">Compliance</span>
                           <span className="text-xs font-black text-green-600">{logs.length > 0 ? Math.round((stats.taken / logs.length) * 100) : 0}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.3)] transition-all" style={{ width: `${logs.length > 0 ? (stats.taken / logs.length) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                  </div>
              </div>

              <div className="bg-[#008080] rounded-[2.5rem] p-8 text-white shadow-2xl relative group overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 translate-x-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={100} />
                 </div>
                 <h3 className={`${merriweather.className} text-xl font-bold mb-3`}>AI Insights</h3>
                 <p className="text-white/60 text-[11px] font-bold leading-relaxed mb-6">Our engine analyzes your historical patterns to predict potential future adherence risks.</p>
                 <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all backdrop-blur-sm">Analyze Patterns</button>
              </div>
           </div>

           {/* Main Log List */}
           <div className="lg:col-span-3 space-y-6">
              
              <div className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                   <div className="py-32 flex flex-col items-center justify-center">
                     <Loader2 size={48} className="text-[#008080] animate-spin mb-4" />
                     <p className="text-gray-400 font-black text-[10px] uppercase tracking-[3px]">Synchronizing Archives...</p>
                   </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="py-32 flex flex-col items-center justify-center text-center px-10">
                    <div className="w-24 h-24 bg-[#f8fafb] rounded-[2rem] flex items-center justify-center mb-8 shadow-sm">
                       <HelpCircle size={40} className="text-gray-200" />
                    </div>
                    <h3 className={`${merriweather.className} text-2xl font-bold text-[#1a2233] mb-3`}>No Records Found</h3>
                    <p className="text-gray-400 font-bold max-w-xs leading-relaxed mb-10">Zero therapeutic activity matches the selected filter for this session date.</p>
                    <button 
                      className="bg-[#008080] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#008080]/15"
                      onClick={() => { setFilter('all'); setDate(new Date()); }}
                    >
                      Reset to Today
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {filteredLogs.map((log) => {
                      const status = log.status?.toLowerCase()
                      const isTaken  = (status === 'taken' || status === 'completed' || status === 'delayed')
                      const isMissed = status === 'missed'
                      const isDelayed = (log.delayMinutes || 0) > 0 || status === 'delayed'
                      
                      return (
                        <div key={log._id || `${log.medicationId}_${log.scheduledTime}`} className={`p-8 hover:bg-[#f8fafb]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 group ${isTaken ? 'opacity-80' : ''}`}>
                          <div className="flex items-center gap-8">
                             <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center shrink-0 shadow-sm border transition-transform group-hover:scale-110 ${
                               isTaken && !isDelayed ? 'bg-emerald-50 border-emerald-100 text-emerald-500 shadow-xl shadow-[#008080]/5' : 
                               isMissed ? 'bg-red-50 border-red-100 text-red-500' : 'bg-amber-50 border-amber-100 text-amber-500'
                             }`}>
                               {isTaken && !isDelayed ? <CheckCircle2 size={32} /> : 
                                isMissed ? <XCircle size={32} /> : 
                                <AlertTriangle size={32} />}
                             </div>
                             
                             <div className="space-y-1.5">
                                <h4 className={`${merriweather.className} text-xl font-extrabold text-[#1a2233] group-hover:text-[#008080] transition-colors`}>
                                  {log.medicationId?.name || log.medicationName || "Unidentified Compound"}
                                  <span className="ml-3 py-1 px-3 bg-gray-100 text-gray-500 text-[10px] font-black rounded-xl uppercase border border-gray-100">
                                     {log.medicationId?.dosage || log.dosage}{log.medicationId?.unit || ''}
                                  </span>
                                </h4>
                                <div className="flex flex-wrap items-center gap-6">
                                  <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                                     <Clock size={14} className="text-[#008080]" />
                                     Scheduled {format(new Date(log.scheduledAt || log.scheduledTime), 'hh:mm a')}
                                  </div>
                                  <div className={`text-[10px] font-black uppercase tracking-[2px] px-3 py-1 rounded-lg border ${
                                     isTaken && !isDelayed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                     isDelayed ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                     isMissed ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-400'
                                  }`}>
                                     {isDelayed ? 'DELAYED' : log.status?.toUpperCase()}
                                  </div>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-8">
                             <div className="text-right border-l pl-8 border-gray-50 min-w-[180px]">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Audit Log</p>
                                <p className={`text-xs font-black uppercase tracking-tight ${isTaken ? 'text-[#008080]' : 'text-red-500'}`}>
                                   {isTaken ? `Intake @ ${format(new Date(log.takenAt || new Date()), 'hh:mm a')}` : 'Missed Event'}
                                </p>
                                {isDelayed && (log.delayMinutes || 0) > 0 && (
                                   <p className="text-[10px] font-bold text-amber-500 mt-0.5 tracking-tight">
                                     {log.delayMinutes}m Clinical Delay
                                   </p>
                                )}
                             </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

           </div>
        </div>

        {/* Global Action Bar */}
        <div className="mt-12 flex justify-end">
            <button className="bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-sm flex items-center gap-4 hover:shadow-xl transition-all group">
                <div className="p-3 bg-[#e6f2f2] text-[#008080] rounded-2xl group-hover:bg-[#008080] group-hover:text-white transition-all"><FileText size={24} /></div>
                <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Generate Analytics</p>
                    <p className="text-sm font-black text-[#1a2233]">Global Adherence Report</p>
                </div>
                <ChevronRight size={20} className="ml-4 text-gray-200" />
            </button>
        </div>
      </main>
    </div>
  )
}
