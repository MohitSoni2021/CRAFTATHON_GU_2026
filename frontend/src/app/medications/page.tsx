'use client';

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
import Navbar from '@/components/Navbar';
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
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

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
      if (!encryptedUser) {
        router.push("/login")
      } else {
        const decryptedUser = decryptData(encryptedUser)
        setUser(decryptedUser)
        fetchData();
      }
    }
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medsRes, riskRes] = await Promise.all([
        listMedications(),
        getRiskLevel()
      ]);
      if (medsRes.success) setMedications(medsRes.data);
      if (riskRes.success) setRisk(riskRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error connecting to server');
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
      setError(err.response?.data?.message || 'Failed to create medication');
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
      setError(err.response?.data?.message || 'Failed to update medication');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this medication?')) return;
    try {
      setLoading(true);
      const response = await deactivateMedication(id);
      if (response.success) {
        fetchData();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate medication');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (med: MedicationResponse) => {
    setEditingId(med.id);
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
    <div className={`min-h-screen bg-[#f8faff] text-[#2b3654] ${jakarta.className}`}>
      
      <Navbar user={user} riskLevel={risk?.riskLevel} />

      <div className="w-full mx-auto p-6 md:p-10 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2b3654]">Medicine Cabinet</h1>
            <p className="text-[#7b8ea6]">Manage your active medications and reminders</p>
          </div>
          
          <Button 
            onClick={() => { setIsAdding(true); resetForm(); }}
            className="bg-[#3bbdbf] hover:bg-[#2b7a8c] text-white rounded-xl px-6 py-6 h-auto shadow-lg shadow-[#3bbdbf]/20"
          >
            <Plus className="mr-2" size={20} />
            Add Medication
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <p className="font-medium text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto opacity-50 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        )}

        {/* List Section */}
        {loading && medications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#3bbdbf] mb-4" size={40} />
            <p className="text-[#7b8ea6] font-medium">Scanning medicine records...</p>
          </div>
        ) : medications.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] py-24 flex flex-col items-center justify-center text-center">
            <div className="bg-[#e6fcfa] p-6 rounded-[2rem] mb-6 text-[#3bbdbf]">
              <Activity size={48} />
            </div>
            <h3 className="text-2xl font-bold text-[#2b3654] mb-2">No Medications Linked</h3>
            <p className="text-[#7b8ea6] max-w-sm mb-8">
              Start adding your daily medications to generate smart alerts and track your health metrics.
            </p>
            <Button onClick={() => setIsAdding(true)} className="bg-[#3bbdbf] hover:bg-[#2b7a8c] text-white rounded-xl">
              <Plus size={20} className="mr-2" /> Add medication
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map((med) => (
              <Card 
                key={`med-card-${med.id || med.name}`} 
                className={`bg-white border-gray-100 shadow-sm rounded-3xl group hover:shadow-md transition-all duration-300 ${!med.isActive ? 'opacity-60 grayscale' : ''}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="bg-[#f0f4ff] p-3 rounded-2xl mb-4 group-hover:scale-110 transition-transform text-[#4a7ae6]">
                      <Activity size={24} />
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#2b3654]" onClick={() => startEdit(med)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => handleDeactivate(med.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-[#2b3654] group-hover:text-[#3bbdbf] transition-colors">
                    {med.name}
                  </CardTitle>
                  <CardDescription className="text-gray-500 font-medium">
                    {med.dosage} {med.unit} • {med.frequency.charAt(0).toUpperCase() + med.frequency.slice(1)}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {med.scheduleTimes.map((time, i) => (
                      <div key={`${med.id}-time-${i}`} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">
                        <Clock size={12} className="text-[#3bbdbf]" />
                        {time}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                    <Calendar size={12} />
                    Started {format(new Date(med.startDate), 'MMM dd, yyyy')}
                  </div>

                  {med.notes && (
                    <div className="bg-[#f8faff] rounded-2xl p-4 text-sm text-[#7b8ea6] border border-gray-100 italic">
                      "{med.notes}"
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2">
                   <div className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 text-green-600">
                         <CheckCircle2 size={14} />
                         Synced
                      </span>
                      {med.isActive && (
                        <div className="h-2 w-2 rounded-full bg-[#3bbdbf] shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      )}
                   </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog/Overlay */}
      {isAdding && (
        <div className="fixed inset-0 bg-[#2b3654]/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-lg bg-white border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in-95">
            <form onSubmit={editingId ? handleUpdate : handleCreate}>
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-[#2b3654]">
                  {editingId ? 'Edit Medication' : 'Add Medication'}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} type="button" className="rounded-full hover:bg-gray-50">
                  <X size={24} className="text-gray-400" />
                </Button>
              </div>
              
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-bold text-[#2b3654]">Medication Name</label>
                      <Input 
                        required
                        placeholder="e.g. Paracetamol"
                        className="rounded-xl border-gray-100 focus:border-[#3bbdbf] focus:ring-[#3bbdbf]"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#2b3654]">Dosage</label>
                      <Input 
                        required
                        type="number"
                        placeholder="500"
                        className="rounded-xl border-gray-100"
                        value={formData.dosage}
                        onChange={e => setFormData({...formData, dosage: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#2b3654]">Unit</label>
                      <Input 
                        required
                        placeholder="mg"
                        className="rounded-xl border-gray-100"
                        value={formData.unit}
                        onChange={e => setFormData({...formData, unit: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-[#2b3654]">Schedule Times</label>
                    {formData.scheduleTimes?.map((time, idx) => (
                      <div key={`form-time-slot-${idx}`} className="flex gap-2 animate-in slide-in-from-left-2">
                        <Input 
                          type="time"
                          className="rounded-xl border-gray-100"
                          value={time}
                          onChange={e => {
                            const newTimes = [...(formData.scheduleTimes || [])];
                            newTimes[idx] = e.target.value;
                            setFormData({...formData, scheduleTimes: newTimes});
                          }}
                        />
                        {idx > 0 && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setFormData({...formData, scheduleTimes: formData.scheduleTimes?.filter((_, i) => i !== idx)})}
                            className="text-red-400 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 size={20} />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button 
                      variant="ghost" 
                      onClick={() => setFormData({...formData, scheduleTimes: [...(formData.scheduleTimes || []), '08:00']})}
                      type="button"
                      className="w-full border-2 border-dashed border-gray-100 rounded-xl text-[#3bbdbf] font-bold py-6"
                    >
                      + Add another slot
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#2b3654]">Clinical Notes</label>
                    <textarea 
                      className="w-full bg-[#f8faff] border border-gray-100 rounded-2xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3bbdbf] min-h-[100px]"
                      placeholder="Take after breakfast..."
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-gray-50 bg-[#fefdfd] flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl py-6 font-bold text-gray-500"
                  onClick={() => setIsAdding(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-[#2b3654] hover:bg-[#1E2A4F] text-white rounded-xl py-6 font-bold shadow-xl shadow-[#2b3654]/10"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Save Medication'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
