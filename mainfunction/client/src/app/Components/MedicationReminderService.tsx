'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import { useAppSelector } from '@/store/hooks';
import { FaBell, FaCheck, FaClock, FaTimes } from 'react-icons/fa';

interface Reminder {
  _id: string;
  medicineName: string;
  medicineImage?: string;
  dosage: string;
  times: string[];
}

const MedicationReminderService = () => {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const [activeReminders, setActiveReminders] = useState<Reminder[]>([]);
  const [dueReminder, setDueReminder] = useState<Reminder | null>(null);
  const [dueTime, setDueTime] = useState<string>('');
  const [isTaken, setIsTaken] = useState(false);
  const [snoozedUntil, setSnoozedUntil] = useState<Record<string, number>>({});

  const fetchReminders = useCallback(async () => {
    try {
      const response = await api.get('/reminders');
      setActiveReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders for service:', error);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      fetchReminders();
      // Refresh list every 5 minutes
      const interval = setInterval(fetchReminders, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchReminders, isAuthenticated, isInitialized]);

  useEffect(() => {
    const checkDueReminders = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:mm
      const currentTimestamp = now.getTime();

      activeReminders.forEach(reminder => {
        reminder.times.forEach(time => {
          const reminderKey = `${reminder._id}-${time}`;
          
          // Check if it's the exact time
          if (time === currentTime) {
            // Check if it was already handled or snoozed
            const snoozeTime = snoozedUntil[reminderKey] || 0;
            if (currentTimestamp > snoozeTime) {
              setDueReminder(reminder);
              setDueTime(time);
            }
          }
        });
      });
    };

    const timer = setInterval(checkDueReminders, 30000); // Check every 30 seconds
    return () => clearInterval(timer);
  }, [activeReminders, snoozedUntil]);

  const handleMarkTaken = async () => {
    if (!dueReminder) return;
    try {
      await api.post(`/reminders/${dueReminder._id}/mark-taken`, {
        time: dueTime,
        status: 'taken'
      });
      console.log(`${dueReminder.medicineName} marked as taken`);
      setDueReminder(null);
      setIsTaken(false);
    } catch (error) {
      alert('Failed to update medication status');
    }
  };

  const handleSnooze = () => {
    if (!dueReminder) return;
    const reminderKey = `${dueReminder._id}-${dueTime}`;
    const fiveMinutesLater = Date.now() + 5 * 60 * 1000;
    
    setSnoozedUntil(prev => ({
      ...prev,
      [reminderKey]: fiveMinutesLater
    }));
    
    console.log(`Snoozed for 5 minutes`);
    setDueReminder(null);
  };

  if (!dueReminder) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="bg-white w-80 rounded-xl shadow-[0_32px_64px_-16px_rgba(0,105,119,0.25)] border-2 border-primary/10 overflow-hidden">
        <div className="bg-gradient-primary p-6 text-white relative">
          <button 
            onClick={() => setDueReminder(null)}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-all"
          >
            <FaTimes className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <FaBell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest opacity-80">Medication Due</span>
          </div>
          <h2 className="text-xl font-black">{dueReminder.medicineName}</h2>
          <p className="text-sm opacity-90 font-medium">{dueReminder.dosage} • {dueTime}</p>
        </div>

        <div className="p-6 space-y-4">
          <div 
            onClick={() => setIsTaken(!isTaken)}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
              isTaken ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 border-transparent text-gray-500'
            }`}
          >
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              isTaken ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
            }`}>
              {isTaken && <FaCheck className="w-4 h-4 text-white" />}
            </div>
            <span className="font-bold">Mark as taken</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleSnooze}
              className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-surface border border-outline-variant hover:bg-gray-100 transition-all text-gray-600"
            >
              <FaClock className="w-4 h-4" />
              Snooze
            </button>
            <button 
              onClick={handleMarkTaken}
              disabled={!isTaken}
              className={`py-3 rounded-xl font-bold transition-all ${
                isTaken 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationReminderService;
