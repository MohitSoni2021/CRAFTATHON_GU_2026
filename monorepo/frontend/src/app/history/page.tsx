"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import { Plus_Jakarta_Sans } from "next/font/google"
import { 
  listDoseLogs, 
  getRiskLevel,
  markDoseAsTaken
} from "@/lib/api/routes"
import { 
  History,
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Filter,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Activity,
  Search
} from "lucide-react"
import { format, startOfDay, endOfDay, subDays, addDays } from "date-fns"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

export default function HistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<any[]>([])
  const [risk, setRisk] = useState<any>(null)
  const [date, setDate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDate(new Date())
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const encryptedUser = localStorage.getItem("user")
      if (!encryptedUser) {
        router.push("/login")
      } else {
        const decryptedUser = decryptData(encryptedUser)
        setUser(decryptedUser)
        if (date) fetchData()
      }
    }
  }, [router, date])

  const fetchData = async () => {
    try {
      setLoading(true)
      const startDate = startOfDay(date!).toISOString()
      const endDate = endOfDay(date!).toISOString()
      
      const [logsRes, riskRes] = await Promise.all([
        listDoseLogs({ startDate, endDate }),
        getRiskLevel()
      ])

      if (logsRes.success) setLogs(logsRes.data)
      if (riskRes.success) setRisk(riskRes.data)
    } catch (err: any) {
      setError("Failed to sync history data")
    } finally {
      setLoading(false)
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'taken': return 'bg-green-50 text-green-600 border-green-100'
      case 'missed': return 'bg-red-50 text-red-600 border-red-100'
      case 'delayed': return 'bg-amber-50 text-amber-600 border-amber-100'
      default: return 'bg-blue-50 text-blue-600 border-blue-100'
    }
  }

  if (!date) return null;

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#2b3654]">
      <Navbar user={user} riskLevel={risk?.riskLevel} />

      {/* Hero Header */}
      <div className="bg-linear-to-r from-[#1E2A4F] to-[#2b3654] text-white shadow-xl overflow-hidden relative">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#4a7ae6] opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="w-full mx-auto px-6 py-14 md:px-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Dose History</h1>
            <p className="text-gray-300 text-lg font-medium">Review your historical adherence and clinical records</p>
          </div>
          
          <div className="flex bg-white/5 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-inner">
             <Button 
               variant="ghost" 
               className="text-white hover:bg-white/10 rounded-xl px-4"
               onClick={() => setDate(subDays(date, 1))}
             >
               <ChevronLeft size={20} />
             </Button>
             <div className="flex items-center gap-2 px-6 font-bold text-lg min-w-[200px] justify-center">
               <Calendar size={18} className="text-[#3bbdbf]" />
               {format(date!, 'MMMM dd, yyyy')}
             </div>
             <Button 
               variant="ghost" 
               className="text-white hover:bg-white/10 rounded-xl px-4"
               onClick={() => setDate(addDays(date, 1))}
             >
               <ChevronRight size={20} />
             </Button>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto p-6 md:p-10">
        
        <div className="grid gap-8 lg:grid-cols-4">
           
           {/* Sidebar Filters */}
           <div className="space-y-6">
              <Card className="bg-white border-gray-100 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="p-6 border-b border-gray-50 bg-gray-50/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#2b3654]">
                    <Filter size={16} className="text-[#4a7ae6]" />
                    QUICK FILTERS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <Button variant="ghost" className="w-full justify-start rounded-xl font-bold text-[#3bbdbf] bg-[#e6fcfa]">All Records</Button>
                  <Button variant="ghost" className="w-full justify-start rounded-xl font-medium text-gray-500 hover:text-[#4a7ae6] hover:bg-[#f0f4ff]">Missed Doses</Button>
                  <Button variant="ghost" className="w-full justify-start rounded-xl font-medium text-gray-500 hover:text-green-600 hover:bg-green-50">Completed</Button>
                  <div className="pt-4 mt-4 border-t border-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-4 px-2">Data Insights</p>
                    <div className="px-2 space-y-4">
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-medium text-gray-500">Daily Compliance</span>
                         <span className="text-xs font-bold text-green-600">92%</span>
                       </div>
                       <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-green-500 w-[92%]"></div>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-[#4a7ae6] rounded-3xl p-6 text-white shadow-xl shadow-[#4a7ae6]/20">
                 <Activity size={32} className="mb-4 opacity-50" />
                 <h3 className="font-bold text-lg mb-2">Need a Report?</h3>
                 <p className="text-white/80 text-xs leading-relaxed mb-6">Generate a comprehensive PDF report of your adherence for your clinical consultation.</p>
                 <Button className="w-full bg-white text-[#4a7ae6] hover:bg-gray-100 font-bold rounded-xl shadow-lg">Download PDF</Button>
              </div>
           </div>

           {/* Main Log List */}
           <div className="lg:col-span-3 space-y-6">
              
              <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                   <div className="py-32 flex flex-col items-center justify-center">
                     <Loader2 size={40} className="text-[#3bbdbf] animate-spin mb-4" />
                     <p className="text-gray-400 font-medium">Fetching historical logs...</p>
                   </div>
                ) : logs.length === 0 ? (
                  <div className="py-32 flex flex-col items-center justify-center text-center px-10">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                       <Search size={32} className="text-gray-200" />
                    </div>
                    <h3 className="text-xl font-bold text-[#2b3654] mb-2">No records found for this date</h3>
                    <p className="text-gray-400 max-w-xs">There are no dose logs registered for {format(date!, 'MMMM dd')}. Try navigating to a different date.</p>
                    <Button 
                      variant="outline" 
                      className="mt-8 rounded-xl border-gray-200"
                      onClick={() => setDate(new Date())}
                    >
                      Reset to Today
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {logs.map((log) => (
                      <div key={log._id} className="p-8 hover:bg-gray-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                        <div className="flex items-start gap-6">
                           <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-sm ${
                             log.status === 'taken' ? 'bg-[#e6faeb] text-green-600' : 
                             log.status === 'missed' ? 'bg-[#fef1f2] text-red-500' : 'bg-[#fffbeb] text-amber-500'
                           }`}>
                             {log.status === 'taken' ? <CheckCircle2 size={32} /> : 
                              log.status === 'missed' ? <AlertCircle size={32} /> : 
                              <Clock size={32} />}
                           </div>
                           
                           <div className="space-y-1">
                              <h4 className="text-xl font-bold text-[#2b3654] group-hover:text-[#4a7ae6] transition-colors">
                                {log.medicationId?.name || "Deleted Medication"}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                                   <Activity size={14} className="text-gray-300" />
                                   {log.medicationId?.dosage}{log.medicationId?.unit}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                                   <Clock size={14} className="text-gray-300" />
                                   Scheduled {format(new Date(log.scheduledAt), 'hh:mm a')}
                                </span>
                              </div>
                              {log.takenAt && (
                                <p className="text-xs font-bold text-gray-400 mt-2">
                                  ACTUAL INTAKE: {format(new Date(log.takenAt), 'hh:mm a')}
                                </p>
                              )}
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <div className={`px-4 py-2 rounded-2xl border font-bold text-sm uppercase tracking-wider ${getStatusStyle(log.status)}`}>
                              {log.status}
                           </div>
                           {log.delayMinutes > 0 && (
                             <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-amber-500 uppercase">DELAYED BY</span>
                                <span className="text-sm font-bold text-[#2b3654]">{log.delayMinutes} mins</span>
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Legend/Info */}
              <div className="flex flex-wrap gap-8 items-center justify-center p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Normal Dose</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Delayed (60m+)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Missed / Skipped</span>
                 </div>
              </div>

           </div>
        </div>
      </div>
    </div>
  )
}
