"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { getTodayDoses, markDoseAsTaken, getRiskLevel } from '@/lib/api/routes';
import { useSocket } from '@/context/SocketContext';
import { decryptData } from '@/lib/crypto';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Plus_Jakarta_Sans, Merriweather } from 'next/font/google';
import { format, parseISO } from 'date-fns';
import {
  Sun, Cloud, Moon, CheckCircle2, Clock, AlertCircle,
  Flame, Bell, RefreshCw, Loader2, Sparkles, ChevronRight,
  ArrowRight
} from 'lucide-react';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });
const merriweather = Merriweather({ weight: ['400', '700', '900'], subsets: ['latin'] });

// ─── Types ────────────────────────────────────────────────────
interface DoseEntry {
  id: string | null;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'missed' | 'delayed';
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
  const isTaken = dose.status === 'taken' || dose.status === 'delayed';
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
    taken:   'border-emerald-200 bg-emerald-50/40',
    delayed: 'border-emerald-200 bg-emerald-50/40',
    missed:  'border-red-200   bg-red-50/40    opacity-70',
    pending: 'border-gray-100  bg-white hover:bg-gray-50/50 hover:border-teal-100',
  }[dose.status];

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${statusStyles}
        ${isTaken ? 'shadow-emerald-100 shadow-md' : 'shadow-sm hover:shadow-md'}
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
          className="absolute inset-y-0 left-0 flex items-center px-6 bg-[#008080] rounded-l-3xl transition-all"
          style={{ width: `${swipeX * 0.6 + 8}px`, opacity: swipeX / 80 }}
        >
          <CheckCircle2 className="text-white" size={22} />
        </div>
      )}

      {/* Taken glow ring */}
      {isTaken && (
        <span className="absolute inset-0 rounded-3xl ring-2 ring-emerald-300/40 pointer-events-none" />
      )}

      <div className="flex items-center gap-5 p-6">
        {/* Checkbox button */}
        <button
          onClick={handleTake}
          disabled={isTaken || isMissed || localLoading}
          className={`relative shrink-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-300
            ${isTaken  ? 'bg-[#008080] border-[#008080] text-white shadow-lg shadow-[#008080]/15' : ''}
            ${isMissed ? 'bg-red-100    border-red-300' : ''}
            ${!isTaken && !isMissed ? 'border-gray-200 hover:border-[#008080] hover:shadow-[0_0_0_4px_rgba(0,128,128,0.1)]' : ''}
            ${pressed  ? 'scale-90' : 'scale-100'}
            ${localLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
          `}
        >
          {localLoading ? (
            <Loader2 size={16} className="animate-spin text-[#008080]" />
          ) : isTaken ? (
            <CheckCircle2 size={24} className="text-white" />
          ) : isMissed ? (
            <AlertCircle size={20} className="text-red-400" />
          ) : (
            <CheckCircle2 size={22} className="text-gray-200 group-hover:text-[#008080] transition-colors" />
          )}

          {/* Ripple on take */}
          {isTaken && (
            <span className="absolute inset-0 rounded-2xl animate-ping-once bg-[#008080]/20" />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={`flex items-center gap-2 ${isTaken ? 'opacity-60' : ''}`}>
            <p className={`font-black text-lg text-[#1a2233] truncate leading-tight tracking-tight
              ${isTaken ? 'line-through decoration-[#008080]/40' : ''}`}>
              {dose.medicationName}
            </p>
            {dose.delayMinutes != null && dose.delayMinutes > 0 && (
              <span className="shrink-0 text-[10px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-lg uppercase">
                +{dose.delayMinutes}m late
              </span>
            )}
            <span className="ml-2 py-0.5 px-2 bg-gray-100 text-gray-500 text-[10px] font-black rounded-lg uppercase">
                {dose.dosage}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 font-bold text-xs uppercase tracking-tighter text-gray-400">
             <Clock size={12} />
             {format(parseISO(dose.scheduledTime), 'h:mm a')}
          </div>
        </div>

        {/* Action/Badge */}
        <div className="shrink-0 flex flex-col items-end">
           {isTaken ? (
              <div className="text-right">
                 <p className="text-[10px] font-black text-[#008080] uppercase tracking-widest whitespace-nowrap">Completed</p>
                 <p className="text-[10px] text-gray-400 font-bold">{format(parseISO(dose.takenAt || ''), 'h:mm a')}</p>
              </div>
           ) : isMissed ? (
              <div className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                 Missed
              </div>
           ) : (
              <button 
                onClick={handleTake}
                className="bg-[#008080] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-[#008080]/10 hover:translate-x-1 transition-transform"
              >
                Log Now
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
  const [user, setUser]         = useState<any>(null);
  const [doses, setDoses]       = useState<DoseEntry[]>([]);
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

  // ── Fetch today's schedule & streak ───────────────────────────────────
  const fetchDoses = useCallback(async () => {
    try {
      setLoading(true);
      const [res, riskRes] = await Promise.all([
        getTodayDoses(),
        getRiskLevel().catch(() => null)
      ]);
      if (res.success) setDoses(res.data);
      if (riskRes?.success && riskRes.data) {
          setRisk(riskRes.data);
          setStreak(riskRes.data.currentStreak || 0);
      }
    } catch (e: any) {
      setError('Connection to health hub lost. Retrying...');
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

    setDoses(prev => prev.map(d =>
      d.medicationId === dose.medicationId && d.scheduledTime === dose.scheduledTime
        ? { ...d, status: 'taken', takenAt: new Date().toISOString() }
        : d
    ));

    try {
      await markDoseAsTaken({
        medicationId: dose.medicationId,
        scheduledAt:  dose.scheduledTime,
        takenAt:      new Date().toISOString(),
        status:       'taken',
      });
      fetchDoses();
    } catch (e: any) {
      setDoses(prev => prev.map(d =>
        d.medicationId === dose.medicationId && d.scheduledTime === dose.scheduledTime
          ? { ...d, status: 'pending', takenAt: null }
          : d
      ));
      setError('Log synchronization failed. Check local clock.');
    } finally {
      setTaking(null);
    }
  };

  const total   = doses.length;
  const taken   = doses.filter(d => d.status === 'taken' || d.status === 'delayed').length;
  const missed  = doses.filter(d => d.status === 'missed').length;
  const pending = total - taken - missed;
  const progress = total > 0 ? Math.round((taken / total) * 100) : 0;

  const grouped: Record<TimeGroup, DoseEntry[]> = { morning: [], afternoon: [], evening: [] };
  doses.forEach(d => grouped[getGroup(d.scheduledTime)].push(d));

  return (
    <div className={`min-h-screen bg-[#fcfdfd] text-[#1a2233] flex ${jakarta.className}`}>
      
      <Sidebar user={user} riskLevel={risk?.riskLevel} />
      <Confetti active={showConfetti} />

      <main className="ml-72 flex-1 p-10 max-w-[1200px] w-full">
        
        {/* Header Title Section */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className={`${merriweather.className} text-4xl font-black text-[#008080] mb-2`}>
               Today's Schedule
            </h1>
            <p className="text-gray-500 font-bold uppercase text-[11px] tracking-[2px]">
               {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-[#e6f2f2] border border-[#008080]/10 text-[#008080] text-xs font-black px-4 py-2.5 rounded-2xl tracking-tight">
               <Flame size={16} className="text-orange-500" />
               STREAK: {streak} DAYS ACTIVE
             </div>
             <button onClick={fetchDoses} className={`bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-[#008080] hover:bg-gray-50 transition-all ${loading ? 'animate-spin' : ''}`}>
               <RefreshCw size={20} />
             </button>
          </div>
        </div>

        {/* Progress Grid */}
        <div className="grid grid-cols-12 gap-8 mb-10">
           
           <div className="col-span-12 lg:col-span-8">
              <div className="bg-[#008080] p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-4 border border-white/10">
                           <Sparkles size={12} className="text-[#3bbdbf]" />
                           Daily Progress Engine
                        </div>
                        <h2 className={`${merriweather.className} text-3xl font-bold mb-2`}>
                           {progress === 100 ? "Optimization Complete!" : "Maintain the Momentum"}
                        </h2>
                        <p className="text-white/70 font-medium max-w-sm">
                           {pending === 0 ? "You have successfully synchronized all clinical regimens for today." : `Record shows ${pending} pending doses. Health score requires immediate updates.`}
                        </p>
                    </div>

                    <div className="relative shrink-0 w-40 h-40 flex items-center justify-center">
                        {/* Circular Progress (Professional) */}
                        <svg className="w-40 h-40 -rotate-90 transform" viewBox="0 0 100 100">
                           <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                           <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="8" 
                             strokeDasharray="282.7" 
                             strokeDashoffset={282.7 - (282.7 * progress) / 100}
                             strokeLinecap="round"
                             className="transition-all duration-1000 ease-in-out"
                           />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-4xl font-black">{progress}%</span>
                           <span className="text-[10px] font-black uppercase opacity-60">Completed</span>
                        </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="col-span-12 lg:col-span-4 grid grid-rows-3 gap-6">
              {[
                { label: 'Taken Correctly', val: taken, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
                { label: 'Pending Update', val: pending, color: 'text-[#008080]', bg: 'bg-[#e6f2f2]', icon: Clock },
                { label: 'Clinical Missed', val: missed, color: 'text-red-500', bg: 'bg-red-50', icon: AlertCircle },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-3xl p-6 flex justify-between items-center border border-transparent hover:border-black/5 transition-all`}>
                  <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-xl bg-white shadow-sm ${s.color}`}>
                       <s.icon size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                        <p className={`text-xl font-black ${s.color}`}>{s.val} Doses</p>
                     </div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Regimen Sections */}
        <div className="space-y-12">
            {(['morning', 'afternoon', 'evening'] as TimeGroup[]).map(group => {
              const items = grouped[group];
              if (items.length === 0) return null;
              const meta = GROUP_META[group];

              return (
                <section key={group} className="space-y-6">
                   <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border ${meta.border} bg-white transition-transform hover:scale-110`}>
                        {group === 'morning'   && <Sun  size={20} className={meta.color} />}
                        {group === 'afternoon' && <Cloud size={20} className={meta.color} />}
                        {group === 'evening'   && <Moon  size={20} className={meta.color} />}
                      </div>
                      <div>
                         <h3 className={`${merriweather.className} text-xl font-bold text-[#1a2233]`}>{meta.label} Phase</h3>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {items.filter(d => d.status === 'taken' || d.status === 'delayed').length} OF {items.length} RECORDED
                         </p>
                      </div>
                   </div>

                   <div className="grid gap-4">
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

        {/* Footer Area */}
        <div className="mt-20 p-10 bg-gray-50 rounded-[3rem] border border-gray-100 text-center">
             <div className="bg-white p-4 rounded-2xl inline-flex items-center gap-2 shadow-sm mb-4 border border-gray-100 text-[#008080] font-black text-xs uppercase tracking-tighter">
                <ShieldCheck className="text-[#3bbdbf]" size={16} /> Secure Health Hub Connection Active
             </div>
             <p className="text-sm text-gray-400 font-bold max-w-sm mx-auto leading-relaxed">
                Log your medications accurately. All adherence data is automatically summarized for your care team.
             </p>
        </div>
      </main>

      {/* Styled Celebration Toast */}
      {allDoneToast && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-500">
          <div className="flex flex-col gap-1 bg-[#008080] text-white p-6 rounded-[2rem] shadow-2xl">
            <div className="flex items-center gap-2 mb-2">
               <div className="bg-white/10 p-2 rounded-xl"><Sparkles size={20} className="text-[#3bbdbf]" /></div>
               <span className="text-[10px] font-black uppercase tracking-[2px]">Daily Mastery</span>
            </div>
            <p className="font-black text-lg">Daily Regimen Complete.</p>
            <p className="text-white/60 text-xs font-bold">100% adherence score reached today.</p>
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

// Re-using same imports from Dashboard if not available, or standard lucide
import { ShieldCheck } from 'lucide-react';
