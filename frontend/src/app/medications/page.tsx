'use client';

import { useState, useEffect } from 'react';
import { 
  listMedications, 
  createMedication, 
  updateMedication, 
  deactivateMedication 
} from '@/lib/api/routes';
import { 
  MedicationResponse, 
  CreateMedicationInput, 
  FrequencyType 
} from '@hackgu/shared';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Clock, 
  Calendar, 
  Activity, 
  ArrowLeft,
  Loader2,
  X,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function MedicationsPage() {
  const [medications, setMedications] = useState<MedicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
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
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await listMedications();
      if (response.success) {
        setMedications(response.data);
      } else {
        setError(response.message || 'Failed to fetch medications');
      }
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
        fetchMedications();
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
        resetForm();
        fetchMedications();
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
        fetchMedications();
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

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      scheduleTimes: [...(prev.scheduleTimes || []), '12:00']
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      scheduleTimes: prev.scheduleTimes?.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-zinc-500 hover:text-white flex items-center gap-2 mb-2 transition-colors">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              My Medications
            </h1>
            <p className="text-zinc-400">Manage your medication schedule and reminders</p>
          </div>
          
          <Button 
            onClick={() => { setIsAdding(true); resetForm(); }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-6 h-auto transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus className="mr-2" size={20} />
            Add Medication
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle size={20} />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Add/Edit Form Overlay */}
        {isAdding && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-lg bg-zinc-900 border-zinc-800 shadow-2xl animate-in zoom-in-95 duration-300">
              <form onSubmit={editingId ? handleUpdate : handleCreate}>
                <CardHeader className="border-b border-zinc-800 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-white">
                      {editingId ? 'Edit Medication' : 'Add New Medication'}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} type="button" className="text-zinc-500 hover:text-white">
                      <X size={20} />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm text-zinc-400">Medication Name</label>
                      <Input 
                        required
                        placeholder="e.g. Metformin"
                        className="bg-zinc-800 border-zinc-700 text-white"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Dosage</label>
                      <Input 
                        required
                        type="number"
                        placeholder="e.g. 500"
                        className="bg-zinc-800 border-zinc-700 text-white"
                        value={formData.dosage}
                        onChange={e => setFormData({...formData, dosage: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-zinc-400">Unit</label>
                      <Input 
                        required
                        placeholder="e.g. mg"
                        className="bg-zinc-800 border-zinc-700 text-white"
                        value={formData.unit}
                        onChange={e => setFormData({...formData, unit: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Schedule Times</label>
                    <div className="space-y-2">
                      {formData.scheduleTimes?.map((time, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input 
                            type="time"
                            className="bg-zinc-800 border-zinc-700 text-white"
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
                              type="button"
                              onClick={() => removeTimeSlot(idx)}
                              className="text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 size={18} />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        type="button"
                        onClick={addTimeSlot}
                        className="text-blue-400 hover:bg-blue-400/10 flex items-center gap-2"
                      >
                        <Plus size={14} /> Add Another Time
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Notes (Optional)</label>
                    <textarea 
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                      placeholder="Take after food..."
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </CardContent>

                <CardFooter className="border-t border-zinc-800 pt-4 flex gap-3">
                  <Button 
                    variant="ghost" 
                    className="flex-1 text-zinc-300 hover:bg-zinc-800"
                    onClick={() => setIsAdding(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (editingId ? 'Save Changes' : 'Create')}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}

        {/* Medications List */}
        {loading && medications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <p className="text-zinc-500 animate-pulse">Scanning your medicine cabinet...</p>
          </div>
        ) : medications.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 border-dashed border-2 py-24 flex flex-col items-center justify-center text-center">
            <div className="bg-blue-500/10 p-6 rounded-full mb-6">
              <Activity className="text-blue-500" size={48} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No Medications Found</h3>
            <p className="text-zinc-500 max-w-sm mb-8">
              Start adding your medications to receive real-time reminders and track your adherence score.
            </p>
            <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus size={20} className="mr-2" /> Add Your First One
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map((med) => (
              <Card 
                key={med.id} 
                className={`bg-zinc-900 border-zinc-800 group hover:border-zinc-700 transition-all duration-300 relative overflow-hidden ${!med.isActive ? 'opacity-60 grayscale' : ''}`}
              >
                {!med.isActive && (
                  <div className="absolute top-3 right-3 bg-zinc-800 text-zinc-400 text-[10px] px-2 py-1 rounded uppercase tracking-wider font-bold z-10">
                    Inactive
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="bg-blue-500/10 p-3 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                      <Activity className="text-blue-500" size={24} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => startEdit(med)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDeactivate(med.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors">
                    {med.name}
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    {med.dosage} {med.unit} • {med.frequency}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {med.scheduleTimes.map((time, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm px-3 py-1.5 rounded-full">
                        <Clock size={12} className="text-blue-400" />
                        {time}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Calendar size={12} />
                    Started {format(new Date(med.startDate), 'MMM dd, yyyy')}
                  </div>

                  {med.notes && (
                    <div className="bg-zinc-800/50 rounded-lg p-3 text-sm text-zinc-400 border border-zinc-800/50">
                      <p className="italic">"{med.notes}"</p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2">
                   <div className="w-full flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-1 text-green-500">
                         <CheckCircle2 size={12} />
                         Synced
                      </span>
                      {med.isActive && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      )}
                   </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
