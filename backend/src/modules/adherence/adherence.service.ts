import DoseLog from '../dose-log/dose-log.model';
import { DoseStatus, RiskLevel } from '@hackgu/shared';
import mongoose from 'mongoose';

export async function computeAdherenceScore(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await DoseLog.find({
    userId: new mongoose.Types.ObjectId(userId),
    scheduledAt: { $gte: since },
  });

  const total = logs.length;
  const taken = logs.filter(l => l.status === DoseStatus.TAKEN || l.status === DoseStatus.DELAYED).length;
  const missed = logs.filter(l => l.status === DoseStatus.MISSED).length;
  const delayed = logs.filter(l => l.status === DoseStatus.DELAYED).length;

  const score = total > 0 ? Math.round((taken / total) * 100) : 100;

  const riskLevel: RiskLevel =
    score >= 80 ? RiskLevel.LOW :
    score >= 50 ? RiskLevel.MEDIUM :
    RiskLevel.HIGH;

  // Track exact streaks of perfectly matched days (no missed doses)
  const byDay: Record<string, 'taken' | 'missed' | 'empty'> = {};
  for (const log of logs) {
    const day = log.scheduledAt.toISOString().split('T')[0];
    if (log.status === DoseStatus.MISSED) {
      byDay[day] = 'missed';
    } else if (log.status === DoseStatus.TAKEN || log.status === DoseStatus.DELAYED) {
      if (byDay[day] !== 'missed') byDay[day] = 'taken';
    }
  }

  let currentStreak = 0;
  const sortedDays = Object.keys(byDay).sort((a,b) => b.localeCompare(a));
  for (const day of sortedDays) {
    if (byDay[day] === 'taken') currentStreak++;
    else break; // any 'missed' ends the streak
  }

  return { score, total, taken, missed, delayed, riskLevel, currentStreak };
}

export async function getDailyBreakdown(userId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await DoseLog.find({
    userId: new mongoose.Types.ObjectId(userId),
    scheduledAt: { $gte: since },
  });

  const byDay: Record<string, { taken: number; missed: number; delayed: number; total: number }> = {};

  for (const log of logs) {
    const day = log.scheduledAt.toISOString().split('T')[0];
    if (!byDay[day]) byDay[day] = { taken: 0, missed: 0, delayed: 0, total: 0 };
    byDay[day].total++;
    if (log.status === DoseStatus.TAKEN)   byDay[day].taken++;
    if (log.status === DoseStatus.MISSED)  byDay[day].missed++;
    if (log.status === DoseStatus.DELAYED) byDay[day].delayed++;
  }

  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      ...data,
      score: data.total > 0 ? Math.round(((data.taken + data.delayed) / data.total) * 100) : 100,
    }));
}

export async function detectPatterns(userId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const logs = await DoseLog.find({
    userId: new mongoose.Types.ObjectId(userId),
    scheduledAt: { $gte: since },
  });

  const missed = logs.filter(l => l.status === DoseStatus.MISSED);
  const patterns: string[] = [];

  // Night-dose pattern
  const nightMissed = missed.filter(l => {
    const h = l.scheduledAt.getHours();
    return h >= 20 && h <= 23;
  });
  if (missed.length > 0 && nightMissed.length / missed.length > 0.6) {
    patterns.push('Night Doses Missed: >60% of missed doses occur between 20:00–23:59');
  }

  // Weekend slippage
  const weekdayLogs = logs.filter(l => [1,2,3,4,5].includes(l.scheduledAt.getDay()));
  const weekendLogs = logs.filter(l => [0,6].includes(l.scheduledAt.getDay()));
  const wdScore = weekdayLogs.length > 0
    ? ((weekdayLogs.filter(l => l.status !== DoseStatus.MISSED).length / weekdayLogs.length) * 100) : 100;
  const weScore = weekendLogs.length > 0
    ? ((weekendLogs.filter(l => l.status !== DoseStatus.MISSED).length / weekendLogs.length) * 100) : 100;
  if (wdScore - weScore > 20) {
    patterns.push('Weekend Slippage: Weekend adherence is significantly lower than weekdays');
  }

  // Streak break: 3+ consecutive missed for same medication
  const byMed: Record<string, any[]> = {};
  for (const log of logs) {
    const mid = log.medicationId.toString();
    if (!byMed[mid]) byMed[mid] = [];
    byMed[mid].push(log);
  }
  for (const medLogs of Object.values(byMed)) {
    medLogs.sort((a, b) => a.scheduledAt - b.scheduledAt);
    let streak = 0;
    for (const l of medLogs) {
      if (l.status === DoseStatus.MISSED) { streak++; } else { streak = 0; }
      if (streak >= 3) { patterns.push('Streak Break: 3+ consecutive missed doses detected'); break; }
    }
  }

  const delays = logs.filter(l => l.delayMinutes != null).map(l => l.delayMinutes as number);
  const delayAvg = delays.length > 0 ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : 0;

  return { patterns, delayAverageMinutes: delayAvg };
}
