import { parseISO, addMinutes, isAfter, isBefore, subMinutes, differenceInMinutes, addHours } from 'date-fns';

export type AlertType = 'upcoming' | 'due' | 'missed' | 'escalation';

export interface AlertInstance {
  id: string;
  type: AlertType;
  medicationName: string;
  scheduledTime: string;
  message: string;
}

const UPCOMING_THRESHOLD = 15; // minutes before
const MISSED_THRESHOLD = 120;   // minutes after (2h)

/**
 * Given a list of today's scheduled doses and logs, generate relevant alerts.
 */
export function generateAlerts(doses: any[]): AlertInstance[] {
  const now = new Date();
  const alerts: AlertInstance[] = [];

  doses.forEach(dose => {
    if (dose.status === 'taken' || dose.status === 'delayed') return;

    const scheduled = parseISO(dose.scheduledTime);
    const diff = differenceInMinutes(scheduled, now); // positive if in future

    // 1. Missed Case
    const missedTime = addMinutes(scheduled, MISSED_THRESHOLD);
    if (isAfter(now, missedTime) && dose.status !== 'missed') {
      alerts.push({
        id: `missed-${dose.id || dose.medicationId}-${dose.scheduledTime}`,
        type: 'missed',
        medicationName: dose.medicationName,
        scheduledTime: dose.scheduledTime,
        message: `MISS: Critical missed dose suspected for ${dose.medicationName}. Hub requires immediate sync.`
      });
      return;
    }

    // 2. Due Now Case
    if (Math.abs(diff) <= 5 && !isAfter(now, addMinutes(scheduled, 5))) {
      alerts.push({
        id: `due-${dose.id || dose.medicationId}-${dose.scheduledTime}`,
        type: 'due',
        medicationName: dose.medicationName,
        scheduledTime: dose.scheduledTime,
        message: `DUE: Maintenance protocol for ${dose.medicationName} is active. Execute now.`
      });
      return;
    }

    // 3. Upcoming Case
    if (diff > 0 && diff <= UPCOMING_THRESHOLD) {
      alerts.push({
        id: `upcoming-${dose.id || dose.medicationId}-${dose.scheduledTime}`,
        type: 'upcoming',
        medicationName: dose.medicationName,
        scheduledTime: dose.scheduledTime,
        message: `PRE-OP: Upcoming dose for ${dose.medicationName} in ${diff} minutes.`
      });
    }
  });

  return alerts;
}

/**
 * Escalation logic: if more than 3 missed doses in the last week.
 */
export function checkEscalationStatus(logs: any[]): boolean {
  if (!logs) return false;
  const missedCount = logs.filter(l => l.status === 'missed').length;
  return missedCount >= 3;
}
