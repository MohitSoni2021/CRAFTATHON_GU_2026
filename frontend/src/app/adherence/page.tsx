"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
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
  ArrowUpRight,
  Target,
  BarChart3,
  Loader2,
  Clock
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { format } from "date-fns"

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
      if (!encryptedUser) {
        router.push("/login")
      } else {
        const decryptedUser = decryptData(encryptedUser)
        setUser(decryptedUser)
        fetchAdherenceData()
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
      console.error("Adherence fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8faff]">
        <Loader2 size={40} className="text-[#3bbdbf] animate-spin" />
      </div>
    )
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#2b3654]">
      <Navbar user={user} riskLevel={data.risk?.riskLevel} />

      {/* Header Section */}
      <div className="bg-linear-to-r from-[#2b7a8c] to-[#3bbdbf] text-white shadow-xl overflow-hidden relative">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="w-full mx-auto px-6 py-14 md:px-10 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-bold">
                 <Brain size={16} className="text-[#e6fcfa]" />
                 AI POWERED ANALYTICS
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Adherence Intelligence</h1>
              <p className="text-white/80 text-lg font-medium max-w-xl">
                 Real-time clinical insights into your medication behavior and preventative health metrics.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl min-w-[280px]">
               <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Overall Core Score</p>
               <div className="flex items-baseline gap-2">
                 <span className="text-6xl font-black">{data.score?.score || '--'}</span>
                 <span className="text-2xl font-bold opacity-60">%</span>
               </div>
               <div className="mt-4 flex items-center gap-2 text-sm font-bold">
                  {data.score?.trend > 0 ? (
                    <span className="flex items-center gap-1 text-green-300"><TrendingUp size={16}/> +{data.score.trend}%</span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-300"><TrendingDown size={16}/> {data.score?.trend}%</span>
                  )}
                  <span className="opacity-60">vs last 30 days</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto p-6 md:p-10 space-y-8">
        
        {/* Main Analytics Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
           
           {/* Patterns & Insights */}
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                   <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                     <Target size={20} className="text-[#3bbdbf]" />
                   </div>
                   Behavioral Patterns
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                 {data.patterns.length === 0 ? (
                   <div className="col-span-2 py-12 bg-white border border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400">
                      <Clock size={32} className="mb-2 opacity-20" />
                      <p className="font-medium">Collecting data for pattern recognition...</p>
                   </div>
                 ) : (
                    data.patterns.map((pattern: string, idx: number) => (
                      <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-amber-50 text-amber-500">
                           <AlertTriangle size={24} />
                        </div>
                        <h4 className="font-bold text-[#2b3654] mb-1">{pattern.split(':')[0]}</h4>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4">{pattern.split(':')[1] || pattern}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 uppercase tracking-widest text-[10px] font-bold">
                           <span className="text-amber-500">Medium Impact</span>
                           <span className="text-gray-400">Detected Recently</span>
                        </div>
                      </div>
                    ))
                 )}
              </div>

              {/* Weekly Trend Table/List */}
              <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                 <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <h3 className="font-bold flex items-center gap-2">
                      <BarChart3 size={18} className="text-[#4a7ae6]" />
                      Weekly Adherence Trend
                    </h3>
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-[#4a7ae6]">EXPORT DATA</Button>
                 </div>
                 <div className="divide-y divide-gray-50">
                    {data.weekly.map((week: any, idx: number) => (
                       <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                             <div className="bg-[#f0f4ff] p-3 rounded-2xl text-[#4a7ae6]">
                               <Calendar size={20} />
                             </div>
                             <div>
                               <p className="text-sm font-bold text-[#2b3654] uppercase tracking-wide">Week of {format(new Date(week.week), 'MMM dd')}</p>
                               <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs font-medium text-gray-400">TAKEN: <span className="text-green-600 font-bold">{week.taken}</span></span>
                                  <span className="text-xs font-medium text-gray-400">MISSED: <span className="text-red-500 font-bold">{week.missed}</span></span>
                               </div>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-xl font-black text-[#2b3654]">{week.score}%</div>
                             <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                <div 
                                  className="h-full bg-[#4a7ae6] rounded-full" 
                                  style={{ width: `${week.score}%` }}
                                />
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Sidebar: Diagnostics & Risk */}
           <div className="space-y-8">
              
              <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                 <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-red-500" />
                    Risk Assessment
                 </h2>
                 
                 <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className={`text-5xl font-black uppercase mb-2 ${
                      data.risk?.riskLevel === 'low' ? 'text-green-500' : 'text-amber-500'
                    }`}>
                      {data.risk?.riskLevel || 'ANALYZING'}
                    </div>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">CURRENT RISK CLASSIFICATION</p>
                 </div>

                 <div className="space-y-4 mt-8">
                    <div className="bg-[#fcfdfd] border border-gray-100 p-4 rounded-2xl">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sync Consistency</span>
                          <span className="text-xs font-bold text-green-600">98%</span>
                       </div>
                       <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 w-[98%]"></div>
                       </div>
                    </div>
                 </div>

                 <Button className="w-full mt-8 bg-[#2b3654] hover:bg-[#1E2A4F] text-white py-6 rounded-2xl font-bold shadow-lg shadow-[#2b3654]/10">
                    Detailed Diagnostics
                 </Button>
              </div>

              {/* Health Stats */}
              <div className="bg-[#1E2A4F] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#3bbdbf] opacity-10 rounded-full blur-3xl"></div>
                 <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                    <CheckCircle2 size={20} className="text-[#3bbdbf]" />
                    Streak Tracking
                 </h3>
                 <div className="space-y-6">
                    <div>
                       <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Current Streak</p>
                       <p className="text-3xl font-black">12 Days</p>
                    </div>
                    <div>
                       <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Total Doses Managed</p>
                       <p className="text-3xl font-black">{data.weekly.reduce((s: any, w: any) => s + w.taken, 0) + 142}</p>
                    </div>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  )
}
