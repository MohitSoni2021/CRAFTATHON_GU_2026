"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import { 
  getDoctorPatients, 
  linkDoctorPatient, 
  togglePatientFlag, 
  downloadAdherencePDF 
} from "@/lib/api/routes"
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Flag, 
  FileDown, 
  Search,
  Activity,
  History,
  TrendingUp,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  Mail,
  Loader2
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useSocket } from "@/context/SocketContext"

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
    if (!encryptedUser) {
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
      console.error("Doctor fetch error:", err)
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
      alert(err.response?.data?.message || "Linking failed")
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
      console.error("Flag error:", err)
    }
  }

  const handleDownload = async (patientId: string, name: string) => {
    try {
      const response = await downloadAdherencePDF(patientId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `AdherenceReport_${name}.pdf`)
      document.body.appendChild(link)
      link.click()
    } catch (err) {
      console.error("Download error:", err)
    }
  }

  const filteredPatients = patients.filter(p => 
    p.patient.name.toLowerCase().includes(search.toLowerCase()) || 
    p.patient.email.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: patients.length,
    highRisk: patients.filter(p => p.adherence.riskLevel === 'high').length,
    flagged: patients.filter(p => p.isFlagged).length,
    avgScore: patients.length > 0 ? Math.round(patients.reduce((acc, p) => acc + p.adherence.score, 0) / patients.length) : 0
  }

  if (loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8faff]">
        <Loader2 size={40} className="text-[#5a4ae6] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafbff] text-[#1a233a]">
      <Navbar user={user} />

      {/* Modern Clinic Header */}
      <div className="bg-linear-to-r from-[#1a233a] to-[#2b3a5a] text-white py-14 px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-[-20deg] translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">
               <Stethoscope size={14} className="text-[#3bbdbf]" /> Medical Oversight Portal
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Clinical Dashboard</h1>
            <p className="text-white/60 text-lg max-w-xl">Supervising therapeutic adherence and patient risk across your clinical network.</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3bbdbf] hover:bg-[#2faeb0] text-white px-8 py-7 rounded-2xl shadow-xl shadow-[#3bbdbf]/20 flex items-center gap-2 font-bold text-lg transition-transform hover:scale-105 active:scale-95">
                <UserPlus size={22} />
                Link New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl p-8 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <UserPlus className="text-[#3bbdbf]" /> Enroll Patient
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-6">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-400 uppercase">Patient Email</label>
                   <Input 
                     placeholder="patient@email.com" 
                     value={inviteEmail}
                     onChange={(e) => setInviteEmail(e.target.value)}
                     className="rounded-xl border-gray-100 py-6"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-400 uppercase">Treatment/Specialization</label>
                   <Input 
                     placeholder="e.g. Hypertension Management" 
                     value={specialization}
                     onChange={(e) => setSpecialization(e.target.value)}
                     className="rounded-xl border-gray-100 py-6"
                   />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleLink}
                  disabled={isLinking || !inviteEmail}
                  className="w-full bg-[#1a233a] hover:bg-black text-white py-6 rounded-xl font-bold"
                >
                  {isLinking ? <Loader2 className="animate-spin" /> : "Establish Link"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 -mt-8 space-y-8 relative z-20">
        
        {/* Real-time Analytics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-sm rounded-3xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Patients</p>
            <div className="flex items-center justify-between">
               <h3 className="text-3xl font-black">{stats.total}</h3>
               <Users className="text-[#3bbdbf]" size={20} />
            </div>
          </Card>
          <Card className="bg-white border-0 shadow-sm rounded-3xl p-6">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Average Adherence</p>
            <div className="flex items-center justify-between">
               <h3 className="text-3xl font-black">{stats.avgScore}%</h3>
               <TrendingUp className="text-green-500" size={20} />
            </div>
          </Card>
          <Card className="bg-white border-0 shadow-sm rounded-3xl p-6 border-l-4 border-red-500">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">High Risk Cases</p>
            <div className="flex items-center justify-between">
               <h3 className="text-3xl font-black text-red-500">{stats.highRisk}</h3>
               <AlertCircle className="text-red-500" size={20} />
            </div>
          </Card>
          <Card className="bg-white border-0 shadow-sm rounded-3xl p-6 border-l-4 border-amber-500">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Flagged for Follow-up</p>
            <div className="flex items-center justify-between">
               <h3 className="text-3xl font-black text-amber-500">{stats.flagged}</h3>
               <Flag className="text-amber-500" size={20} />
            </div>
          </Card>
        </div>

        {/* Patient Clinical List */}
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Patient Population 
                <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{filteredPatients.length} active</span>
              </h2>
              <div className="relative max-w-xs w-full">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <Input 
                   placeholder="Search name or medical ID..." 
                   className="pl-12 rounded-2xl border-0 shadow-sm bg-white"
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                 />
              </div>
           </div>

           {loading && patients.length === 0 ? (
             <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#3bbdbf]" size={40} /></div>
           ) : filteredPatients.length === 0 ? (
             <div className="bg-white rounded-[3rem] py-32 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-gray-100">
                <Users className="text-gray-100 mb-6" size={80} />
                <h3 className="text-xl font-bold">No patients identified</h3>
                <p className="text-gray-400 max-w-sm mt-2">Start by linking patients to your clinical dashboard to begin monitoring their progress.</p>
             </div>
           ) : (
             <div className="grid gap-6">
                {filteredPatients.map(p => (
                  <Card key={p._id} className={`bg-white border-0 shadow-xs rounded-[2.5rem] overflow-hidden group hover:shadow-xl transition-all ${p.isFlagged ? 'ring-2 ring-amber-500/20' : ''}`}>
                    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <img 
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${p.patient.name}`} 
                            className="w-16 h-16 rounded-3xl bg-[#f0f4ff]" 
                            alt=""
                          />
                          {p.isFlagged && <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1 rounded-full"><Flag size={12} fill="currentColor" /></div>}
                        </div>
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                             <h4 className="text-xl font-bold">{p.patient.name}</h4>
                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                               p.adherence.riskLevel === 'low' ? 'bg-green-50 text-green-600' : 
                               p.adherence.riskLevel === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                             }`}>
                               {p.adherence.riskLevel} Risk
                             </span>
                           </div>
                           <p className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"><Mail size={12} /> {p.patient.email}</p>
                           <p className="text-[10px] font-bold text-[#3bbdbf] mt-2 uppercase tracking-widest">{p.specialization}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 md:gap-12">
                         <div className="text-center">
                            <p className="text-[10px] font-bold text-gray-300 uppercase mb-1">Adherence</p>
                            <p className={`text-2xl font-black ${p.adherence.score >= 80 ? 'text-green-500' : 'text-red-500'}`}>{p.adherence.score}%</p>
                         </div>
                         <div className="text-center hidden sm:block">
                            <p className="text-[10px] font-bold text-gray-300 uppercase mb-1">Missed</p>
                            <p className="text-2xl font-black text-gray-400">{p.adherence.missed}</p>
                         </div>
                         <div className="flex items-center gap-3">
                            <Button 
                              onClick={() => handleToggleFlag(p._id)}
                              variant="ghost" 
                              className={`rounded-2xl w-12 h-12 p-0 ${p.isFlagged ? 'bg-amber-50 text-amber-600' : 'text-gray-300 hover:text-amber-600'}`}
                            >
                              <Flag size={20} fill={p.isFlagged ? "currentColor" : "none"} />
                            </Button>
                            <Button 
                              onClick={() => handleDownload(p.patient._id, p.patient.name)}
                              variant="ghost" 
                              className="rounded-2xl w-12 h-12 p-0 text-gray-300 hover:text-[#3bbdbf] hover:bg-[#e6fcfa]"
                            >
                              <FileDown size={20} />
                            </Button>
                            <Button 
                              onClick={() => router.push(`/dashboard?viewAs=${p.patient._id}`)}
                              className="bg-[#f8faff] hover:bg-[#1a233a] text-[#1a233a] hover:text-white rounded-2xl px-6 py-6 font-bold shadow-none transition-all"
                            >
                              Clinical View
                              <ChevronRight size={16} className="ml-1" />
                            </Button>
                         </div>
                      </div>
                    </div>
                  </Card>
                ))}
             </div>
           )}
        </div>

      </div>
    </div>
  )
}
