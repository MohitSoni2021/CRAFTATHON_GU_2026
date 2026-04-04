import { z } from 'zod';

export const LinkCaregiverSchema = z.object({
  caregiverId: z.string(),
  relationship: z.string().min(1),
});

export const CaregiverLinkResponseSchema = LinkCaregiverSchema.extend({
  id: z.string(),
  patientId: z.string(),
  isActive: z.boolean(),
  linkedAt: z.string().datetime(),
});

export type LinkCaregiverInput = z.infer<typeof LinkCaregiverSchema>;
export type CaregiverLinkResponse = z.infer<typeof CaregiverLinkResponseSchema>;
