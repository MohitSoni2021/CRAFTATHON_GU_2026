import { z } from 'zod';
import { NotifType } from './enums';

export const MarkReadRequestSchema = z.object({
  notificationIds: z.array(z.string()),
});

export const NotificationResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.nativeEnum(NotifType),
  medicationId: z.string().optional(),
  message: z.string(),
  isRead: z.boolean(),
  scheduledAt: z.string().datetime(),
  sentAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
});

export type MarkReadInput = z.infer<typeof MarkReadRequestSchema>;
export type NotificationResponse = z.infer<typeof NotificationResponseSchema>;
