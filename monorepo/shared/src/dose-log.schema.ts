import { z } from 'zod';
import { DoseStatus } from './enums';

export const LogDoseSchema = z.object({
  medicationId: z.string(),
  scheduledAt: z.string().datetime(),
  takenAt: z.string().datetime().optional(),
  status: z.nativeEnum(DoseStatus),
  notes: z.string().optional(),
  delayMinutes: z.number().int().nonnegative().optional(),
});

export const DoseLogResponseSchema = LogDoseSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.string().datetime(),
});

export const DoseLogFilterSchema = z.object({
  medicationId: z.string().optional(),
  status: z.nativeEnum(DoseStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type LogDoseInput = z.infer<typeof LogDoseSchema>;
export type DoseLogResponse = z.infer<typeof DoseLogResponseSchema>;
export type DoseLogFilter = z.infer<typeof DoseLogFilterSchema>;
