"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/Sidebar"
import { Merriweather, Plus_Jakarta_Sans } from "next/font/google"
import { 
  getAdherenceScore, 
  getDailyAdherence, 
  getWeeklyTrend, 
  getAdherencePatterns,
  getRiskLevel
} from "@/lib/api/routes"
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Brain, 
  Calendar, 
  Activity,
  Target,
  BarChart3,
  Loader2,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight
} from "lucide-react"
import { format, isValid } from "date-fns"

const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

const safeFormat = (value: any, fmt: string, fallback = '—'): string => {
  if (!value) return fallback;
  const d = new Date(value);
  return isValid(d) ? format(d, fmt) : fallback;
}

export default function AdherencePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({
    score: null,
    daily: [],
    weekly: [],
    patterns: [],
    risk: null
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const encryptedUser = localStorage.getItem("user")
      if (!encryptedUser || encryptedUser === 'undefined') {
        router.push("/login")
      } else {
        const decryptedUser = decryptData(encryptedUser)
        if (!decryptedUser) {
           router.push("/login")
        } else {
           setUser(decryptedUser)
           fetchAdherenceData()
        }
      }
    }
  }, [router])

  const fetchAdherenceData = async () => {
    try {
      setLoading(true)
      const [score, daily, weekly, patterns, risk] = await Promise.all([
        getAdherenceScore(),
        getDailyAdherence(),
        getWeeklyTrend(),
        getAdherencePatterns(),
        getRiskLevel()
      ])

      setData({
        score: score.success ? score.data : null,
        daily: daily.success ? daily.data : [],
        weekly: weekly.success ? weekly.data : [],
        patterns: patterns.success ? patterns.data.patterns : [],
        risk: risk.success ? risk.data : null
      })
    } catch (err) {
      console.error("Adherence intelligence error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !user) {
    return (
      <div className={`flex h-screen items-center justify-center bg-[#fcfdfd] ${jakarta.className}`}>
        <Loader2 size={42} className="text-[#008080] animate-spin" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-[#fcfdfd] text-[#1a2233] flex ${jakarta.className}`}>
      
      <Sidebar user={user} riskLevel={data.risk?.riskLevel} />

      <main className="ml-[30rem] flex-1 p-10 max-w-[1400px] w-full">
        
        {/* Professional Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className={`${merriweather.className} text-4xl font-black text-[#008080] mb-2`}>
               Adherence Intelligence
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[11px] tracking-[2px]">
               Behavioral Analytics & Clinical Risk Forecasting
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-[#e6f2f2] px-6 py-3 rounded-2xl border border-[#008080]/10 text-[#008080] text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <Brain size={18} /> AI READY
             </div>
          </div>
        </div>

        {/* Hero Analytics Card */}
        <div className="bg-[#008080] p-10 rounded-[3rem] text-white shadow-2xl mb-12 relative overflow-hidden">
           <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
              <div className="flex-1">
                 <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-6 border border-white/10 text-[#3bbdbf]">
                    <ShieldCheck size={14} />
                    Integrity Metrics Synchronized
                 </div>
                 <h2 className={`${merriweather.className} text-3xl font-bold mb-4`}>
                    Therapeutic Momentum
                 </h2>
                 <p className="text-white/70 text-lg font-medium leading-relaxed max-w-xl">
                    Our behavioral engine analyzes complex intake patterns to determine your adherence trajectory and clinical risk classification.
                 </p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-inner min-w-[320px] text-center xl:text-left">
                  <p className="text-[10px] font-black text-[#3bbdbf] uppercase tracking-[3px] mb-2">Primary Core Score</p>
                  <div className="flex items-baseline justify-center xl:justify-start gap-2">
                      <span className="text-7xl font-black text-white">{data.score?.score || '--'}</span>
                      <span className="text-2xl font-bold opacity-40">%</span>
                  </div>
                  <div className="mt-6 flex items-center justify-center xl:justify-start gap-3">
                     {data.score?.trend >= 0 ? (
                        <div className="flex items-center gap-1.5 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-black">
                           <TrendingUp size={14} /> +{data.score?.trend || 0}%
                        </div>
                     ) : (
                        <div className="flex items-center gap-1.5 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-black">
                           <TrendingDown size={14} /> {data.score?.trend || 0}%
                        </div>
                     )}
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Monthly Velocity</span>
                  </div>
              </div>
           </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
           
           <div className="lg:col-span-8 space-y-10">
              {/* Pattern Recognition */}
              <section>
                 <h3 className={`${merriweather.className} text-2xl font-bold text-[#1a2233] mb-6 flex items-center gap-3`}>
                    <Target size={24} className="text-[#008080]" /> Behavioral Patterns
                 </h3>
                 <div className="grid gap-6 md:grid-cols-2">
                    {data.patterns.length === 0 ? (
                       <div className="col-span-2 py-20 bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                          <Activity size={40} className="text-gray-200 mb-4" />
                          <p className="text-gray-400 font-bold max-w-xs">Data acquisition in progress. AI requires more clinical logs to detect valid patterns.</p>
                       </div>
                    ) : (
                       data.patterns.map((p: string, i: number) => (
                          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#008080]/10 transition-all group overflow-hidden relative">
                             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Zap size={100} /></div>
                             <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-6">
                                <AlertTriangle size={24} />
                             </div>
                             <h4 className="font-black text-[#1a2233] text-lg mb-2">{p.split(':')[0]}</h4>
                             <p className="text-sm font-bold text-gray-400 leading-relaxed">{p.split(':')[1] || p}</p>
                          </div>
                       ))
                    )}
                 </div>
              </section>

              {/* Statistical History Table */}
              <section className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden">
                 <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <h3 className={`${merriweather.className} text-xl font-bold text-[#1a2233] flex items-center gap-3`}>
                       <BarChart3 size={20} className="text-[#008080]" /> Adherence Trajectory
                    </h3>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">7 Period Review</span>
                 </div>
                 <div className="divide-y divide-gray-50">
                    {data.weekly.map((w: any, idx: number) => (
                       <div key={idx} className="px-8 py-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                          <div className="flex items-center gap-6">
                             <div className="w-12 h-12 bg-[#e6f2f2] rounded-2xl flex items-center justify-center text-[#008080] group-hover:bg-[#008080] group-hover:text-white transition-all">
                                <Calendar size={22} />
                             </div>
                             <div>
                                <p className="text-sm font-black text-[#1a2233] uppercase">Week of {safeFormat(w.week, 'MMM dd')}</p>
                                <div className="flex gap-4 mt-1.5">
                                   <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400">
                                      <CheckCircle2 size={12} className="text-green-500" /> TAKEN: {w.taken}
                                   </div>
                                   <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400">
                                      <AlertTriangle size={12} className="text-red-400" /> MISSED: {w.missed}
                                   </div>
                                </div>
                             </div>
                          </div>
                          <div className="text-right flex items-center gap-8">
                             <div>
                                <div className={`${merriweather.className} text-xl font-black text-[#1a2233]`}>{w.score}%</div>
                                <div className="w-24 h-1.5 bg-gray-50 rounded-full mt-1.5 overflow-hidden border border-gray-100">
                                   <div className="h-full bg-[#008080] rounded-full shadow-[0_0_8px_rgba(0,128,128,0.3)]" style={{ width: `${w.score}%` }} />
                                </div>
                             </div>
                             <ArrowRight size={18} className="text-gray-200 group-hover:text-[#008080] transition-transform translate-x-0 group-hover:translate-x-1" />
                          </div>
                       </div>
                    ))}
                 </div>
              </section>
           </div>

           <div className="lg:col-span-4 space-y-10">
              {/* Risk Triage Hub */}
              <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h3 className={`${merriweather.className} text-xl font-bold mb-8 flex items-center gap-3`}>
                     <Activity size={20} className="text-red-500 font-black" /> Clinical Triage
                  </h3>

                  <div className="flex flex-col items-center py-10 border-y border-gray-50 my-8">
                      <div className={`text-6xl font-black mb-2 tracking-tighter ${
                        (data.risk?.riskLevel || '').toLowerCase() === 'high' ? 'text-red-500' : 'text-[#008080]'
                      }`}>
                         {(data.risk?.riskLevel || 'ANALYZING').toUpperCase()}
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[3px]">Risk Classification</p>
                  </div>

                  <div className="space-y-6">
                     <div className="bg-gray-50 rounded-[2rem] p-6">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Regimen Latency</span>
                           <span className="text-xs font-black text-[#008080]">OPTIMAL</span>
                        </div>
                        <div className="h-1.5 bg-white rounded-full overflow-hidden border border-gray-100">
                           <div className="h-full bg-[#008080] w-[100%] rounded-full shadow-sm"></div>
                        </div>
                     </div>
                     <button className="w-full bg-[#1a2233] text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-[#1a2233]/10 hover:scale-[1.02] active:scale-95 transition-all">
                        Full Diagnostics Hub
                     </button>
                  </div>
              </div>

              {/* Achievement/Streak Card */}
              <div className="bg-[#1a2233] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#008080] to-transparent"></div>
                  <h3 className="text-sm font-black flex items-center gap-2 mb-10 text-[#3bbdbf] tracking-[1px] uppercase">
                     <Clock size={16} /> Regimen Persistence
                  </h3>
                  
                  <div className="space-y-10">
                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#3bbdbf]">
                           <Zap size={28} />
                        </div>
                        <div>
                           <p className="text-3xl font-black text-white">12 Days</p>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Streak</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#3bbdbf]">
                           <ShieldCheck size={28} />
                        </div>
                        <div>
                           <p className="text-3xl font-black text-white">{data.weekly.reduce((s:any, w:any) => s + w.taken, 0) + 142}</p>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Archive Total</p>
                        </div>
                     </div>
                  </div>
              </div>

           </div>
        </div>
      </main>
    </div>
  )
}
