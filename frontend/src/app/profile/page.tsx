"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { decryptData } from "@/lib/crypto"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import { getProfile, updateProfile, getRiskLevel } from "@/lib/api/routes"
import { 
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  sendTestPushNotification,
  getPushStatus,
  getNotificationPermission,
} from "@/lib/push-notifications"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { 
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
} from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [risk, setRisk] = useState<any>(null)
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
      if (!encryptedUser) {
        router.push("/login")
      } else {
        const decryptedUser = decryptData(encryptedUser)
        setUser(decryptedUser)
        fetchProfile()
        checkPushStatus()
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
      const [profileRes, riskRes] = await Promise.all([
        getProfile(),
        getRiskLevel()
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
      if (riskRes.success) setRisk(riskRes.data)
    } catch (err) {
      console.error("Profile fetch error:", err)
      setStatus({ type: 'error', message: "Failed to load profile data" })
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
        setStatus({ type: 'success', message: "Profile synchronized with health records" })
        setUser(res.data)
        setIsEditDialogOpen(false)
        setTimeout(() => setStatus(null), 5000)
      }
    } catch (err) {
      setStatus({ type: 'error', message: "Update synchronization failed" })
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
        setPushStatus({ type: ok ? 'success' : 'error', message: ok ? 'Notifications disabled.' : 'Failed to disable notifications.' })
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
      <div className="flex h-screen items-center justify-center bg-[#f8faff]">
        <Loader2 size={40} className="text-[#3bbdbf] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#2b3654]">
      <Navbar user={user} riskLevel={risk?.riskLevel} />

      <div className="max-w-4xl mx-auto p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                <User size={24} className="text-[#3bbdbf]" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#2b3654]">Clinical Profile</h1>
                <p className="text-gray-400 font-medium text-sm">Managed medical identity and credentials</p>
              </div>
           </div>

           <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
             <DialogTrigger asChild>
                <Button className="bg-[#3bbdbf] hover:bg-[#2fa9ab] text-white font-bold rounded-2xl px-6 py-6 shadow-lg shadow-[#3bbdbf]/20 transition-all active:scale-95 group">
                   <Edit2 size={18} className="mr-2 group-hover:rotate-12 transition-transform" />
                   Update Profile
                </Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] p-8 border-none shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-[#2b3654] flex items-center gap-3">
                     <div className="p-2 bg-[#f0f9fa] text-[#3bbdbf] rounded-xl">
                       <Settings size={20} />
                     </div>
                     Account Update
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                         <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input 
                               type="text"
                               value={formData.name}
                               onChange={(e) => setFormData({...formData, name: e.target.value})}
                               className="w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-100 focus:border-[#3bbdbf] border rounded-2xl focus:ring-0 font-bold text-[#2b3654] outline-none transition-all"
                               placeholder="Clinical name"
                            />
                         </div>
                      </div>

                      <div className="space-y-2 text-gray-400 opacity-60">
                         <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1">Email (Immutable)</label>
                         <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={18} />
                            <input 
                               type="email"
                               value={user?.email}
                               disabled
                               className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold cursor-not-allowed"
                            />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Phone Connectivity</label>
                         <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input 
                               type="text"
                               value={formData.phone}
                               onChange={(e) => setFormData({...formData, phone: e.target.value})}
                               className="w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-100 focus:border-[#3bbdbf] border rounded-2xl focus:ring-0 font-bold text-[#2b3654] outline-none transition-all"
                               placeholder="+91 00000 00000"
                            />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">System Timezone</label>
                         <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <select 
                               value={formData.timezone}
                               onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                               className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 focus:border-[#3bbdbf] rounded-2xl font-bold text-[#2b3654] outline-none appearance-none"
                            >
                               <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                               <option value="UTC">UTC (Standard)</option>
                            </select>
                         </div>
                      </div>
                   </div>

                   <DialogFooter className="gap-3 sm:gap-0 mt-8">
                      <DialogClose asChild>
                         <Button type="button" variant="ghost" className="rounded-xl font-bold text-gray-400">Cancel</Button>
                      </DialogClose>
                      <Button 
                         type="submit" 
                         disabled={saving}
                         className="bg-[#3bbdbf] hover:bg-[#2fa9ab] text-white py-6 rounded-2xl font-bold flex-1"
                      >
                         {saving ? <Loader2 className="animate-spin mr-2" size={20} /> : <Save className="mr-2" size={20} />}
                         Confirm Update
                      </Button>
                   </DialogFooter>
                </form>
             </DialogContent>
           </Dialog>
        </div>

        {status && (
          <div className={`mb-8 p-4 rounded-3xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 border shadow-sm ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-red-500" />}
            <span className="text-sm font-bold">{status.message}</span>
            <button onClick={() => setStatus(null)} className="ml-auto p-1 hover:bg-black/5 rounded-full ring-offset-background transition-colors">✕</button>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          {/* Left Column: Avatar Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-4xl p-8 shadow-xl shadow-gray-200/40 border border-gray-50 flex flex-col items-center text-center">
              <div className="relative">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} 
                  alt="Avatar" 
                  className="w-32 h-32 rounded-full border-4 border-[#f0f9fa] shadow-inner object-cover bg-white" 
                />
                <div className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-lg border border-gray-100 text-[#3bbdbf]">
                   <Shield size={20} />
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-2xl font-black text-[#2b3654]">{user?.name}</h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                   <span className="text-[10px] font-black text-[#3bbdbf] bg-[#f0f9fa] px-3 py-1 rounded-full uppercase tracking-widest border border-[#e6fcfa]">
                      Verified {user?.role}
                   </span>
                </div>
              </div>

              <div className="w-full mt-10 space-y-4 text-left">
                 <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 space-y-3">
                    <div className="flex items-center gap-3">
                       <Mail size={16} className="text-gray-400" />
                       <span className="text-sm font-bold text-[#2b3654] truncate">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Phone size={16} className="text-gray-400" />
                       <span className="text-sm font-bold text-[#2b3654]">{user?.phone || '+91 Not Set'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Clock size={16} className="text-gray-400" />
                       <span className="text-sm font-bold text-[#2b3654]">{user?.timezone || 'Region Neutral'}</span>
                    </div>
                 </div>
              </div>

              <div className="w-full mt-6 pt-6 border-t border-gray-50 grid grid-cols-2 gap-4">
                 <div className="text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Health Score</p>
                    <p className="text-xl font-black text-emerald-500">{user?.adherenceScore || '--'}%</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Risk Rank</p>
                    <p className={`text-xl font-black ${
                      (risk?.riskLevel === 'low' || risk?.riskLevel === 'safe') ? 'text-green-500' : 'text-amber-500'
                    }`}>{(risk?.riskLevel || '--').toUpperCase()}</p>
                 </div>
              </div>
            </div>

            <div className="bg-linear-to-br from-[#1E2A4F] to-[#2b3654] rounded-4xl p-8 text-white shadow-xl relative overflow-hidden group">
               <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
               <h4 className="text-sm font-bold mb-4 opacity-70">Clinical Identity</h4>
               <p className="text-xs leading-relaxed text-gray-400 font-medium">
                 Your identity is anchored to your medical blockchain. Only authorized healthcare professionals can view sensitive logs.
               </p>
            </div>
          </div>

          {/* Right Column: Details + Notifications */}
          <div className="md:col-span-2 space-y-8">
             {/* Credential Overview */}
             <div className="bg-white rounded-4xl p-10 shadow-xl shadow-gray-200/30 border border-gray-50">
                <h3 className="text-2xl font-black mb-10 flex items-center gap-3 text-[#2b3654]">
                   <span className="w-1.5 h-10 bg-[#3bbdbf] rounded-full"></span>
                   Credential Overview
                </h3>

                <div className="grid gap-10 sm:grid-cols-2">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verified Name</p>
                      <p className="text-lg font-bold text-[#2b3654]">{user?.name}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Communication Alias</p>
                      <p className="text-lg font-bold text-[#2b3654]">{user?.email}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Clinical Phone</p>
                      <p className="text-lg font-bold text-[#2b3654]">{user?.phone || 'Connect phone in settings'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Time Dimension</p>
                      <p className="text-lg font-bold text-[#2b3654]">{user?.timezone}</p>
                   </div>
                   <div className="sm:col-span-2 space-y-1 border-t border-gray-50 pt-8">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Registration Node</p>
                      <p className="text-xs font-mono text-gray-300 uppercase tracking-widest">{user?.id || 'LOCAL-SYNC-001'}</p>
                   </div>
                </div>
             </div>

            {/* ── Push Notification Settings ── */}
            <div className="bg-white rounded-4xl p-10 shadow-xl shadow-gray-200/30 border border-gray-50">
              <h3 className="text-2xl font-black mb-2 flex items-center gap-3 text-[#2b3654]">
                <span className="w-1.5 h-10 bg-violet-400 rounded-full"></span>
                Medication Reminders
              </h3>
              <p className="text-sm text-gray-400 font-medium mb-8 ml-5">
                Receive push notifications even when MedTrack is closed
              </p>

              {/* Permission Denied Warning */}
              {pushPermission === 'denied' && (
                <div className="mb-6 p-5 rounded-3xl bg-amber-50 border border-amber-100 flex items-start gap-4">
                  <div className="p-2 bg-amber-100 rounded-xl text-amber-600 mt-0.5">
                    <BellOff size={18} />
                  </div>
                  <div>
                    <p className="font-black text-amber-700 text-sm">Notifications Blocked</p>
                    <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                      Your browser has blocked notifications for this site. Click the 🔒 lock icon in the address bar → Site settings → Notifications → Allow.
                    </p>
                  </div>
                </div>
              )}

              {/* Unsupported */}
              {pushPermission === 'unsupported' && (
                <div className="mb-6 p-5 rounded-3xl bg-gray-50 border border-gray-100 flex items-start gap-4">
                  <div className="p-2 bg-gray-200 rounded-xl text-gray-500 mt-0.5">
                    <BellOff size={18} />
                  </div>
                  <div>
                    <p className="font-black text-gray-600 text-sm">Browser Not Supported</p>
                    <p className="text-xs text-gray-400 mt-1">Push notifications require a modern browser (Chrome, Firefox, Edge).</p>
                  </div>
                </div>
              )}

              {/* Onboarding Callout */}
              {!pushSubscribed && pushPermission !== 'denied' && pushPermission !== 'unsupported' && (
                <div className="mb-6 p-5 rounded-3xl bg-violet-50 border border-violet-100 flex items-start gap-4">
                  <div className="p-2 bg-violet-100 rounded-xl text-violet-600 mt-0.5">
                    <BellRing size={18} />
                  </div>
                  <div>
                    <p className="font-black text-violet-700 text-sm">Stay on track even when MedTrack is closed</p>
                    <p className="text-xs text-violet-500 mt-1">Enable notifications to receive desktop reminders at each medication schedule time.</p>
                  </div>
                </div>
              )}

              {/* Push Status Alert */}
              {pushStatus && (
                <div className={`mb-6 p-4 rounded-3xl flex items-center gap-3 border text-sm font-bold ${
                  pushStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {pushStatus.type === 'success'
                    ? <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                    : <AlertCircle size={16} className="text-red-500 flex-shrink-0" />}
                  {pushStatus.message}
                </div>
              )}

              {/* Toggle Row */}
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${pushSubscribed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                    {pushSubscribed ? <Bell size={20} /> : <BellOff size={20} />}
                  </div>
                  <div>
                    <p className="font-black text-[#2b3654] text-sm">
                      {pushSubscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {pushSubscribed
                        ? 'You will be reminded at each medication time'
                        : 'Enable to receive medication reminders'}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  id="push-toggle"
                  onClick={handleTogglePush}
                  disabled={pushLoading || pushPermission === 'denied' || pushPermission === 'unsupported'}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:opacity-40 disabled:cursor-not-allowed ${
                    pushSubscribed ? 'bg-emerald-400' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
                    pushSubscribed ? 'translate-x-7' : 'translate-x-0'
                  }`} />
                  {pushLoading && (
                    <Loader2 size={14} className="absolute inset-0 m-auto text-white animate-spin" />
                  )}
                </button>
              </div>

              {/* Test Button */}
              {pushSubscribed && (
                <button
                  id="push-test-btn"
                  onClick={handleTestNotification}
                  disabled={testLoading}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-3xl border-2 border-dashed border-violet-200 text-violet-600 font-bold text-sm hover:bg-violet-50 hover:border-violet-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  {testLoading ? 'Sending...' : 'Send Test Notification'}
                </button>
              )}
            </div>

            {/* System Preferences */}
            <div className="bg-[#fcfdfd] border border-dashed border-gray-200 rounded-4xl p-12 text-center flex flex-col items-center justify-center group hover:border-[#3bbdbf] transition-colors cursor-pointer" onClick={() => setIsEditDialogOpen(true)}>
               <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-300 group-hover:text-[#3bbdbf] transition-colors mb-4">
                  <Settings size={32} />
               </div>
               <h4 className="font-bold text-[#2b3654]">System Preferences</h4>
               <p className="text-sm text-gray-400 max-w-xs mt-2">Adjust your medication notification windows and privacy parameters.</p>
               <Button variant="link" className="text-[#3bbdbf] font-bold mt-4">Advanced Configuration →</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
