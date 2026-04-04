"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/Sidebar"
import { Merriweather, Plus_Jakarta_Sans } from "next/font/google"
import { getProfile, updateProfile, getRiskLevel, getPatientDoctors } from "@/lib/api/routes"
import { 
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendTestPushNotification,
  getPushStatus,
  getNotificationPermission,
} from "@/lib/push-notifications"
import { 
  X,
  User, 
  Mail, 
  Phone, 
  Globe, 
  Shield, 
  Loader2, 
  Save, 
  CheckCircle2,
  AlertCircle,
  Settings,
  Edit2,
  Clock,
  Bell,
  BellOff,
  BellRing,
  Zap,
  ArrowRight,
  ShieldCheck,
  Stethoscope
} from "lucide-react"

const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'] });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [risk, setRisk] = useState<any>(null)
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
  // Push notification state
  const [pushSubscribed, setPushSubscribed] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [pushLoading, setPushLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [pushStatus, setPushStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    timezone: "Asia/Kolkata"
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
           fetchProfile()
           checkPushStatus()
        }
      }
    }
  }, [router])

  const checkPushStatus = async () => {
    const perm = getNotificationPermission()
    setPushPermission(perm)
    if (perm === 'granted') {
      const subscribed = await getPushStatus()
      setPushSubscribed(subscribed)
    }
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const [profileRes, riskRes, docsRes] = await Promise.all([
        getProfile(),
        getRiskLevel().catch(() => null),
        getPatientDoctors().catch(() => null)
      ])
      
      if (profileRes.success) {
        const u = profileRes.data
        setUser(u)
        setFormData({
          name: u.name || "",
          phone: u.phone || "",
          timezone: u.timezone || "Asia/Kolkata"
        })
      }
      if (riskRes?.success) setRisk(riskRes.data)
      if (docsRes?.success) setDoctors(docsRes.data)
    } catch (err) {
      console.error("Clinical profile sync error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await updateProfile(formData)
      if (res.success) {
        setStatus({ type: 'success', message: "Identity synchronized with health records" })
        setUser(res.data)
        setIsEditDialogOpen(false)
        setTimeout(() => setStatus(null), 5000)
      }
    } catch (err) {
      setStatus({ type: 'error', message: "Operational update error" })
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePush = async () => {
    setPushLoading(true)
    setPushStatus(null)
    try {
      if (pushSubscribed) {
        const ok = await unsubscribeFromPushNotifications()
        setPushSubscribed(false)
        setPushStatus({ type: ok ? 'success' : 'error', message: ok ? 'Reminders suspended.' : 'Internal service error.' })
      } else {
        const result = await subscribeToPushNotifications()
        setPushPermission(result.permission)
        setPushSubscribed(result.success)
        setPushStatus({ type: result.success ? 'success' : 'error', message: result.message })
      }
    } finally {
      setPushLoading(false)
      setTimeout(() => setPushStatus(null), 5000)
    }
  }

  const handleTestNotification = async () => {
    setTestLoading(true)
    const result = await sendTestPushNotification()
    setPushStatus({ type: result.success ? 'success' : 'error', message: result.message })
    setTestLoading(false)
    setTimeout(() => setPushStatus(null), 5000)
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
      
      <Sidebar user={user} riskLevel={risk?.riskLevel} />

      <main className="ml-72 flex-1 p-10 max-w-[1400px] w-full">
        
        {/* Professional Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className={`${merriweather.className} text-4xl font-black text-[#008080] mb-2`}>
               Account Profile
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[11px] tracking-[2px]">
               Managed Medical Identity & Notification Preferences
            </p>
          </div>
          <button 
             onClick={() => setIsEditDialogOpen(true)}
             className="bg-[#008080] text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-2 shadow-xl shadow-[#008080]/15 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
          >
             <Edit2 size={18} />
             MODIFY IDENTITY
          </button>
        </div>

        {status && (
          <div className={`mb-10 p-6 rounded-[2rem] flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 border shadow-lg ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
             {status.type === 'success' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <AlertCircle size={24} className="text-red-500" />}
             <span className="text-sm font-black uppercase tracking-tight">{status.message}</span>
             <button onClick={() => setStatus(null)} className="ml-auto p-1.5 hover:bg-black/5 rounded-full transition-colors">
                <X size={20} />
             </button>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-12">
           
           {/* Left Column: Clinical Avatar Hub */}
           <div className="lg:col-span-4 space-y-10">
              <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 translate-x-1/2 -translate-y-1/2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShieldCheck size={120} className="text-[#008080]" />
                 </div>
                 <div className="relative mb-8">
                   <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl ring-4 ring-[#e6f2f2] group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                      <img 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover bg-white" 
                      />
                   </div>
                   <div className="absolute -bottom-2 -right-2 p-3 bg-[#008080] rounded-2xl shadow-xl text-white transform group-hover:rotate-12 transition-transform">
                      <Shield size={24} />
                   </div>
                 </div>
                 
                 <h3 className={`${merriweather.className} text-3xl font-bold text-[#1a2233]`}>{user?.name}</h3>
                 <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] font-black text-[#008080] bg-[#e6f2f2] px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#008080]/10">
                       VERIFIED {user?.role.toUpperCase()}
                    </span>
                 </div>

                 <div className="w-full mt-10 space-y-3">
                    <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 space-y-4 text-left">
                       <div className="flex items-center gap-4">
                          <Mail size={18} className="text-[#008080]" />
                          <span className="text-sm font-black text-gray-500 truncate">{user?.email}</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <Phone size={18} className="text-[#008080]" />
                          <span className="text-sm font-black text-gray-500">{user?.phone || 'Not Connected'}</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <Clock size={18} className="text-[#008080]" />
                          <span className="text-sm font-black text-gray-500">{user?.timezone || 'GMT Standard'}</span>
                       </div>
                    </div>
                 </div>

                 <div className="w-full mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 gap-6">
                    <div className="text-left">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Global Adherence</p>
                       <p className="text-3xl font-black text-[#008080]">{user?.adherenceScore || '--'}%</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Risk Status</p>
                       <p className={`text-xl font-black ${(risk?.riskLevel || '').toLowerCase() === 'low' ? 'text-green-500' : 'text-amber-500'}`}>
                          {(risk?.riskLevel || '--').toUpperCase()}
                       </p>
                    </div>
                 </div>
              </div>

              <div className="bg-[#1a2233] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute right-0 top-0 w-32 h-32 bg-[#008080] opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                 <h4 className="text-[10px] font-black mb-4 uppercase tracking-widest text-[#008080]">Security Protocol</h4>
                 <p className="text-sm font-bold leading-relaxed text-white/60">
                   Your clinical data is protected by end-to-end encryption. Modifications to core identity require administrator verification for high-risk regimens.
                 </p>
              </div>
           </div>

           {/* Right Column: Detailed Hub & Tools */}
           <div className="lg:col-span-8 space-y-10">
              {/* Profile Details */}
              <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-gray-100">
                 <h3 className={`${merriweather.className} text-2xl font-bold mb-10 flex items-center gap-3 text-[#1a2233]`}>
                    <div className="w-1.5 h-10 bg-[#008080] rounded-full"></div>
                    Registry Details
                 </h3>

                 <div className="grid gap-12 md:grid-cols-2">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Identity</p>
                       <p className="text-xl font-black text-[#1a2233]">{user?.name}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Communication Channel</p>
                       <p className="text-xl font-black text-[#1a2233]">{user?.email}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Phone Interface</p>
                       <p className="text-xl font-black text-[#1a2233]">{user?.phone || 'Awaiting synchronization'}</p>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Temporal Domain</p>
                       <p className="text-xl font-black text-[#1a2233]">{user?.timezone}</p>
                    </div>
                    <div className="md:col-span-2 pt-8 border-t border-gray-50 flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Hub Identifier</p>
                          <p className="text-xs font-mono text-gray-300 font-bold tracking-widest">{user?.id || 'NODE-SIG-ALPHA-01'}</p>
                       </div>
                       <CheckCircle2 size={32} className="text-green-500 opacity-20" />
                    </div>
                 </div>
              </div>

              {/* Connected Clinical Network */}
              <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-gray-100">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className={`${merriweather.className} text-2xl font-bold flex items-center gap-3 text-[#1a2233]`}>
                       <div className="w-1.5 h-10 bg-emerald-400 rounded-full"></div>
                       Assigned Clinicians
                    </h3>
                    <span className="text-[10px] font-black bg-[#e6f2f2] text-[#008080] px-4 py-2 rounded-full uppercase tracking-widest">Active Supervision</span>
                 </div>
                 
                 {doctors.length === 0 ? (
                   <div className="py-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                      <p className="text-sm font-black text-gray-400">No clinical peers yet established in your network.</p>
                   </div>
                 ) : (
                   <div className="grid gap-6 md:grid-cols-2">
                      {doctors.map((doc) => (
                        <div key={doc._id} className="p-8 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 flex flex-col gap-4 group hover:bg-white hover:shadow-xl hover:border-[#008080]/10 transition-all cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl bg-[#e6f2f2] text-[#008080] flex items-center justify-center group-hover:bg-[#008080] group-hover:text-white transition-all">
                               <Stethoscope size={24} />
                            </div>
                            <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">Verified</span>
                          </div>
                          <div>
                             <h4 className="font-black text-[#1a2233] text-lg">Dr. {doc.name}</h4>
                             <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 tracking-widest">{doc.specialization || "Clinical Hub Supervisor"}</p>
                             <p className="text-xs font-bold text-[#008080] mt-3 break-all">{doc.email}</p>
                          </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>

              {/* Notification Management Panel */}
              <div className="bg-white rounded-[3.5rem] p-10 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <h3 className={`${merriweather.className} text-2xl font-bold flex items-center gap-3 text-[#1a2233]`}>
                        <div className="w-1.5 h-10 bg-indigo-500 rounded-full"></div>
                        Alert Protocols
                      </h3>
                      <p className="text-xs font-bold text-gray-400 mt-2 ml-5">Synchronize medication reminders across authorized devices.</p>
                   </div>
                </div>

                {pushPermission === 'denied' && (
                  <div className="mb-8 p-6 rounded-[2rem] bg-red-50 border border-red-100 flex items-start gap-5">
                    <div className="p-3 bg-red-100 rounded-2xl text-red-500 mt-0.5 shadow-sm"><BellOff size={24} /></div>
                    <div>
                      <p className="font-black text-red-700 text-sm uppercase tracking-tight">Signal Interrupted</p>
                      <p className="text-xs font-bold text-red-600/70 mt-1 leading-relaxed">
                        Authorized notification signal blocked. Please reset site permissions in your browser interface to enable critical adherence alerts.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 gap-8">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${pushSubscribed ? 'bg-[#e6f2f2] text-[#008080] shadow-sm shadow-[#008080]/10' : 'bg-gray-200 text-white'}`}>
                      {pushSubscribed ? <BellRing size={32} /> : <BellOff size={32} />}
                    </div>
                    <div>
                      <p className="font-black text-[#1a2233] text-lg">
                        {pushSubscribed ? 'Real-Time Reminders Active' : 'Adherence Signal Disabled'}
                      </p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">
                        {pushSubscribed ? 'Alerts synchronized with clinical intake regimen' : 'Enable to activate clinical escalation protocol'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleTogglePush}
                    disabled={pushLoading || pushPermission === 'denied' || pushPermission === 'unsupported'}
                    className={`relative w-20 h-10 rounded-full transition-all duration-500 shadow-inner flex items-center px-1 disabled:opacity-40 disabled:cursor-not-allowed ${
                      pushSubscribed ? 'bg-[#008080]' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 bg-white rounded-full shadow-xl transform transition-transform duration-500 flex items-center justify-center ${
                      pushSubscribed ? 'translate-x-10' : 'translate-x-0'
                    }`}>
                       {pushLoading && <Loader2 size={14} className="text-[#008080] animate-spin" />}
                    </div>
                  </button>
                </div>

                {pushSubscribed && (
                  <button
                    onClick={handleTestNotification}
                    disabled={testLoading}
                    className="mt-6 w-full flex items-center justify-center gap-3 py-6 bg-white rounded-[2rem] border-2 border-dashed border-indigo-100 text-[#008080] font-black text-xs uppercase tracking-widest hover:bg-[#e6f2f2] hover:border-[#008080]/20 transition-all disabled:opacity-50"
                  >
                    {testLoading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                    {testLoading ? 'TRANSMITTING SIGNAL...' : 'DISPATCH TEST ADHERENCE ALERT'}
                  </button>
                )}
              </div>
           </div>
        </div>

        {/* Identity Modification Overlay */}
        {isEditDialogOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-8 animate-in fade-in duration-500">
             <div className="w-full max-w-xl bg-white rounded-[3.5rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500">
                 <div className="p-10 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <div>
                       <h3 className={`${merriweather.className} text-3xl font-bold text-[#008080]`}>Update Registry</h3>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Personnel Record Modification</p>
                    </div>
                    <button onClick={() => setIsEditDialogOpen(false)} className="p-3 bg-white text-gray-300 hover:text-red-500 rounded-2xl shadow-sm transition-all"><X size={24} /></button>
                 </div>
                 
                 <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-[#008080] uppercase tracking-widest">Clinical Designation</label>
                       <div className="relative">
                          <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <input 
                            required
                            className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Interface Email (Locked)</label>
                       <div className="relative opacity-60">
                          <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <input disabled className="w-full h-16 bg-gray-100 border border-gray-100 rounded-2xl pl-14 pr-6 text-sm font-black cursor-not-allowed" value={user?.email} />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-[#008080] uppercase tracking-widest">Protocol Phone Number</label>
                       <div className="relative">
                          <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <input 
                            className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-[#008080] uppercase tracking-widest">Sync Timezone</label>
                       <div className="relative">
                          <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <select 
                            className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-10 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#008080] appearance-none"
                            value={formData.timezone}
                            onChange={e => setFormData({...formData, timezone: e.target.value})}
                          >
                             <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                             <option value="UTC">Universal Time Cluster (UTC)</option>
                          </select>
                       </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                       <button type="button" onClick={() => setIsEditDialogOpen(false)} className="flex-1 h-16 bg-gray-100 text-gray-400 font-black rounded-2xl text-[10px] uppercase tracking-widest">Abort</button>
                       <button 
                         type="submit"
                         disabled={saving}
                         className="flex-[2] h-16 bg-[#008080] text-white font-black rounded-2xl shadow-xl shadow-[#008080]/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                       >
                         {saving ? <Loader2 className="animate-spin" /> : <span>FINALIZE RECORD</span>}
                         {!saving && <ArrowRight size={18} />}
                       </button>
                    </div>
                 </form>
             </div>
          </div>
        )}
      </main>
    </div>
  )
}
