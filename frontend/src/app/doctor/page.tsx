"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/Sidebar"
import { Merriweather, Plus_Jakarta_Sans } from "next/font/google"
import { 
  getDoctorPatients, 
  linkDoctorPatient, 
  togglePatientFlag, 
  downloadAdherencePDF 
} from "@/lib/api/routes"
import { 
  Users, 
  UserPlus, 
  Flag, 
  FileDown, 
  Search,
  Activity,
  TrendingUp,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  Mail,
  Loader2,
  Zap,
  ArrowRight,
  X
} from "lucide-react"
import { useSocket } from "@/context/SocketContext"

const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

export default function DoctorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [isLinking, setIsLinking] = useState(false)
  const [open, setOpen] = useState(false)
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    const encryptedUser = localStorage.getItem("user")
    if (!encryptedUser || encryptedUser === 'undefined') {
      router.push("/login")
    } else {
      const decryptedUser = decryptData(encryptedUser)
      if (decryptedUser?.role !== 'doctor') {
          router.push("/dashboard")
      } else {
          setUser(decryptedUser)
          fetchPatients()
      }
    }
  }, [router])

  useEffect(() => {
    if (!socket) return;
    const updateHandler = () => fetchPatients();
    socket.on('dose_logged', updateHandler);
    socket.on('risk_level_changed', updateHandler);
    return () => {
      socket.off('dose_logged', updateHandler);
      socket.off('risk_level_changed', updateHandler);
    };
  }, [socket]);

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const res = await getDoctorPatients()
      if (res.success) setPatients(res.data)
    } catch (err) {
      console.error("Clinical audit error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLink = async () => {
    if (!inviteEmail) return
    try {
      setIsLinking(true)
      const res = await linkDoctorPatient({ patientEmail: inviteEmail, specialization })
      if (res.success) {
        setOpen(false)
        setInviteEmail("")
        fetchPatients()
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Enrollment protocol failed.")
    } finally {
      setIsLinking(false)
    }
  }

  const handleToggleFlag = async (linkId: string) => {
    try {
      const res = await togglePatientFlag(linkId)
      if (res.success) {
        setPatients(prev => prev.map(p => p._id === linkId ? { ...p, isFlagged: !p.isFlagged } : p))
      }
    } catch (err) {
      console.error("Prioritization error:", err)
    }
  }

  const handleDownload = async (patientId: string, name: string) => {
    try {
      const response = await downloadAdherencePDF(patientId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Clinical_Analysis_${name}.pdf`)
      document.body.appendChild(link)
      link.click()
    } catch (err) {
      console.error("Deployment error:", err)
    }
  }

  const filteredPatients = patients.filter(p => 
    p.patient.name.toLowerCase().includes(search.toLowerCase()) || 
    p.patient.email.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: patients.length,
    highRisk: patients.filter(p => (p.adherence.riskLevel || '').toLowerCase() === 'high').length,
    flagged: patients.filter(p => p.isFlagged).length,
    avgScore: patients.length > 0 ? Math.round(patients.reduce((acc, p) => acc + p.adherence.score, 0) / patients.length) : 0
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
      
      <Sidebar user={user} />

      <main className="ml-[30rem] flex-1 p-10 max-w-[1400px] w-full no-scrollbar">
        
        {/* Professional Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className={`${merriweather.className} text-4xl font-black text-[#008080] mb-2`}>
               Clinical Oversight
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[11px] tracking-[2px]">
               Patient Population & Adherence Diagnostics
            </p>
          </div>
          <button 
             onClick={() => setOpen(true)}
             className="bg-[#008080] text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-2 shadow-xl shadow-[#008080]/15 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
          >
             <UserPlus size={18} />
             ENROLL PATIENT
          </button>
        </div>

        {/* Clinical Statistics Hub */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Users size={80} /></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Portfolio Total</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black text-[#1a2233]">{stats.total}</span>
                 <span className="text-xs font-bold text-gray-400">UNITS</span>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Activity size={80} /></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aggregate Adherence</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black text-[#008080]">{stats.avgScore}%</span>
                 <TrendingUp size={18} className="text-green-500" />
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border-l-8 border-red-500 border-y border-r border-gray-100 shadow-sm relative overflow-hidden group">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">High Risk Escalations</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black text-red-500">{stats.highRisk}</span>
                 <AlertCircle size={18} className="text-red-500" />
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border-l-8 border-amber-500 border-y border-r border-gray-100 shadow-sm relative overflow-hidden group">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Prioritized Follow-ups</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black text-amber-500">{stats.flagged}</span>
                 <Flag size={18} className="text-amber-500" />
              </div>
           </div>
        </div>

        {/* Patient Population Management */}
        <section className="space-y-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h3 className={`${merriweather.className} text-2xl font-bold text-[#1a2233] flex items-center gap-3`}>
                 <Stethoscope size={24} className="text-[#008080]" /> Clinical Population
              </h3>
              <div className="relative max-w-sm w-full group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#008080] transition-colors" size={20} />
                 <input 
                   placeholder="Search name or clinical ID..." 
                   className="w-full h-14 bg-white border border-gray-100 rounded-2xl pl-14 pr-6 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#008080] shadow-sm transition-all"
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                 />
              </div>
           </div>

           {filteredPatients.length === 0 ? (
             <div className="bg-white rounded-[3.5rem] py-32 flex flex-col items-center justify-center text-center p-10 border border-gray-100 shadow-sm">
                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200 mb-8"><Users size={48} /></div>
                <h4 className={`${merriweather.className} text-2xl font-bold text-[#1a2233] mb-3`}>No Records Identified</h4>
                <p className="text-gray-400 font-bold max-w-sm mx-auto leading-relaxed mb-10">Zero patients currently associated with your clinical node. Invite patients to begin real-time monitoring.</p>
                <button onClick={() => setOpen(true)} className="bg-[#008080]/10 text-[#008080] px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#008080] hover:text-white transition-all shadow-sm">Initiate Enrollment</button>
             </div>
           ) : (
             <div className="grid gap-8">
                {filteredPatients.map(p => (
                  <div key={p._id} className={`bg-white border border-gray-100 rounded-[3rem] p-8 shadow-sm group hover:shadow-xl hover:border-[#008080]/10 transition-all duration-500 overflow-hidden relative ${p.isFlagged ? 'ring-2 ring-amber-500/10' : ''}`}>
                    {p.isFlagged && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rotate-45 translate-x-12 -translate-y-12"></div>}
                    
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 relative z-10">
                      <div className="flex items-center gap-8">
                        <div className="relative">
                          <img 
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${p.patient.name}`} 
                            className="w-20 h-20 rounded-[2rem] border-2 border-white shadow-sm ring-4 ring-[#e6f2f2]" 
                            alt=""
                          />
                          {p.isFlagged && <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-2 rounded-full shadow-lg border-2 border-white"><Flag size={14} fill="currentColor" /></div>}
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                             <h4 className={`${merriweather.className} text-xl font-bold text-[#1a2233]`}>{p.patient.name}</h4>
                             <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                               (p.adherence.riskLevel || '').toLowerCase() === 'low' ? 'bg-green-50 border-green-100 text-green-600' : 
                               (p.adherence.riskLevel || '').toLowerCase() === 'medium' ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-red-50 border-red-100 text-red-600'
                             }`}>
                               {p.adherence.riskLevel} TRIAGE
                             </span>
                           </div>
                           <p className="text-[10px] font-black text-gray-400 flex items-center gap-2 uppercase tracking-tight"><Mail size={12} className="text-[#008080]" /> {p.patient.email}</p>
                           <div className="mt-4 px-4 py-1 bg-gray-50 rounded-lg inline-block text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                             Regimen: {p.specialization || "General Oversight"}
                           </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between xl:justify-end gap-10 xl:gap-20 border-t xl:border-t-0 border-gray-50 pt-8 xl:pt-0">
                         <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Impact Score</p>
                            <p className={`${merriweather.className} text-3xl font-black ${p.adherence.score >= 80 ? 'text-[#008080]' : 'text-red-500'}`}>{p.adherence.score}%</p>
                         </div>
                         <div className="text-center hidden sm:block">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Missed Logs</p>
                            <p className={`${merriweather.className} text-3xl font-black text-gray-300 group-hover:text-red-400 transition-colors`}>{p.adherence.missed}</p>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                               <button 
                                 onClick={() => handleToggleFlag(p._id)}
                                 className={`p-4 rounded-2xl transition-all border ${p.isFlagged ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-gray-50 border-gray-100 text-gray-300 hover:text-amber-500'}`}
                               >
                                 <Flag size={20} fill={p.isFlagged ? "currentColor" : "none"} />
                               </button>
                               <button 
                                 onClick={() => handleDownload(p.patient._id, p.patient.name)}
                                 className="p-4 bg-gray-50 border border-gray-100 text-gray-300 hover:text-[#008080] hover:bg-[#e6f2f2] rounded-2xl transition-all"
                               >
                                 <FileDown size={20} />
                               </button>
                            </div>
                            <button 
                              onClick={() => router.push(`/dashboard?viewAs=${p.patient._id}`)}
                              className="bg-[#1a2233] text-white px-8 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[2px] shadow-xl shadow-[#1a2233]/15 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-2"
                            >
                              ACCESS VAULT
                              <ChevronRight size={18} />
                            </button>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </section>

        {/* Enrollment Overlay */}
        {open && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-8 animate-in fade-in duration-500">
             <div className="w-full max-w-xl bg-white rounded-[3.5rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500">
                 <div className="p-10 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <div>
                       <h3 className={`${merriweather.className} text-3xl font-bold text-[#008080]`}>Patient Enrollment</h3>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Authorized Clinical Interface</p>
                    </div>
                    <button onClick={() => setOpen(false)} className="p-3 bg-white text-gray-300 hover:text-red-500 rounded-2xl shadow-sm transition-all"><X size={24} /></button>
                 </div>
                 
                 <div className="p-10 space-y-8">
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-[#008080] uppercase tracking-widest">Registered Email</label>
                       <div className="relative">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <input 
                            placeholder="patient.id@identity.network"
                            className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                          />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-[#008080] uppercase tracking-widest">Regimen / Specialization</label>
                       <div className="relative">
                          <Stethoscope className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <input 
                            placeholder="e.g. Critical Cardiovascular Oversight"
                            className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            value={specialization}
                            onChange={e => setSpecialization(e.target.value)}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="p-10 bg-gray-50 flex gap-4">
                    <button onClick={() => setOpen(false)} className="flex-1 h-16 bg-white border border-gray-100 text-gray-400 font-black rounded-2xl text-[10px] uppercase tracking-widest">Cancel</button>
                    <button 
                      onClick={handleLink}
                      disabled={isLinking || !inviteEmail}
                      className="flex-[2] h-16 bg-[#008080] text-white font-black rounded-2xl shadow-xl shadow-[#008080]/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      {isLinking ? <Loader2 className="animate-spin" /> : <span>INITIATE LINK</span>}
                      {!isLinking && <ArrowRight size={18} />}
                    </button>
                 </div>
             </div>
          </div>
        )}
      </main>
    </div>
  )
}
