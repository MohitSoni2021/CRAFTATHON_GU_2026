"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
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
  Search,
  Activity,
  ChevronRight,
  ShieldAlert,
  Clock,
  UserCheck,
  CheckCircle,
  XCircle
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"

import { useSocket } from "@/context/SocketContext"

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
      if (!encryptedUser) {
        router.push("/login")
      } else {
        const decryptedUser = decryptData(encryptedUser)
        setUser(decryptedUser)
        setIsPatient(decryptedUser.role === 'patient')
        fetchData(decryptedUser.role === 'caregiver')
      }
    }
  }, [router])

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleDoseLogged = (data: any) => {
      console.log("Real-time Dose Logged:", data);
      fetchData(!isPatient);
    };

    const handleRiskLevelChanged = (data: any) => {
      console.log("Real-time Risk Level Changed:", data);
      fetchData(!isPatient);
    };

    const handleInviteSent = (data: any) => {
      console.log("Real-time Invite Sent:", data);
      fetchData(true); // Refetch caregiver side
    };

    const handleInviteResponse = (data: any) => {
      console.log("Real-time Invite Response:", data);
      fetchData(false); // Refetch patient side
    };

    const handleBoardReload = () => {
      fetchData(isPatient ? false : true);
    };

    socket.on('dose_logged', handleDoseLogged);
    socket.on('risk_level_changed', handleRiskLevelChanged);
    socket.on('INVITE_SENT', handleInviteSent);
    socket.on('INVITE_ACCEPTED', handleInviteResponse);
    socket.on('INVITE_REJECTED', handleInviteResponse);
    window.addEventListener('reloadCaregiverBoard', handleBoardReload);

    return () => {
      socket.off('dose_logged', handleDoseLogged);
      socket.off('risk_level_changed', handleRiskLevelChanged);
      socket.off('INVITE_SENT', handleInviteSent);
      socket.off('INVITE_ACCEPTED', handleInviteResponse);
      socket.off('INVITE_REJECTED', handleInviteResponse);
      window.removeEventListener('reloadCaregiverBoard', handleBoardReload);
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
      console.error("Caregiver fetch error:", err)
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
      alert(err.response?.data?.message || "Failed to link")
    } finally {
      setIsLinking(false)
    }
  }

  const handleRespondInvite = async (inviteId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await respondCaregiverInvite({ inviteId, status })
      if (res.success) {
        fetchData(true)
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to respond")
    }
  }

  const handleUnlink = async (id: string, isPatientAction: boolean = true) => {
    if (!confirm("Are you sure you want to remove this connection?")) return
    try {
      const res = await unlinkCaregiver(id)
      if (res.success) {
        fetchData(!isPatientAction)
      }
    } catch (err) {
      console.error("Unlink error:", err)
    }
  }

  if (loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8faff]">
        <Loader2 size={40} className="text-[#3bbdbf] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#2b3654]">
      <Navbar user={user} />

      {/* Hero Header */}
      <div className="bg-linear-to-r from-[#5a4ae6] to-[#7c6ff0] text-white shadow-xl overflow-hidden relative">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="w-full mx-auto px-6 py-14 md:px-10 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-bold uppercase tracking-widest">
                <ShieldCheck size={16} className="text-[#e6fcfa]" />
                Trusted Care Network
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                {isPatient ? "My Caregivers" : "Patient Monitoring"}
              </h1>
              <p className="text-white/80 text-lg font-medium max-w-xl">
                {isPatient
                  ? "Manage who has access to your adherence data and receives critical health alerts."
                  : "Real-time oversight of patient compliance, adherence scores, and clinical risks."}
              </p>
            </div>

            {isPatient && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-[#5a4ae6] hover:bg-gray-100 font-bold px-8 py-8 rounded-3xl shadow-2xl flex items-center gap-3 text-lg transition-transform hover:scale-105">
                    <UserPlus size={24} />
                    Add Caregiver
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8">
                  <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                      <Heart size={24} className="text-[#5a4ae6]" />
                      Link Trusted Caregiver
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 font-medium">
                      Invite a family member or professional to monitor your adherence.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-6 font-poppins">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={14} /> Email Address
                      </label>
                      <Input
                        placeholder="caregiver@email.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="rounded-xl border-gray-100 py-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Users size={14} /> Relationship
                      </label>
                      <Input
                        placeholder="e.g. Son, Daughter, Nurse"
                        value={relationship}
                        onChange={(e) => setRelationship(e.target.value)}
                        className="rounded-xl border-gray-100 py-6"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleLink}
                      disabled={isLinking || !inviteEmail || !relationship}
                      className="w-full bg-[#5a4ae6] hover:bg-[#4939d4] text-white py-8 rounded-2xl font-bold text-lg"
                    >
                      {isLinking ? <Loader2 className="animate-spin mr-2" /> : "Send Secure Invitation"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="w-full mx-auto p-6 md:p-10">

        {!isPatient ? (
          <div className="space-y-8">
            {/* Invitations Section */}
            {invites.length > 0 && (
              <div className="space-y-6 mb-12">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[#2b3654]">
                  <Mail size={24} className="text-amber-500" />
                  Pending Invitations
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {invites.map(inv => (
                    <Card key={inv._id} className="bg-white border-amber-100 shadow-sm rounded-2xl overflow-hidden">
                      <div className="p-6 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#2b3654]">{inv.patientId?.name || 'Unknown Patient'}</p>
                          <p className="text-sm text-gray-500">{inv.patientId?.email}</p>
                          <p className="text-xs text-amber-600 mt-1 uppercase font-bold tracking-widest">Wants to add you as: {inv.relationship}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => handleRespondInvite(inv._id, 'ACCEPTED')} size="sm" className="bg-green-50 text-green-600 hover:bg-green-100 font-bold rounded-xl px-4">
                            Accept
                          </Button>
                          <Button onClick={() => handleRespondInvite(inv._id, 'REJECTED')} size="sm" variant="ghost" className="text-gray-400 hover:text-red-500 rounded-xl px-4">
                            Decline
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users size={24} className="text-[#5a4ae6]" />
                Monitored Patients
                <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-400 ml-2">{patients.length}</span>
              </h2>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isConnected ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 blink'}`}></div>
                  {isConnected ? 'Live' : 'Offline'}
                </div>
                <Button variant="ghost" onClick={() => fetchData(true)} className="text-[#5a4ae6] font-bold">Refresh All</Button>
              </div>
            </div>

            {patients.length === 0 ? (
              <div className="py-32 bg-white border border-dashed border-gray-200 rounded-[3rem] flex flex-col items-center justify-center text-center px-10">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Users size={40} className="text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-[#2b3654] mb-2">No patients linked yet</h3>
                <p className="text-gray-400 max-w-sm">Patients must invite you using your email address before their data will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Sort by high risk first */}
                {[...patients].sort((a, b) => {
                  if (a.adherence.riskLevel === 'HIGH') return -1;
                  if (b.adherence.riskLevel === 'HIGH') return 1;
                  return 0;
                }).map((p) => (
                  <Card key={p.link} className="bg-white border-gray-100 shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-xl hover:shadow-[#5a4ae6]/5 transition-all">
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${p.patient.name}`}
                          className="w-16 h-16 rounded-2xl shadow-inner border-2 border-white"
                          alt=""
                        />
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.adherence.riskLevel === 'LOW' ? 'bg-green-50 text-green-600' : (p.adherence.riskLevel === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600')
                          }`}>
                          {p.adherence.riskLevel} Risk
                        </div>
                      </div>
                      <h4 className="text-2xl font-bold text-[#2b3654] mb-1">{p.patient.name}</h4>
                      <p className="text-sm font-medium text-gray-400 mb-6 flex items-center gap-1.5 lowercase">
                        <Mail size={14} /> {p.patient.email}
                      </p>

                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50 mb-8">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Adherence</p>
                          <p className="text-2xl font-black text-[#2b3654]">{p.adherence.score}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Missed</p>
                          <p className="text-2xl font-black text-red-500">{p.adherence.missed}</p>
                        </div>
                      </div>

                      <Button
                        onClick={() => router.push(`/dashboard?viewAs=${p.patient._id}`)}
                        className="w-full bg-[#f8faff] text-[#5a4ae6] hover:bg-[#5a4ae6] hover:text-white py-6 rounded-2xl font-bold shadow-none transition-all group-hover:shadow-lg"
                      >
                        Full Diagnostics
                        <ChevronRight size={18} className="ml-1" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Patient View: Manage who watches me */
          <div className="w-full mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck size={24} className="text-green-500" />
                Active Supervision & Invites
              </h2>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold flex items-center gap-2">Caregiver Connections</h3>
                  <p className="text-xs text-gray-400 font-medium font-poppins">Manage people who receive your adherence updates.</p>
                </div>
              </div>

              {caregivers.length === 0 ? (
                <div className="p-20 flex flex-col items-center justify-center text-center opacity-40">
                  <UserCheck size={48} className="mb-4 text-gray-300" />
                  <p className="font-bold text-gray-400">No caregivers linked. Invite a family member to help you stay on track.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {caregivers.map((cg: any) => (
                    <div key={cg._id} className="p-6 md:p-8 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${cg.status === 'ACCEPTED' ? 'bg-green-50 text-green-500' :
                            cg.status === 'PENDING' ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'
                          }`}>
                          {cg.status === 'ACCEPTED' ? <CheckCircle /> : cg.status === 'PENDING' ? <Clock /> : <XCircle />}
                        </div>
                        <div>
                          <p className="font-bold text-[#2b3654] text-lg">
                            {cg.caregiverId?.name || cg.caregiverEmail}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-gray-500 font-medium">{cg.relationship}</p>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <p className={`text-xs font-bold uppercase tracking-widest ${cg.status === 'ACCEPTED' ? 'text-green-600' :
                                cg.status === 'PENDING' ? 'text-amber-600' : 'text-red-500'
                              }`}>
                              {cg.status === 'PENDING' ? 'Waiting for response' : cg.status === 'ACCEPTED' ? 'Connected ✅' : 'Declined ❌'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full"
                        onClick={() => handleUnlink(cg._id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Safety Banner */}
            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 flex gap-6 mt-8">
              <div className="bg-white p-3 rounded-2xl text-amber-500 shadow-sm border border-amber-100 shrink-0 h-min">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 mb-1">Supervision Notice</h4>
                <p className="text-sm text-amber-800/80 leading-relaxed">
                  Adding a caregiver allows them to receive SMS or Email alerts if you miss critical doses. They will see your medication list and adherence score. You can revoke access at any time by removing them from this list.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
