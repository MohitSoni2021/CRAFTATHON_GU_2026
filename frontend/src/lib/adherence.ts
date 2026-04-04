import { format, parseISO, isAfter, addHours, differenceInMinutes, startOfDay, endOfDay, subDays, isWithinInterval } from 'date-fns';

export type DoseStatus = "pending" | "on_time" | "late" | "missed";

export interface MedicationLog {
  id: string;
  medicationId: string;
  scheduledTime: string; // ISO
  takenAt?: string;      // ISO
  status: DoseStatus;
}

const GRACE_PERIOD_MINUTES = 30;
const MISSED_THRESHOLD_HOURS = 2;

/**
 * Automatically determine the status of a dose log based on current time.
 */
export function computeDoseStatus(scheduledAt: string, takenAt?: string): DoseStatus {
  if (takenAt) {
    const scheduled = parseISO(scheduledAt);
    const taken = parseISO(takenAt);
    const diff = Math.abs(differenceInMinutes(taken, scheduled));
    
    if (diff <= GRACE_PERIOD_MINUTES) return "on_time";
    return "late";
  }

  const scheduled = parseISO(scheduledAt);
  const now = new Date();
  const missedTime = addHours(scheduled, MISSED_THRESHOLD_HOURS);

  if (isAfter(now, missedTime)) return "missed";
  return "pending";
}

/**
 * Weighted adherence score calculation.
 * On Time = 1.0, Late = 0.7, Missed = 0.0
 */
export function calculateWeightedScore(logs: MedicationLog[]): number {
  if (logs.length === 0) return 0;
  
  const relevantLogs = logs.filter(l => l.status !== 'pending');
  if (relevantLogs.length === 0) return 100; // Zero misses = perfect so far

  let totalPoints = 0;
  relevantLogs.forEach(log => {
      if (log.status === 'on_time') totalPoints += 1.0;
      else if (log.status === 'late') totalPoints += 0.7;
      else if (log.status === 'missed') totalPoints += 0;
  });

  return Math.round((totalPoints / relevantLogs.length) * 100);
}

/**
 * Filter logs by period.
 */
export function filterLogsByPeriod(logs: MedicationLog[], days: number): MedicationLog[] {
  const now = new Date();
  const startDate = startOfDay(subDays(now, days - 1));
  const endDate = endOfDay(now);

  return logs.filter(log => {
    const date = parseISO(log.scheduledTime);
    return isWithinInterval(date, { start: startDate, end: endDate });
  });
}
