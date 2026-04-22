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
  const [notifiedReminders, setNotifiedReminders] = useState<Record<string, boolean>>({});

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
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const showDesktopNotification = useCallback((reminder: Reminder, time: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`Medication Due: ${reminder.medicineName}`, {
        body: `It's time for your ${reminder.dosage} dose (${time}).`,
        icon: reminder.medicineImage || '/favicon.ico',
        tag: `${reminder._id}-${time}`, // Prevent duplicate notifications for same slot
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }, []);

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
              // Trigger desktop notification if not already shown for this window
              if (!notifiedReminders[reminderKey]) {
                showDesktopNotification(reminder, time);
                setNotifiedReminders(prev => ({ ...prev, [reminderKey]: true }));
              }

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={handleDismiss}></div>
      
      <div className="relative bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden border border-outline-variant animate-in zoom-in-95 duration-500">
        <div className="flex flex-col md:flex-row min-h-[450px]">
          {/* Visual Sidebar */}
          <div className="md:w-1/3 bg-gradient-to-br from-primary to-primary-dark p-10 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl w-fit mb-6">
                <FaBell className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 block mb-2">Medication Due</span>
              <div className="text-5xl font-black">{dueTime}</div>
            </div>
            
            <div className="relative z-10">
              <p className="text-sm font-bold opacity-80 leading-relaxed uppercase tracking-widest">
                Scheduled dosage for your health documentation system.
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-8 md:p-12 bg-white flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-6">
                {dueReminder.medicineImage ? (
                  <div className="w-24 h-24 rounded-xl border-2 border-primary/10 overflow-hidden shadow-ambient">
                    <img src={dueReminder.medicineImage} alt={dueReminder.medicineName} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-primary/5 flex items-center justify-center border-2 border-primary/10">
                    <FaBell className="text-primary w-10 h-10" />
                  </div>
                )}
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-2">
                    {dueReminder.medicineName}
                  </h1>
                  <span className="inline-block text-sm font-black text-primary bg-primary/5 px-4 py-1.5 rounded-full uppercase tracking-widest border border-primary/10">
                    {dueReminder.dosage}
                  </span>
                </div>
              </div>
              <button 
                onClick={handleDismiss}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 space-y-6">
              <div 
                onClick={() => setIsTaken(!isTaken)}
                className={`flex items-center gap-5 p-6 rounded-xl border-2 transition-all cursor-pointer ${
                  isTaken ? 'bg-green-50 border-green-500 text-green-700' : 'bg-surface border-outline-variant text-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                  isTaken ? 'bg-green-500 border-green-500 shadow-lg shadow-green-200' : 'bg-white border-gray-300'
                }`}>
                  {isTaken && <FaCheck className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <span className="text-xl font-black uppercase tracking-tight">Mark as taken</span>
                  <p className="text-xs font-bold opacity-60 uppercase tracking-widest mt-0.5">I have successfully taken this dose</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={handleSnooze}
                  className="flex items-center justify-center gap-3 py-5 rounded-xl font-black text-sm uppercase tracking-widest bg-surface border border-outline-variant hover:bg-gray-100 transition-all text-gray-600"
                >
                  <FaClock size={16} />
                  Snooze
                </button>
                <button 
                  onClick={handleMarkTaken}
                  disabled={!isTaken}
                  className={`py-5 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                    isTaken 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]' 
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Confirm Dose
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationReminderService;
