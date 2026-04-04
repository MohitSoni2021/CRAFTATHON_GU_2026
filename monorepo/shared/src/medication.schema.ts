import { z } from 'zod';
import { FrequencyType } from './enums';

export const CreateMedicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().min(1),
  unit: z.string().min(1),
  frequency: z.nativeEnum(FrequencyType),
  scheduleTimes: z.array(z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/)), // HH:MM
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

export const UpdateMedicationSchema = CreateMedicationSchema.partial();

export const MedicationResponseSchema = CreateMedicationSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.string().datetime(),
});

export type CreateMedicationInput = z.infer<typeof CreateMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof UpdateMedicationSchema>;
export type MedicationResponse = z.infer<typeof MedicationResponseSchema>;
