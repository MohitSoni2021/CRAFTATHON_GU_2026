'use client';

import React, { useState, useEffect } from 'react';
import api from '@/utils/api';
import { useAppSelector } from '@/store/hooks';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { FaPlus, FaBell, FaTrash, FaClock, FaCalendarAlt, FaCheckCircle, FaTimes } from 'react-icons/fa';
import MedicationsSkeleton from '@/components/dashboard/MedicationsSkeleton';


interface Reminder {
  _id: string;
  medicineName: string;
  medicineImage?: string;
  dosage: string;
  frequencyPerDay: number;
  frequencyType: 'daily' | 'weekly' | 'monthly';
  times: string[];
  isActive: boolean;
}

const MedicationRemindersPage = () => {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [medicineName, setMedicineName] = useState('');
  const [medicineImage, setMedicineImage] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequencyPerDay, setFrequencyPerDay] = useState(1);
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [times, setTimes] = useState<string[]>(['08:00']);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      fetchReminders();
    }
  }, [isInitialized, isAuthenticated]);

  const fetchReminders = async () => {
    try {
      const response = await api.get('/reminders');
      setReminders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setLoading(false);
    }
  };

  const handleFrequencyChange = (val: number) => {
    setFrequencyPerDay(val);
    const newTimes = [...times];
    if (val > times.length) {
      for (let i = times.length; i < val; i++) {
        newTimes.push('12:00');
      }
    } else {
      newTimes.splice(val);
    }
    setTimes(newTimes);
  };

  const handleTimeChange = (index: number, val: string) => {
    const newTimes = [...times];
    newTimes[index] = val;
    setTimes(newTimes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName && !medicineImage) {
      alert('Medicine name or image is required');
      return;
    }
    
    try {
      await api.post('/reminders', {
        medicineName,
        medicineImage,
        dosage,
        frequencyPerDay,
        frequencyType,
        times
      });
      alert('Reminder added successfully');
      setIsModalOpen(false);
      resetForm();
      fetchReminders();
      // Notify the global reminder service to refresh
      window.dispatchEvent(new CustomEvent('medicationUpdated'));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add reminder');
    }
  };

  const resetForm = () => {
    setMedicineName('');
    setMedicineImage('');
    setDosage('');
    setFrequencyPerDay(1);
    setFrequencyType('daily');
    setTimes(['08:00']);
  };

  const deleteReminder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    try {
      await api.delete(`/reminders/${id}`);
      alert('Reminder deleted');
      fetchReminders();
      // Notify the global reminder service to refresh
      window.dispatchEvent(new CustomEvent('medicationUpdated'));
    } catch (error) {
      alert('Failed to delete reminder');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-transparent">
          <div className="w-full">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Medication Reminders</h1>
                <p className="text-gray-500 mt-2 font-medium tracking-wide">Schedule and track your daily medication dosage timing.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-primary !rounded-xl gap-2 shadow-ambient"
              >
                <FaPlus size={14} />
                <span>Add Medication</span>
              </button>
            </header>

        {loading ? (
          <MedicationsSkeleton />
        ) : reminders.length === 0 ? (

          <div className="bg-white rounded-xl p-12 text-center shadow-ambient border border-outline-variant">
            <div className="bg-primary/5 w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6">
              <FaBell className="text-primary w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No active reminders</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't scheduled any medications yet. Start by adding your first one!</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reminders.map((reminder) => (
              <div key={reminder._id} className="bg-white rounded-xl p-6 shadow-ambient border border-outline-variant hover:border-primary/20 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center overflow-hidden">
                      {reminder.medicineImage ? (
                        <img src={reminder.medicineImage} alt={reminder.medicineName} className="w-full h-full object-cover" />
                      ) : (
                        <FaBell className="text-primary w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{reminder.medicineName}</h3>
                      <span className="text-primary font-semibold text-sm bg-primary/5 px-3 py-1 rounded-full uppercase tracking-wider">
                        {reminder.dosage}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteReminder(reminder._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaCalendarAlt className="w-5 h-5 text-primary" />
                    <span className="font-medium capitalize">{reminder.frequencyType}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaClock className="w-5 h-5 text-primary" />
                    <div className="flex flex-wrap gap-2">
                      {reminder.times.map((time, idx) => (
                        <span key={idx} className="bg-surface px-3 py-1 rounded-lg text-sm font-bold border border-outline-variant">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-outline-variant flex justify-between items-center">
                  <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                    <FaCheckCircle className="w-4 h-4" />
                    Active Schedule
                  </div>
                  <div className="text-xs text-gray-400 font-medium">
                    {reminder.frequencyPerDay} dose{reminder.frequencyPerDay > 1 ? 's' : ''} daily
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Reminder Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 pb-4 flex justify-between items-center">
                <h2 className="text-3xl font-black text-gray-900">Add Medication</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 pt-2 overflow-y-auto">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-black uppercase tracking-widest text-gray-400 mb-2">Medicine Name *</label>
                      <input 
                        type="text" 
                        value={medicineName}
                        onChange={(e) => setMedicineName(e.target.value)}
                        className="input-editorial"
                        placeholder="e.g. Paracetamol"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black uppercase tracking-widest text-gray-400 mb-2">Dosage Amount *</label>
                      <input 
                        type="text" 
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        className="input-editorial"
                        placeholder="e.g. 2 Tablets or 15ml"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black uppercase tracking-widest text-gray-400 mb-2">Image URL (Optional)</label>
                    <input 
                      type="text" 
                      value={medicineImage}
                      onChange={(e) => setMedicineImage(e.target.value)}
                      className="input-editorial"
                      placeholder="Paste image link here"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-black uppercase tracking-widest text-gray-400 mb-2">Frequency per Day</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="12"
                        value={frequencyPerDay}
                        onChange={(e) => handleFrequencyChange(parseInt(e.target.value) || 1)}
                        className="input-editorial"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black uppercase tracking-widest text-gray-400 mb-2">Schedule Type</label>
                      <select 
                        value={frequencyType}
                        onChange={(e) => setFrequencyType(e.target.value as any)}
                        className="input-editorial"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-surface p-6 rounded-xl border border-outline-variant">
                    <label className="block text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Set Dose Times</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {times.map((time, index) => (
                        <div key={index} className="space-y-1">
                          <span className="text-[10px] font-black uppercase text-primary ml-1">Dose {index + 1}</span>
                          <input 
                            type="time" 
                            value={time}
                            onChange={(e) => handleTimeChange(index, e.target.value)}
                            className="input-editorial !py-2"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-8 py-4 rounded-xl font-bold border border-outline-variant hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="flex-[2] btn-primary">
                    Create Reminder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default MedicationRemindersPage;
