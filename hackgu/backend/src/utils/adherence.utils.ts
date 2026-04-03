import { DoseStatus } from "@hackgu/shared";

/**
 * Calculates the adherence percentage based on taken and total doses.
 * @param taken Number of doses taken.
 * @param total Total number of scheduled doses.
 * @returns Adherence score as a percentage.
 */
export const calculateAdherenceScore = (taken: number, total: number): number => {
  if (total === 0) return 0;
  return Number(((taken / total) * 100).toFixed(2));
};

/**
 * Interface for dose summary history.
 */
interface DoseHistoryItem {
  status: DoseStatus;
  scheduledTime: Date;
}

/**
 * Detects if a patient is at high risk based on recent dose adherence.
 * Logic: If missed ≥ 3 doses in last 5 scheduled doses -> HIGH RISK.
 * @param recentDoses Array of recent dose logs.
 * @returns boolean indicating if the user is at high risk.
 */
export const detectAdherenceRisk = (recentDoses: DoseHistoryItem[]): boolean => {
  if (recentDoses.length < 3) return false; // Not enough data for high risk detection yet

  // Take the last 5 doses
  const lastFive = recentDoses
    .sort((a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime())
    .slice(0, 5);

  const missedCount = lastFive.filter(dose => dose.status === DoseStatus.MISSED).length;

  return missedCount >= 3;
};
