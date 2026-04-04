"use client"

import { useState, useEffect } from 'react';
import { 
  listMedications, 
  createMedication, 
  updateMedication, 
  deactivateMedication,
  getRiskLevel
} from '@/lib/api/routes';
import { 
  MedicationResponse, 
  CreateMedicationInput, 
  FrequencyType 
} from '@hackgu/shared';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Sidebar from '@/components/Sidebar';
import { decryptData } from "@/lib/crypto";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Clock, 
  Calendar, 
  Activity, 
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { Plus_Jakarta_Sans, Merriweather } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })
const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'] });

export default function MedicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [medications, setMedications] = useState<MedicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [risk, setRisk] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<CreateMedicationInput>>({
    name: '',
    dosage: '',
    unit: 'mg',
    frequency: FrequencyType.DAILY,
    scheduleTimes: ['08:00'],
    startDate: new Date().toISOString(),
    isActive: true,
    notes: ''
  });

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
           fetchData();
        }
      }
    }
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medsRes, riskRes] = await Promise.all([
        listMedications(),
        getRiskLevel().catch(() => null)
      ]);
      if (medsRes.success) setMedications(medsRes.data);
      if (riskRes?.success) setRisk(riskRes.data);
    } catch (err: any) {
      setError('Connection to medication database interrupted.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await createMedication(formData as CreateMedicationInput);
      if (response.success) {
        setIsAdding(false);
        resetForm();
        fetchData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Conflict detected in regimen policy.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      setLoading(true);
      const response = await updateMedication(editingId, formData);
      if (response.success) {
        setEditingId(null);
        setIsAdding(false);
        resetForm();
        fetchData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Update failed. Check clinic logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Proceed with regimen deactivation? History will be preserved.')) return;
    try {
      setLoading(true);
      const response = await deactivateMedication(id);
      if (response.success) {
        fetchData();
      }
    } catch (err: any) {
      setError('Deactivation policy violation.');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (med: MedicationResponse) => {
    setEditingId(med.id || (med as any)._id);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      unit: med.unit,
      frequency: med.frequency,
      scheduleTimes: med.scheduleTimes,
      startDate: med.startDate,
      isActive: med.isActive,
      notes: med.notes
    });
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      unit: 'mg',
      frequency: FrequencyType.DAILY,
      scheduleTimes: ['08:00'],
      startDate: new Date().toISOString(),
      isActive: true,
      notes: ''
    });
    setEditingId(null);
  };

  return (
    <div className={`min-h-screen bg-[#fcfdfd] text-[#1a2233] flex ${jakarta.className}`}>
      
      <Sidebar user={user} riskLevel={risk?.riskLevel} />

      <main className="ml-72 flex-1 p-10 max-w-[1400px] w-full">
        
        {/* Professional Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className={`${merriweather.className} text-4xl font-black text-[#008080] mb-2`}>
               Medicine Cabinet
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[11px] tracking-[2px]">
               Clinical Regimen Management & Scheduling
            </p>
          </div>
          
          <button 
            onClick={() => { setIsAdding(true); resetForm(); }}
            className="bg-[#008080] text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-2 shadow-xl shadow-[#008080]/15 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} />
            REGISTER NEW MEDICATION
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-center gap-4 text-red-600 mb-8 animate-in slide-in-from-top-4">
            <AlertCircle size={22} />
            <p className="font-bold text-sm tracking-tight flex-1">{error}</p>
            <button onClick={() => setError(null)} className="p-1 hover:bg-black/5 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Global Summary Card */}
        <div className="bg-[#008080] p-10 rounded-[3rem] text-white shadow-2xl mb-12 relative overflow-hidden">
           <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="relative z-10 grid grid-cols-12 gap-8 items-center">
              <div className="col-span-12 md:col-span-8">
                 <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-6 border border-white/10">
                    <ShieldCheck size={14} className="text-[#3bbdbf]" />
                    Centralized Cabinet Synchronized
                 </div>
                 <h2 className={`${merriweather.className} text-4xl font-bold mb-4`}>
                    Regimen Integrity Report
                 </h2>
                 <p className="text-white/70 text-lg max-w-xl leading-relaxed mb-0 font-medium">
                    You currently have {medications.length} active clinical pathways registered. Maintaining accurate start dates and dosage units ensures reliable AI insights.
                 </p>
              </div>
              <div className="hidden md:flex col-span-4 justify-end">
                 <div className="w-40 h-40 bg-white/5 rounded-[3rem] flex flex-col items-center justify-center border border-white/10">
                    <span className="text-[10px] font-black uppercase opacity-60 mb-1">Total Active</span>
                    <span className="text-5xl font-black text-white">{medications.filter(m=>m.isActive).length}</span>
                    <span className="text-[10px] font-black uppercase opacity-60 mt-1">Regimens</span>
                 </div>
              </div>
           </div>
        </div>

        {/* List Grid Section */}
        {loading && medications.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <Loader2 className="animate-spin text-[#008080] mb-4" size={48} />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Scanning clinical records...</p>
          </div>
        ) : medications.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] py-32 flex flex-col items-center justify-center text-center">
            <div className="bg-[#e6f2f2] p-8 rounded-[2.5rem] mb-6 text-[#008080] shadow-sm">
              <Plus size={52} strokeWidth={2.5} />
            </div>
            <h3 className={`${merriweather.className} text-2xl font-bold text-[#1a2233] mb-3`}>Cabinet Empty</h3>
            <p className="text-gray-400 font-bold max-w-sm mb-10 leading-relaxed">
              No clinical regimens found. Add your primary medications to begin smart adherence monitoring.
            </p>
            <button 
              onClick={() => setIsAdding(true)} 
              className="bg-[#008080] text-white px-10 py-5 rounded-[2rem] font-black shadow-xl shadow-[#008080]/15 flex items-center gap-2"
            >
              <Plus size={20} /> REGISTER FIRST MEDICATION
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {medications.map((med, i) => (
              <div 
                key={`med-card-${med.id || (med as any)._id || i}`} 
                className={`bg-white border border-gray-100 shadow-sm rounded-[2.5rem] p-8 group hover:shadow-xl hover:border-[#008080]/20 transition-all duration-500 relative overflow-hidden flex flex-col ${!med.isActive ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="flex justify-between items-start mb-6">
                    <div className="bg-[#e6f2f2] p-4 rounded-2xl text-[#008080] group-hover:bg-[#008080] group-hover:text-white transition-all duration-500 transform group-hover:rotate-12 shadow-sm">
                      <Activity size={28} />
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => startEdit(med)} className="p-2.5 rounded-xl hover:bg-[#e6f2f2] text-gray-400 hover:text-[#008080] transition-colors shadow-xs">
                          <Pencil size={18} />
                       </button>
                       <button onClick={() => handleDeactivate(med.id || (med as any)._id)} className="p-2.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shadow-xs">
                          <Trash2 size={18} />
                       </button>
                    </div>
                </div>

                <h3 className={`${merriweather.className} text-xl font-bold text-[#1a2233] group-hover:text-[#008080] transition-colors mb-2`}>
                   {med.name}
                </h3>
                <div className="flex items-center gap-2 mb-6">
                   <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-gray-50 text-gray-400 rounded-lg tracking-widest border border-gray-100">
                      {med.dosage} {med.unit}
                   </span>
                   <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-[#e6f2f2] text-[#008080] rounded-lg tracking-widest border border-[#008080]/10">
                      {med.frequency}
                   </span>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                   <div className="flex flex-wrap gap-2">
                      {med.scheduleTimes.map((time, i) => (
                        <div key={`${med.id}-time-${i}`} className="flex items-center gap-1.5 bg-[#fcfdfd] border border-gray-100 text-gray-500 text-[10px] font-black px-4 py-2 rounded-xl group-hover:bg-[#e6f2f2] transition-colors">
                           <Clock size={12} className="text-[#008080]" />
                           {time}
                        </div>
                      ))}
                   </div>
                   
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-2">
                      <Calendar size={12} />
                      PATHWAY INITIATED {format(new Date(med.startDate), 'dd MMM yyyy')}
                   </p>

                   {med.notes && (
                      <div className="bg-gray-50 rounded-2xl p-4 text-[11px] font-bold text-gray-500 border border-gray-100 italic leading-relaxed">
                         "{med.notes}"
                      </div>
                   )}
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                   <span className="flex items-center gap-2 text-[10px] font-black text-[#008080] uppercase tracking-[1px]">
                      <CheckCircle2 size={16} /> Regimen Valid
                   </span>
                   {med.isActive && <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/20"></div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modern High-End Overlay Form */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-8 animate-in fade-in duration-500">
          <div className="w-full max-w-2xl bg-white rounded-[3.5rem] shadow-3xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
            <form onSubmit={editingId ? handleUpdate : handleCreate}>
              <div className="p-10 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div>
                   <h3 className={`${merriweather.className} text-3xl font-bold text-[#008080]`}>
                     {editingId ? 'Edit Regimen' : 'Register Med'}
                   </h3>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configure Clinical Schedule</p>
                </div>
                <button type="button" onClick={() => setIsAdding(false)} className="bg-white p-3 rounded-2xl text-gray-400 hover:text-red-500 hover:rotate-90 transition-all shadow-sm">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-10 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-12 gap-8">
                     <div className="col-span-12 space-y-3">
                        <label className="text-[11px] font-black text-[#008080] uppercase tracking-widest">Medication Clinical Name</label>
                        <input 
                          required
                          placeholder="e.g. Meta-Metoprolol"
                          className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#008080] focus:bg-white transition-all"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                     </div>
                     <div className="col-span-6 space-y-3">
                        <label className="text-[11px] font-black text-[#008080] uppercase tracking-widest">Dosage Amount</label>
                        <input 
                          required
                          type="number"
                          placeholder="500"
                          className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#008080]"
                          value={formData.dosage}
                          onChange={e => setFormData({...formData, dosage: e.target.value})}
                        />
                     </div>
                     <div className="col-span-6 space-y-3">
                        <label className="text-[11px] font-black text-[#008080] uppercase tracking-widest">Clinical Unit</label>
                        <input 
                          required
                          placeholder="mg / ml"
                          className="w-full h-16 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#008080]"
                          value={formData.unit}
                          onChange={e => setFormData({...formData, unit: e.target.value})}
                        />
                     </div>
                     <div className="col-span-12 space-y-3">
                        <label className="text-[11px] font-black text-[#008080] uppercase tracking-widest">Dispatch Frequency</label>
                        <div className="grid grid-cols-4 gap-3">
                           {[FrequencyType.DAILY, FrequencyType.WEEKLY, FrequencyType.MONTHLY, FrequencyType.CUSTOM].map(f => (
                              <button
                                key={f}
                                type="button"
                                onClick={() => setFormData({...formData, frequency: f})}
                                className={`h-14 rounded-2xl border text-[10px] font-black uppercase tracking-tighter transition-all ${
                                   formData.frequency === f 
                                   ? 'bg-[#008080] border-[#008080] text-white shadow-lg' 
                                   : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
                                }`}
                              >
                                {f}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-[#008080] uppercase tracking-widest">Intake Time Slots</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.scheduleTimes?.map((time, idx) => (
                        <div key={`form-time-${idx}`} className="flex gap-3 group">
                          <input 
                            type="time"
                            className="flex-1 h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#008080]"
                            value={time}
                            onChange={e => {
                              const newTimes = [...(formData.scheduleTimes || [])];
                              newTimes[idx] = e.target.value;
                              setFormData({...formData, scheduleTimes: newTimes});
                            }}
                          />
                          {idx > 0 && (
                            <button 
                              onClick={() => setFormData({...formData, scheduleTimes: formData.scheduleTimes?.filter((_, i) => i !== idx)})}
                              className="w-14 h-14 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-sm"
                              type="button"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => setFormData({...formData, scheduleTimes: [...(formData.scheduleTimes || []), '08:00']})}
                      type="button"
                      className="w-full h-16 border-2 border-dashed border-gray-100 rounded-[1.5rem] text-[#008080] font-black text-[11px] uppercase tracking-widest hover:bg-[#e6f2f2] hover:border-[#008080]/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={18} /> ADD CLINICAL TIME SLOT
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-[#008080] uppercase tracking-widest">Therapeutic Notes</label>
                    <textarea 
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008080] min-h-[120px] transition-all"
                      placeholder="Special instructions for clinical adherence..."
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
              </div>

              <div className="p-10 bg-gray-50 flex gap-6">
                <button 
                  onClick={() => setIsAdding(false)}
                  type="button"
                  className="flex-1 h-16 bg-white border border-gray-100 text-gray-400 font-black rounded-2xl hover:bg-white/80 transition-all text-xs uppercase tracking-widest"
                >
                  ABORT
                </button>
                <button 
                  disabled={loading}
                  type="submit"
                  className="flex-1 h-16 bg-[#008080] text-white font-black rounded-2xl shadow-xl shadow-[#008080]/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <span>FINALIZE REGIMEN</span>}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
