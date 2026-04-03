import { z } from 'zod';
import { RiskLevel } from './enums';

export const AdherenceStatsSchema = z.object({
  overallScore: z.number().min(0).max(100),
  dosesTaken: z.number().int().nonnegative(),
  dosesMissed: z.number().int().nonnegative(),
  dosesDelayed: z.number().int().nonnegative(),
  riskLevel: z.nativeEnum(RiskLevel),
});

export const PatternResultSchema = z.object({
  mostMissedTime: z.string().optional(), // HH:MM
  delayAverageMinutes: z.number().nonnegative(),
  riskFactors: z.array(z.string()),
});

export const AdherenceReportSchema = z.object({
  userId: z.string(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  stats: AdherenceStatsSchema,
  patterns: PatternResultSchema,
});

export type AdherenceStats = z.infer<typeof AdherenceStatsSchema>;
export type PatternResult = z.infer<typeof PatternResultSchema>;
export type AdherenceReport = z.infer<typeof AdherenceReportSchema>;
