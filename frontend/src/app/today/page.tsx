"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { getTodayDoses, markDoseAsTaken, getRiskLevel } from '@/lib/api/routes';
import { useSocket } from '@/context/SocketContext';
import { decryptData } from '@/lib/crypto';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AlertBanner from '@/components/AlertBanner';
import { computeDoseStatus } from '@/lib/adherence';
import { generateAlerts, AlertInstance } from '@/lib/reminders';
import { Plus_Jakarta_Sans, Merriweather, Poppins } from 'next/font/google';
import { format, parseISO } from 'date-fns';
import {
  Sun, Cloud, Moon, CheckCircle2, Clock, AlertCircle,
  Flame, Bell, RefreshCw, Loader2, Sparkles, ChevronRight,
  ArrowRight, ShieldCheck, XCircle, Activity
} from 'lucide-react';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });
const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'] });
const poppins = Poppins({ weight: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['latin'] });

// ─── Types ────────────────────────────────────────────────────
interface DoseEntry {
  id: string | null;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'missed' | 'delayed' | 'on_time' | 'late';
  takenAt: string | null;
  delayMinutes: number | null;
  notes: string | null;
}

type TimeGroup = 'morning' | 'afternoon' | 'evening';

function getGroup(iso: string): TimeGroup {
  const h = parseISO(iso).getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const GROUP_META: Record<TimeGroup, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  morning:   { label: 'Morning',   emoji: '☀️', color: 'text-amber-600',  bg: 'from-amber-50 to-orange-50',  border: 'border-amber-200/60' },
  afternoon: { label: 'Afternoon', emoji: '🌤️', color: 'text-teal-600',    bg: 'from-teal-50 to-cyan-50',      border: 'border-teal-200/60'   },
  evening:   { label: 'Evening',   emoji: '🌙', color: 'text-indigo-600', bg: 'from-indigo-50 to-purple-50', border: 'border-indigo-200/60' },
};

