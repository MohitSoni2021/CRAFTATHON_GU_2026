'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getTodayDoses, markDoseAsTaken, getRiskLevel } from '@/lib/api/routes';
import { useSocket } from '@/context/SocketContext';
import { decryptData } from '@/lib/crypto';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { format, parseISO } from 'date-fns';
import {
  Sun, Cloud, Moon, CheckCircle2, Clock, AlertCircle,
  Flame, Bell, RefreshCw, Loader2, Sparkles, ChevronRight
} from 'lucide-react';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] });

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
  morning:   { label: 'Morning',   emoji: '☀️', color: 'text-amber-500',  bg: 'from-amber-50 to-orange-50',  border: 'border-amber-200/60' },
  afternoon: { label: 'Afternoon', emoji: '🌤️', color: 'text-sky-500',    bg: 'from-sky-50 to-cyan-50',      border: 'border-sky-200/60'   },
  evening:   { label: 'Evening',   emoji: '🌙', color: 'text-indigo-500', bg: 'from-indigo-50 to-purple-50', border: 'border-indigo-200/60' },
};

// ─── Confetti particle ────────────────────────────────────────
function Confetti({ active }: { active: boolean }) {
  const colors = ['#3bbdbf','#6366f1','#f59e0b','#22c55e','#f43f5e','#a855f7'];
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
    pending: 'border-gray-100  bg-white',
  }[dose.status];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${statusStyles}
        ${isTaken ? 'shadow-emerald-100 shadow-md' : 'shadow-sm hover:shadow-md'}
        ${swipedId === uid || swipedId === null ? '' : 'opacity-60'}
      `}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ transform: `translateX(${swipeX * 0.6}px)` }}
    >
      {/* Swipe hint layer */}
      {swipeX > 10 && (
        <div
          className="absolute inset-y-0 left-0 flex items-center px-6 bg-emerald-400 rounded-l-2xl transition-all"
          style={{ width: `${swipeX * 0.6 + 8}px`, opacity: swipeX / 80 }}
        >
          <CheckCircle2 className="text-white" size={22} />
        </div>
      )}

      {/* Taken glow ring */}
      {isTaken && (
        <span className="absolute inset-0 rounded-2xl ring-2 ring-emerald-300/40 pointer-events-none" />
      )}

      <div className="flex items-center gap-4 p-4">
        {/* Checkbox button */}
        <button
          id={`dose-check-${dose.medicationId}-${encodeURIComponent(dose.scheduledTime)}`}
          onClick={handleTake}
          disabled={isTaken || isMissed || localLoading}
          className={`relative shrink-0 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-300
            ${isTaken  ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-200' : ''}
            ${isMissed ? 'bg-red-100    border-red-300' : ''}
            ${!isTaken && !isMissed ? 'border-gray-300 hover:border-[#3bbdbf] hover:shadow-[0_0_0_4px_rgba(59,189,191,0.15)]' : ''}
            ${pressed  ? 'scale-90' : 'scale-100'}
            ${localLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
          `}
        >
          {localLoading ? (
            <Loader2 size={16} className="animate-spin text-[#3bbdbf]" />
          ) : isTaken ? (
            <CheckCircle2 size={20} className="text-white" />
          ) : isMissed ? (
            <AlertCircle size={18} className="text-red-400" />
          ) : (
            <span className="w-4 h-4 rounded-full border-2 border-gray-300" />
          )}

          {/* Ripple on take */}
          {isTaken && (
            <span className="absolute inset-0 rounded-full animate-ping-once bg-emerald-300/40" />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className={`flex items-center gap-2 ${isTaken ? 'opacity-60' : ''}`}>
            <p className={`font-bold text-sm text-[#2b3654] truncate leading-tight
              ${isTaken ? 'line-through decoration-emerald-400' : ''}`}>
              {dose.medicationName}
            </p>
            {dose.delayMinutes != null && dose.delayMinutes > 0 && (
              <span className="shrink-0 text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                +{dose.delayMinutes}m late
              </span>
            )}
          </div>
          <p className={`text-xs font-medium mt-0.5 ${isTaken ? 'text-emerald-500' : isMissed ? 'text-red-400' : 'text-gray-400'}`}>
            {dose.dosage}
          </p>
        </div>

        {/* Time / Status badge */}
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className={`flex items-center gap-1 text-xs font-bold
            ${isTaken ? 'text-emerald-500' : isMissed ? 'text-red-400' : 'text-gray-400'}`}>
            <Clock size={11} />
            {format(parseISO(dose.scheduledTime), 'h:mm a')}
          </span>
          {isTaken && dose.takenAt && (
            <span className="text-[10px] text-emerald-400 font-medium">
              taken {format(parseISO(dose.takenAt), 'h:mm a')}
            </span>
          )}
          {!isTaken && !isMissed && (
            <span className="text-[10px] text-gray-300 font-medium flex items-center gap-1">
              swipe <ChevronRight size={10} />
            </span>
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
  const prevAllDone = useRef(false);

  // ── Auth guard ───────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const enc = localStorage.getItem('user');
    if (!enc) { router.push('/login'); return; }
    setUser(decryptData(enc));
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
        getRiskLevel().catch(() => null) // fail gracefully
      ]);
      if (res.success) setDoses(res.data);
      if (riskRes?.success && riskRes.data) setStreak(riskRes.data.currentStreak || 0);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load schedule');
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

  // ── Mark as taken (optimistic) ───────────────────────────────
  const handleTakeDose = async (dose: DoseEntry) => {
    const uid = `${dose.medicationId}_${dose.scheduledTime}`;
    setTaking(uid);

    // Optimistic update
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
      // Re-sync from server
      fetchDoses();
    } catch (e: any) {
      // Revert on failure
      setDoses(prev => prev.map(d =>
        d.medicationId === dose.medicationId && d.scheduledTime === dose.scheduledTime
          ? { ...d, status: 'pending', takenAt: null }
          : d
      ));
      setError('Failed to mark dose as taken. Please retry.');
    } finally {
      setTaking(null);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────
  const total   = doses.length;
  const taken   = doses.filter(d => d.status === 'taken' || d.status === 'delayed').length;
  const missed  = doses.filter(d => d.status === 'missed').length;
  const pending = total - taken - missed;
  const progress = total > 0 ? Math.round((taken / total) * 100) : 0;

  const grouped: Record<TimeGroup, DoseEntry[]> = { morning: [], afternoon: [], evening: [] };
  doses.forEach(d => grouped[getGroup(d.scheduledTime)].push(d));

  return (
    <div className={`min-h-screen bg-[#f8faff] ${jakarta.className}`}>
      <Navbar user={user} />
      <Confetti active={showConfetti} />

      {/* All-done toast */}
      {allDoneToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl shadow-emerald-200 font-bold text-sm">
            <Sparkles size={18} /> All doses complete! Amazing job 🎉
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2b3654]">Today's Meds</h1>
            <p className="text-sm text-gray-400 font-medium mt-0.5">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Streak badge */}
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full">
              <Flame size={14} className="text-orange-500" />
              {streak}d streak
            </div>
            {/* Socket indicator */}
            <div title={isConnected ? 'Live' : 'Offline'} 
              className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} />
            <button onClick={fetchDoses} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ── Progress card ───────────────────────────────────────── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Today's Progress</p>
              <p className="text-2xl font-extrabold text-[#2b3654] mt-0.5">
                {taken} <span className="text-base font-medium text-gray-300">/ {total} doses</span>
              </p>
            </div>
            <div className="relative w-16 h-16">
              {/* Circular progress */}
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="27" strokeWidth="5" className="stroke-gray-100 fill-none" />
                <circle
                  cx="32" cy="32" r="27" strokeWidth="5" strokeLinecap="round"
                  className="fill-none transition-all duration-700"
                  stroke={progress === 100 ? '#22c55e' : '#3bbdbf'}
                  strokeDasharray={`${2 * Math.PI * 27}`}
                  strokeDashoffset={`${2 * Math.PI * 27 * (1 - progress / 100)}`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-[#2b3654]">
                {progress}%
              </span>
            </div>
          </div>

          {/* Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-700 ease-out
                ${progress === 100 ? 'bg-emerald-400' : 'bg-linear-to-r from-[#3bbdbf] to-[#6366f1]'}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { label: 'Taken',   val: taken,   color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Pending', val: pending,  color: 'text-[#3bbdbf]',   bg: 'bg-cyan-50'   },
              { label: 'Missed',  val: missed,   color: 'text-red-400',     bg: 'bg-red-50'    },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
                <p className={`text-lg font-extrabold ${s.color}`}>{s.val}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Pending reminder badge */}
          {pending > 0 && (
            <div className="flex items-center gap-2 mt-4 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              <Bell size={14} className="text-amber-500 shrink-0" />
              <p className="text-xs font-semibold text-amber-700">
                {pending} dose{pending !== 1 ? 's' : ''} still pending today
              </p>
            </div>
          )}
        </div>

        {/* ── Error banner ────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm font-medium animate-in fade-in">
            <AlertCircle size={16} />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="opacity-50 hover:opacity-100">✕</button>
          </div>
        )}

        {/* ── Loading skeleton ────────────────────────────────────── */}
        {loading && doses.length === 0 && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-12" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────── */}
        {!loading && doses.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-200">
            <div className="text-5xl mb-4">💊</div>
            <h3 className="font-bold text-[#2b3654] text-lg mb-1">No doses scheduled</h3>
            <p className="text-sm text-gray-400">Add medications from the Medicine Cabinet to start tracking.</p>
          </div>
        )}

        {/* ── Grouped dose cards ──────────────────────────────────── */}
        {(['morning', 'afternoon', 'evening'] as TimeGroup[]).map(group => {
          const items = grouped[group];
          if (items.length === 0) return null;
          const meta = GROUP_META[group];

          return (
            <section key={group} className="space-y-3">
              {/* Group header */}
              <div className={`flex items-center gap-3 bg-linear-to-r ${meta.bg} border ${meta.border} rounded-2xl px-4 py-3`}>
                <span className="text-xl">{meta.emoji}</span>
                <div>
                  <p className={`font-extrabold text-sm ${meta.color}`}>{meta.label}</p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {items.filter(d => d.status === 'taken' || d.status === 'delayed').length}/{items.length} taken
                  </p>
                </div>
                {/* Group icon */}
                <div className="ml-auto">
                  {group === 'morning'   && <Sun  size={18} className={meta.color} />}
                  {group === 'afternoon' && <Cloud size={18} className={meta.color} />}
                  {group === 'evening'   && <Moon  size={18} className={meta.color} />}
                </div>
              </div>

              {/* Dose cards */}
              <div className="space-y-2">
                {items.map(dose => {
                  const uid = `${dose.medicationId}_${dose.scheduledTime}`;
                  return (
                    <DoseCard
                      key={uid}
                      dose={dose}
                      onTake={handleTakeDose}
                      swipedId={swipedId}
                      onSwipeStart={(id) => setSwipedId(id)}
                      onSwipeEnd={() => setSwipedId(null)}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* ── Footer tip ──────────────────────────────────────────── */}
        {doses.length > 0 && !loading && (
          <p className="text-center text-xs text-gray-300 font-medium pb-6">
            Swipe right on a card or tap the circle to mark as taken
          </p>
        )}
      </div>

      {/* ── Keyframe CSS injected via dangerouslySetInnerHTML ─── */}
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
