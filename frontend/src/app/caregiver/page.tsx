"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/Sidebar"
import { Merriweather, Plus_Jakarta_Sans } from "next/font/google"
import {
  inviteCaregiver,
  respondCaregiverInvite,
  getCaregiverInvites,
  getMyPatientsList,
  getMyCaregivers,
  unlinkCaregiver
} from "@/lib/api/routes"
import {
  Users,
  UserPlus,
  ShieldCheck,
  Heart,
  Mail,
  Trash2,
  Loader2,
  Activity,
  ChevronRight,
  ShieldAlert,
  Clock,
  UserCheck,
  CheckCircle,
  XCircle,
  ArrowRight,
  Plus
} from "lucide-react"
import { useSocket } from "@/context/SocketContext"

const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

export default function CaregiverPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<any[]>([])
  const [caregivers, setCaregivers] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [isPatient, setIsPatient] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [relationship, setRelationship] = useState("")
  const [isLinking, setIsLinking] = useState(false)
  const [open, setOpen] = useState(false)
  const { socket, isConnected } = useSocket()

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
           setIsPatient(decryptedUser.role === 'patient')
           fetchData(decryptedUser.role === 'caregiver')
        }
      }
    }
  }, [router])

  // Real-time updates
  useEffect(() => {
    if (!socket) return;
    const handleEvents = () => fetchData(!isPatient);
    socket.on('dose_logged', handleEvents);
    socket.on('risk_level_changed', handleEvents);
    socket.on('INVITE_SENT', handleEvents);
    socket.on('INVITE_ACCEPTED', handleEvents);
    socket.on('INVITE_REJECTED', handleEvents);
    return () => {
      socket.off('dose_logged', handleEvents);
      socket.off('risk_level_changed', handleEvents);
      socket.off('INVITE_SENT', handleEvents);
      socket.off('INVITE_ACCEPTED', handleEvents);
      socket.off('INVITE_REJECTED', handleEvents);
    };
  }, [socket, isPatient]);

  const fetchData = async (isCaregiver: boolean) => {
    try {
      setLoading(true)
      if (isCaregiver) {
        const res = await getMyPatientsList()
        if (res.success) setPatients(res.data)
        const invRes = await getCaregiverInvites()
        if (invRes.success) setInvites(invRes.data)
      } else {
        const res = await getMyCaregivers()
        if (res.success) setCaregivers(res.data)
      }
    } catch (err) {
      console.error("Clinical peer fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLink = async () => {
    if (!inviteEmail || !relationship) return
    try {
      setIsLinking(true)
      const res = await inviteCaregiver({ caregiverEmail: inviteEmail, relationship })
      if (res.success) {
        setOpen(false)
        setInviteEmail("")
        setRelationship("")
        fetchData(false)
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Linking policy violation.")
    } finally {
      setIsLinking(false)
    }
  }

  const handleRespondInvite = async (inviteId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await respondCaregiverInvite({ inviteId, status })
      if (res.success) fetchData(true)
    } catch (err: any) {
      alert("System failed to record invitation response.")
    }
  }

  const handleUnlink = async (id: string, isPatientAction: boolean = true) => {
    if (!confirm("Confirm termination of care connection and data access?")) return
    try {
      const res = await unlinkCaregiver(id)
      if (res.success) fetchData(!isPatientAction)
    } catch (err) {
      console.error("Termination error:", err)
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
      
      <Sidebar user={user} />

      <main className="ml-72 flex-1 p-10 max-w-[1400px] w-full">
        
        {/* Professional Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className={`${merriweather.className} text-4xl font-black text-[#008080] mb-2`}>
               {isPatient ? "Care Network" : "Patient Portfolio"}
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[11px] tracking-[2px]">
               {isPatient ? "Authorized Supervisors & Medical Proxies" : "Clinical Oversight & Compliance Monitoring"}
            </p>
          </div>
          
          {isPatient && (
            <button 
              onClick={() => setOpen(true)}
              className="bg-[#008080] text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-2 shadow-xl shadow-[#008080]/15 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              <UserPlus size={20} />
              ESTABLISH CONNECTION
            </button>
          )}
        </div>

        {/* Hero Impact Card */}
        <div className="bg-[#008080] p-10 rounded-[3rem] text-white shadow-2xl mb-12 relative overflow-hidden">
           <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                 <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-6 border border-white/10 text-[#3bbdbf]">
                    <ShieldCheck size={14} />
                    Trust Protocol Active
                 </div>
                 <h2 className={`${merriweather.className} text-3xl font-bold mb-4`}>
                    {isPatient ? "Secure Peer Oversight" : "Managed Monitoring Engine"}
                 </h2>
                 <p className="text-white/70 text-lg max-w-xl font-medium leading-relaxed">
                    {isPatient 
                      ? "Manage individuals authorized to receive automated escalations and view your clinical adherence trajectory."
                      : "Access real-time intake synchronization, risk triage reports, and historical compliance data for your patients."}
                 </p>
              </div>
              <div className="hidden md:flex">
                 <div className="w-40 h-40 bg-white/5 rounded-[3rem] border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black uppercase opacity-60 mb-2">Connected</span>
                    <span className="text-5xl font-black">{isPatient ? caregivers.length : patients.length}</span>
                    <span className="text-[10px] font-black uppercase opacity-60 mt-2">{isPatient ? "Caregivers" : "Patients"}</span>
                 </div>
              </div>
           </div>
        </div>

        {!isPatient ? (
          /* Caregiver Perspective */
          <div className="space-y-10">
            {/* Pending Invites */}
            {invites.length > 0 && (
              <div className="bg-amber-50/30 border border-amber-100 rounded-[2.5rem] p-8">
                <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <Mail size={16} /> Connection Requests Pending
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {invites.map(inv => (
                    <div key={inv._id} className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm flex items-center justify-between">
                       <div>
                          <p className="font-black text-[#1a2233]">{inv.patientId?.name || 'Authorized Patient'}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">{inv.patientId?.email}</p>
                          <div className="mt-4 px-3 py-1 bg-amber-50 rounded-lg inline-block text-[10px] font-black text-amber-600 uppercase">Role: {inv.relationship}</div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => handleRespondInvite(inv._id, 'ACCEPTED')} className="bg-[#008080] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all hover:shadow-lg">Accept</button>
                          <button onClick={() => handleRespondInvite(inv._id, 'REJECTED')} className="bg-gray-100 text-gray-500 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-red-50 hover:text-red-500 transition-all">Decline</button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {patients.length === 0 ? (
                <div className="col-span-full py-32 bg-white border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200 mb-6"><Users size={40} /></div>
                   <h4 className={`${merriweather.className} text-xl font-bold text-[#1a2233] mb-2`}>Portfolio Empty</h4>
                   <p className="text-gray-400 font-bold max-w-xs">Patients must invite your clinical profile email to establish a monitoring link.</p>
                </div>
              ) : (
                patients.map(p => (
                  <div key={p.link} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm group hover:shadow-xl hover:border-[#008080]/20 transition-all duration-500">
                     <div className="flex justify-between items-start mb-8">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-sm ring-4 ring-[#e6f2f2]">
                           <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${p.patient.name}`} alt="" />
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                           p.adherence.riskLevel === 'LOW' ? 'bg-green-50 text-green-600' : p.adherence.riskLevel === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                           {p.adherence.riskLevel} TRIAGE
                        </div>
                     </div>
                     <h4 className={`${merriweather.className} text-2xl font-bold text-[#1a2233] mb-1`}>{p.patient.name}</h4>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight mb-8">{p.patient.email}</p>
                     
                     <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-8 mb-8">
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score</p>
                           <p className="text-3xl font-black text-[#008080]">{p.adherence.score}%</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Missed</p>
                           <p className="text-3xl font-black text-red-500">{p.adherence.missed}</p>
                        </div>
                     </div>

                     <button onClick={() => router.push(`/dashboard?viewAs=${p.patient._id}`)} className="w-full bg-gray-50 text-[#008080] font-black py-5 rounded-2xl text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-[#008080] group-hover:text-white transition-all shadow-sm">
                        Access Diagnostics <ChevronRight size={18} />
                     </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Patient Perspective */
          <div className="space-y-10">
             <div className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                   <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <UserCheck size={18} className="text-[#008080]" /> Authorized Supervisors
                   </h3>
                   <span className="text-[10px] font-black bg-[#e6f2f2] text-[#008080] px-3 py-1 rounded-full">{caregivers.length} Connections</span>
                </div>
                
                {caregivers.length === 0 ? (
                  <div className="py-24 text-center">
                     <p className="text-gray-400 font-bold max-w-sm mx-auto">None currently linked. Use the establish connection button to invite a trusted peer.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {caregivers.map((cg: any) => (
                      <div key={cg._id} className="p-8 flex items-center justify-between group hover:bg-gray-50/50 transition-all">
                         <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${
                               cg.status === 'ACCEPTED' ? 'bg-[#e6f2f2] border-[#008080]/10 text-[#008080]' : 'bg-amber-50 border-amber-100 text-amber-500'
                            }`}>
                               {cg.status === 'ACCEPTED' ? <CheckCircle size={28} /> : <Clock size={28} />}
                            </div>
                            <div>
                               <h4 className={`${merriweather.className} text-xl font-bold text-[#1a2233]`}>{cg.caregiverId?.name || cg.caregiverEmail}</h4>
                               <div className="flex items-center gap-3 mt-1.5 font-black text-[10px] uppercase tracking-widest">
                                  <span className="text-gray-400">{cg.relationship}</span>
                                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                  <span className={cg.status === 'ACCEPTED' ? 'text-[#008080]' : 'text-amber-600'}>
                                     {cg.status === 'ACCEPTED' ? 'Encrypted Link Active' : 'Authorization Pending'}
                                  </span>
                               </div>
                            </div>
                         </div>
                         <button onClick={() => handleUnlink(cg._id)} className="p-3 bg-gray-50 text-gray-300 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                            <Trash2 size={20} />
                         </button>
                      </div>
                    ))}
                  </div>
                )}
             </div>

             <div className="bg-[#e6f2f2] border border-[#008080]/10 rounded-[2.5rem] p-10 flex gap-8 items-start">
                <div className="w-14 h-14 bg-white border border-[#008080]/20 rounded-2xl flex items-center justify-center text-[#008080] shrink-0 shadow-sm"><ShieldAlert size={28} /></div>
                <div>
                   <h4 className={`${merriweather.className} text-xl font-bold text-[#1a2233] mb-2`}>Supervision Protocol</h4>
                   <p className="text-sm font-bold text-[#008080]/70 leading-relaxed max-w-3xl">
                      Authorized caregivers receive proactive notifications via our adherence engine. Critical events, such as skipped doses in high-risk regimens, are automatically escalated to your network to ensure therapeutic integrity.
                   </p>
                </div>
             </div>
          </div>
        )}

        {/* Invite Overlay */}
        {open && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-8 animate-in fade-in duration-500">
             <div className="w-full max-w-lg bg-white rounded-[3.5rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500">
                 <div className="p-10 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <div>
                       <h3 className={`${merriweather.className} text-3xl font-bold text-[#008080]`}>Establish Hub Link</h3>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Authorized Caregiver Invitation</p>
                    </div>
                    <button onClick={() => setOpen(false)} className="p-3 bg-white text-gray-300 hover:text-red-500 rounded-2xl shadow-sm transition-all"><XCircle size={24} /></button>
                 </div>
                 
                 <div className="p-10 space-y-8">
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-[#008080] uppercase tracking-widest">Caregiver Email Address</label>
                       <div className="relative">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <input 
                            placeholder="clinic.peer@email.com"
                            className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                          />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-[#008080] uppercase tracking-widest">Medical Relationship</label>
                       <div className="relative">
                          <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <input 
                            placeholder="e.g. Registered Nurse, Family Guardian"
                            className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            value={relationship}
                            onChange={e => setRelationship(e.target.value)}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="p-10 bg-gray-50 flex gap-4">
                    <button onClick={() => setOpen(false)} className="flex-1 h-16 bg-white border border-gray-100 text-gray-400 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/80 transition-all">Cancel</button>
                    <button 
                      onClick={handleLink}
                      disabled={isLinking || !inviteEmail || !relationship}
                      className="flex-[2] h-16 bg-[#008080] text-white font-black rounded-2xl shadow-xl shadow-[#008080]/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      {isLinking ? <Loader2 className="animate-spin" /> : <span>DISPATCH INVITATION</span>}
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
