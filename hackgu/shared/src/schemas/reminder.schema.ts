import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { ReminderType } from "../enums";

extendZodWithOpenApi(z);

export const ReminderSchema = z.object({
  userId: z.string().openapi({ example: "60d0fe4f5311236168a109ca" }),
  medicationId: z.string().openapi({ example: "60d0fe4f5311236168a109cb" }),
  reminderTime: z.string().datetime().openapi({ example: "2024-04-10T07:45:00Z" }),
  type: z.nativeEnum(ReminderType).openapi({ example: ReminderType.BEFORE }),
}).openapi({ description: "Schema for Reminders" });

export type ReminderInput = z.infer<typeof ReminderSchema>;
