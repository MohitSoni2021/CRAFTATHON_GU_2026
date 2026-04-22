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
  takenLog?: Array<{
    date: string | Date;
    time: string;
    status: string;
  }>;
}

const MedicationReminderService = () => {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const [activeReminders, setActiveReminders] = useState<Reminder[]>([]);
  const [dueReminder, setDueReminder] = useState<Reminder | null>(null);
  const [dueTime, setDueTime] = useState<string>('');
  const [isTaken, setIsTaken] = useState(false);
  const [snoozedUntil, setSnoozedUntil] = useState<Record<string, number>>({});
  const [dismissedReminders, setDismissedReminders] = useState<Record<string, number>>({});

  const fetchReminders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get('/reminders');
      setActiveReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      fetchReminders();
      
      const handleUpdate = () => fetchReminders();
      window.addEventListener('medicationUpdated', handleUpdate);
      
      const interval = setInterval(fetchReminders, 60 * 1000);
      
      return () => {
        window.removeEventListener('medicationUpdated', handleUpdate);
        clearInterval(interval);
      };
    }
  }, [fetchReminders, isAuthenticated, isInitialized]);

  useEffect(() => {
    if (!isAuthenticated || !isInitialized) return;

    const checkDueReminders = () => {
      if (dueReminder) return;

      const now = new Date();
      const currentTimestamp = now.getTime();
      const todayDateStr = now.toDateString();

      // Look through all medications
      for (const reminder of activeReminders) {
        if (!reminder.times || !Array.isArray(reminder.times)) continue;

        for (const time of reminder.times) {
          const [hours, minutes] = time.split(':').map(Number);
          const reminderDate = new Date();
          reminderDate.setHours(hours, minutes, 0, 0);
          
          const timeDiff = currentTimestamp - reminderDate.getTime();
          const twoHoursInMs = 2 * 60 * 60 * 1000;

          // If due now or in the last 2 hours
          if (timeDiff >= 0 && timeDiff < twoHoursInMs) {
            const reminderKey = `${reminder._id}-${time}`;
            
            // Check if already taken today for this specific time
            const isTaken = reminder.takenLog?.some(log => {
              const logDate = new Date(log.date).toDateString();
              return logDate === todayDateStr && log.time === time && log.status === 'taken';
            });

            if (isTaken) continue;

            // Check if snoozed or dismissed
            const snoozeTime = snoozedUntil[reminderKey] || 0;
            const dismissTime = dismissedReminders[reminderKey] || 0;
            const thirtyMins = 30 * 60 * 1000;

            if (currentTimestamp > snoozeTime && currentTimestamp > (dismissTime + thirtyMins)) {
              setDueReminder(reminder);
              setDueTime(time);
              setIsTaken(false);
              return; // Show one at a time
            }
          }
        }
      }
    };

    // Run every 5 seconds for snappy performance
    const timer = setInterval(checkDueReminders, 5000);
    checkDueReminders(); // Initial check
    
    return () => clearInterval(timer);
  }, [activeReminders, snoozedUntil, dismissedReminders, dueReminder, isAuthenticated, isInitialized]);

  const handleMarkTaken = async () => {
    if (!dueReminder) return;
    try {
      await api.post(`/reminders/${dueReminder._id}/mark-taken`, {
        time: dueTime,
        status: 'taken'
      });
      setDueReminder(null);
      setIsTaken(false);
      fetchReminders(); // Refresh data immediately
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

  const handleDismiss = () => {
    if (!dueReminder) return;
    const reminderKey = `${dueReminder._id}-${dueTime}`;
    setDismissedReminders(prev => ({
      ...prev,
      [reminderKey]: Date.now()
    }));
    setDueReminder(null);
  };

  if (!dueReminder) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="bg-white w-85 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,105,119,0.3)] border border-primary/10 overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary-dark p-6 text-white relative">
          <button 
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-all"
          >
            <FaTimes className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl">
              <FaBell className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Medication Reminder</span>
          </div>
          <h2 className="text-2xl font-black leading-tight">{dueReminder.medicineName}</h2>
          <p className="text-sm opacity-90 font-bold mt-1 flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded-md">{dueReminder.dosage}</span>
            <span className="opacity-60">•</span>
            <span>Due at {dueTime}</span>
          </p>
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