// ─── Confetti particle ────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  const colors = ['#008080','#6366f1','#f59e0b','#22c55e','#f43f5e','#a855f7'];
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 60 }).map((_, i) => {
        const color = colors[i % colors.length];
        const left  = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const size  = 6 + Math.random() * 8;
        return (
          <span
            key={i}
            className="absolute top-[-20px] animate-confetti-fall"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              width: `${size}px`,
              height: `${size}px`,
              background: color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Dose Card ────────────────────────────────────────────────
function DoseCard({
  dose,
  onTake,
  swipedId,
  onSwipeStart,
  onSwipeEnd,
}: {
  dose: DoseEntry;
  onTake: (d: DoseEntry) => void;
  swipedId: string | null;
  onSwipeStart: (id: string) => void;
  onSwipeEnd: () => void;
}) {
  const [localLoading, setLocalLoading] = useState(false);
  const [pressed, setPressed]           = useState(false);
  const [swipeX, setSwipeX]             = useState(0);
  const touchStartX = useRef<number>(0);
  const uid = `${dose.medicationId}_${dose.scheduledTime}`;
  
  const isTaken = dose.status === 'taken' || dose.status === 'delayed' || dose.status === 'on_time' || dose.status === 'late';
  const isMissed = dose.status === 'missed';

  // Swipe handler ──────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    onSwipeStart(uid);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    if (dx > 0 && dx < 100 && !isTaken) setSwipeX(dx);
  };
  const handleTouchEnd = async () => {
    onSwipeEnd();
    if (swipeX > 55 && !isTaken && !isMissed) {
      setSwipeX(0);
      await handleTake();
    } else {
      setSwipeX(0);
    }
  };

  const handleTake = async () => {
    if (isTaken || isMissed || localLoading) return;
    setLocalLoading(true);
    setPressed(true);
    setTimeout(() => setPressed(false), 300);
    await onTake(dose);
    setLocalLoading(false);
  };

  const statusStyles = {
    taken:   'border-emerald-100 bg-emerald-50/40',
    on_time: 'border-emerald-100 bg-emerald-50/40',
    delayed: 'border-emerald-100 bg-emerald-50/40',
    late:    'border-emerald-100 bg-emerald-50/40',
    missed:  'border-red-100   bg-red-50/40    opacity-70',
    pending: 'border-white/50  bg-white hover:bg-[#e6f2f2]/30 hover:border-[#008080]/10',
  }[dose.status] || 'bg-white border-white/50';

  return (
    <div
      className={`relative overflow-hidden rounded-[2.5rem] border shadow-sm transition-all duration-300 ${statusStyles}
        ${isTaken ? 'shadow-emerald-50 shadow-sm' : 'hover:shadow-lg group'}
        ${swipedId === uid || swipedId === null ? '' : 'opacity-60'}
      `}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ transform: `translateX(${swipeX * 0.6}px)` }}
    >
      {/* Swipe hint layer */}
      {swipeX > 10 && ( swipedId === uid ) && (
        <div
          className="absolute inset-y-0 left-0 flex items-center px-6 bg-[#008080] rounded-l-[2.5rem] transition-all"
          style={{ width: `${swipeX * 0.6 + 8}px`, opacity: swipeX / 80 }}
        >
          <CheckCircle2 className="text-white" size={22} />
        </div>
      )}

      {/* Taken glow ring */}
      {isTaken && (
        <span className="absolute inset-0 rounded-[2.5rem] ring-2 ring-emerald-300/40 pointer-events-none" />
      )}

      <div className="flex items-center gap-6 p-7">
        {/* Checkbox button */}
        <button
          onClick={handleTake}
          disabled={isTaken || isMissed || localLoading}
          className={`relative shrink-0 w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-300
            ${isTaken  ? 'bg-[#008080] border-[#008080] text-white shadow-xl shadow-[#008080]/20' : ''}
            ${isMissed ? 'bg-red-50    border-red-200 text-red-500' : ''}
            ${!isTaken && !isMissed ? 'bg-white border-gray-100 group-hover:border-[#008080] group-hover:shadow-[0_0_0_4px_rgba(0,128,128,0.05)]' : ''}
            ${pressed  ? 'scale-90' : 'scale-100'}
            ${localLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
          `}
        >
          {localLoading ? (
            <Loader2 size={18} className="animate-spin text-[#008080]" />
          ) : isTaken ? (
            <CheckCircle2 size={30} className="text-white" />
          ) : isMissed ? (
            <XCircle size={30} className="text-red-500" />
          ) : (
            <Activity size={30} className="text-gray-100 group-hover:text-[#008080] transition-colors" />
          )}

          {/* Ripple on take */}
          {isTaken && (
            <span className="absolute inset-0 rounded-2xl animate-ping-once bg-[#008080]/20" />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={`flex items-center gap-2 ${isTaken ? 'opacity-60' : ''}`}>
            <p className={`font-black text-xl text-[#1a2233] truncate leading-tight tracking-tight
              ${isTaken ? 'line-through decoration-[#008080]/40' : ''}`}>
              {dose.medicationName}
            </p>
            {(dose.status === 'late' || (dose.delayMinutes != null && dose.delayMinutes > 0)) && (
              <span className="shrink-0 text-[10px] font-black bg-amber-50 text-amber-600 px-3 py-1 rounded-lg uppercase tracking-widest border border-amber-100">
                LATE PROTOCOL
              </span>
            )}
            <span className="ml-2 py-1 px-3 bg-gray-50 text-gray-400 text-[10px] font-black rounded-lg uppercase border border-gray-100">
                {dose.dosage}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2 font-black text-xs uppercase tracking-[2px] text-gray-400">
             <Clock size={12} className="text-[#008080]" />
             Scheduled Hub Log: {format(parseISO(dose.scheduledTime), 'h:mm a')}
          </div>
        </div>

        {/* Action/Badge */}
        <div className="shrink-0 flex flex-col items-end border-l pl-8 border-gray-50">
           {isTaken ? (
              <div className="text-right">
                 <p className="text-[10px] font-black text-[#008080] uppercase tracking-widest whitespace-nowrap mb-1">Audit Verified</p>
                 <p className="text-[12px] text-[#1a2233] font-black uppercase tracking-tight">Sync @ {format(parseISO(dose.takenAt || ''), 'h:mm a')}</p>
              </div>
           ) : isMissed ? (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                 Missed Node
              </div>
           ) : (
              <button 
                onClick={handleTake}
                className="bg-[#008080] text-white px-8 py-3.5 rounded-2xl text-[10px] uppercase font-black tracking-widest shadow-xl shadow-[#008080]/15 hover:scale-105 active:scale-95 transition-all"
              >
                Establish Log
              </button>
           )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function TodayMedsPage() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [mounted, setMounted]     = useState(false);
  const [user, setUser]         = useState<any>(null);
  const [doses, setDoses]       = useState<DoseEntry[]>([]);
  const [alerts, setAlerts]     = useState<AlertInstance[]>([]);
  const [loading, setLoading]   = useState(true);
  const [taking, setTaking]     = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [showConfetti, setShowConfetti]   = useState(false);
  const [allDoneToast, setAllDoneToast]   = useState(false);
  const [swipedId, setSwipedId]           = useState<string | null>(null);
  const [streak, setStreak]               = useState(0);
  const [risk, setRisk]                   = useState<any>(null);
  const prevAllDone = useRef(false);

  // ── Auth guard ───────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;
    const enc = localStorage.getItem('user');
    if (!enc || enc === 'undefined') { router.push('/login'); return; }
    const decryptedUser = decryptData(enc);
    if (!decryptedUser) { router.push('/login'); return; }
    setUser(decryptedUser);
    fetchDoses();
  }, [router]);

  // ── Real-time socket refresh ─────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchDoses();
    socket.on('DOSE_UPDATED', handler);
    socket.on('DOSE_TAKEN',   handler);
    return () => { socket.off('DOSE_UPDATED', handler); socket.off('DOSE_TAKEN', handler); };
  }, [socket]);

  // ── Timer for alert refresh ──────────────────────────────────
  useEffect(() => {
    const itv = setInterval(() => {
      if (doses.length > 0) setAlerts(generateAlerts(doses));
    }, 60000);
    return () => clearInterval(itv);
  }, [doses]);

  // ── Fetch today's schedule ───────────────────────────────────
  const fetchDoses = useCallback(async () => {
    try {
      setLoading(true);
      const [res, riskRes] = await Promise.all([
        getTodayDoses(),
        getRiskLevel().catch(() => null)
      ]);
      if (res.success) {
        const enriched = res.data.map((d: any) => ({
          ...d,
          status: computeDoseStatus(d.scheduledTime, d.takenAt)
        }));
        setDoses(enriched);
        setAlerts(generateAlerts(enriched));
      }
      if (riskRes?.success && riskRes.data) {
          setRisk(riskRes.data);
          setStreak(riskRes.data.currentStreak || 0);
      }
    } catch (e: any) {
      setError('Connection to health hub lost.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── All-done celebration ─────────────────────────────────────
  useEffect(() => {
    const pending = doses.filter(d => d.status === 'pending').length;
    const total   = doses.length;
    if (total > 0 && pending === 0 && !prevAllDone.current) {
      prevAllDone.current = true;
      setShowConfetti(true);
      setAllDoneToast(true);
      setTimeout(() => setShowConfetti(false), 4000);
      setTimeout(() => setAllDoneToast(false), 5500);
    }
    if (pending > 0) prevAllDone.current = false;
  }, [doses]);

  const handleTakeDose = async (dose: DoseEntry) => {
    const uid = `${dose.medicationId}_${dose.scheduledTime}`;
    setTaking(uid);

    const now = new Date().toISOString();
    setDoses(prev => prev.map(d =>
      d.medicationId === dose.medicationId && d.scheduledTime === dose.scheduledTime
        ? { ...d, status: computeDoseStatus(dose.scheduledTime, now), takenAt: now }
        : d
    ));

    try {
      await markDoseAsTaken({
        medicationId: dose.medicationId,
        scheduledAt:  dose.scheduledTime,
        takenAt:      now,
        status:       'taken',
      });
      fetchDoses();
    } catch (e: any) {
      setDoses(prev => prev.map(d =>
        (d.medicationId === dose.medicationId && d.scheduledTime === dose.scheduledTime)
          ? { ...d, status: 'pending', takenAt: null }
          : d
      ));
    } finally {
      setTaking(null);
    }
  };

  if (!mounted) return null;

  const total   = doses.length;
  const taken   = doses.filter(d => d.status !== 'pending' && d.status !== 'missed').length;
  const missed  = doses.filter(d => d.status === 'missed').length;
  const pending = total - taken - missed;
  const progress = total > 0 ? Math.round((taken / total) * 100) : 0;

  const grouped: Record<TimeGroup, DoseEntry[]> = { morning: [], afternoon: [], evening: [] };
  doses.forEach(d => grouped[getGroup(d.scheduledTime)].push(d));

  return (
    <div className={`min-h-screen bg-[#f8fafb] text-[#1a2233] flex no-scrollbar overflow-x-hidden ${poppins.className}`}>
      
      <Sidebar user={user} riskLevel={risk?.riskLevel} />
      <Confetti active={showConfetti} />

      <main className="ml-[30rem] flex-1 p-10 max-w-[1600px] w-full no-scrollbar">
        
        {/* Header Title Section */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className={`${merriweather.className} text-4xl font-black text-[#008080] mb-2`}>
               Today's Schedule
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[11px] tracking-[2px]">
               Clinical Monitoring: {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-white border border-gray-100 shadow-sm text-[#008080] text-xs font-black px-6 py-3.5 rounded-[1.5rem] tracking-[1px]">
               <Flame size={18} className="text-orange-500 animate-pulse" />
               STREAK: {streak} DAYS ACTIVE
             </div>
             <button onClick={fetchDoses} className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-[#008080] hover:bg-gray-50 transition-all ${loading ? 'animate-spin' : ''}`}>
               <RefreshCw size={24} />
             </button>
          </div>
        </div>

        {/* Global Alerts */}
        <AlertBanner alerts={alerts} />

        {/* Progress Grid */}
        <div className="grid grid-cols-12 gap-8 mb-12">
           
           <div className="col-span-12 lg:col-span-8">
              <div className="bg-[#008080] p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div>
                        <div className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-full inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[2px] mb-8 border border-white/10">
                           <Sparkles size={16} className="text-[#3bbdbf] animate-pulse" />
                           Daily Progress Engine
                        </div>
                        <h2 className={`${merriweather.className} text-4xl font-bold mb-6 leading-tight`}>
                           {progress === 100 ? "Clinical Targets Achieved" : "Maintain Adherence Momentum"}
                        </h2>
                        <p className="text-white/80 font-medium max-w-md text-lg leading-relaxed mb-8">
                           {pending === 0 ? "You have successfully synchronized all clinical regimens for today." : `Network detects ${pending} pending doses. Hub score requires immediate updates for clinical safety.`}
                        </p>
                    </div>

                    <div className="relative shrink-0 w-48 h-48 flex items-center justify-center">
                        {/* Circular Progress */}
                        <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 100 100">
                           <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                           <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="8" 
                             strokeDasharray="282.7" 
                             strokeDashoffset={282.7 - (282.7 * progress) / 100}
                             strokeLinecap="round"
                             className="transition-all duration-1000 ease-in-out"
                           />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-5xl font-black">{progress}%</span>
                           <span className="text-[11px] font-black uppercase tracking-[2px] opacity-60">Success</span>
                        </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              {[
                { label: 'Taken Correctly', val: taken, color: 'text-emerald-500', bg: 'bg-emerald-50/50', icon: CheckCircle2, border: 'border-emerald-100' },
                { label: 'Pending Updates', val: pending, color: 'text-[#008080]', bg: 'bg-[#e6f2f2]/50', icon: Clock, border: 'border-[#008080]/10' },
                { label: 'Critical Misses', val: missed, color: 'text-red-500', bg: 'bg-red-50/50', icon: AlertCircle, border: 'border-red-100' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-[2.5rem] p-7 flex-1 flex justify-between items-center border ${s.border} hover:shadow-lg transition-all group`}>
                  <div className="flex items-center gap-6">
                     <div className={`p-4 rounded-2xl bg-white shadow-sm ${s.color} group-hover:scale-110 transition-transform`}>
                       <s.icon size={28} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{s.label}</p>
                        <p className={`text-2xl font-black ${s.color}`}>{s.val} Doses</p>
                     </div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Regimen Sections */}
        <div className="space-y-16">
            {(['morning', 'afternoon', 'evening'] as TimeGroup[]).map(group => {
              const items = grouped[group];
              if (items.length === 0) return null;
              const meta = GROUP_META[group];

              return (
                <section key={group} className="space-y-8">
                   <div className="flex items-center gap-6 border-b border-gray-100 pb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md border ${meta.border} bg-white transition-all hover:scale-110`}>
                        {group === 'morning'   && <Sun  size={28} className={meta.color} />}
                        {group === 'afternoon' && <Cloud size={28} className={meta.color} />}
                        {group === 'evening'   && <Moon  size={28} className={meta.color} />}
                      </div>
                      <div>
                         <h3 className={`${merriweather.className} text-2xl font-black text-[#1a2233]`}>{meta.label} Protocol</h3>
                         <p className="text-[11px] font-black text-gray-300 uppercase tracking-[3px] mt-1">
                            Current Status: {items.filter(d => d.status !== 'pending' && d.status !== 'missed').length} OF {items.length} Synchronized
                         </p>
                      </div>
                   </div>

                   <div className="grid gap-6">
                      {items.map(dose => (
                        <DoseCard
                          key={`${dose.medicationId}_${dose.scheduledTime}`}
                          dose={dose}
                          onTake={handleTakeDose}
                          swipedId={swipedId}
                          onSwipeStart={(id) => setSwipedId(id)}
                          onSwipeEnd={() => setSwipedId(null)}
                        />
                      ))}
                   </div>
                </section>
              );
            })}
        </div>

        {/* Footer */}
        <div className="mt-20 p-12 bg-white rounded-[3.5rem] border border-gray-100 text-center shadow-sm">
             <div className="bg-[#f8fafb] p-5 rounded-[2rem] inline-flex items-center gap-3 shadow-inner mb-6 border border-gray-100 text-[#008080] font-black text-xs uppercase tracking-[2px]">
                <ShieldCheck className="text-[#3bbdbf] animate-pulse" size={20} /> Secure Clinical Node Connection: Active
             </div>
        </div>
      </main>

      {/* Styled Celebration Toast */}
      {allDoneToast && (
        <div className="fixed bottom-12 right-12 z-[100] animate-in slide-in-from-right-12 duration-700">
          <div className="flex flex-col gap-2 bg-[#1a2233] text-white p-8 rounded-[3rem] shadow-3xl border border-[#008080]/20">
            <div className="flex items-center gap-4 mb-2">
               <div className="bg-[#008080] p-4 rounded-2xl shadow-xl"><Sparkles size={28} className="text-[#3bbdbf]" /></div>
               <div>
                  <span className="text-[11px] font-black uppercase tracking-[3px] text-[#008080]">Protocol Mastery</span>
                  <p className="font-black text-2xl">Daily Regime Secure.</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Style Injections */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation: confetti-fall 2.5s ease-in forwards;
          position: absolute;
        }
        @keyframes ping-once {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        .animate-ping-once {
          animation: ping-once 0.6s ease-out forwards;
        }
      `}} />
    </div>
  );
}
