import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { FrequencyType } from "../enums";

extendZodWithOpenApi(z);

export const MedicationScheduleSchema = z.object({
  medicationId: z.string().openapi({ example: "60d0fe4f5311236168a109cb" }),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format").openapi({ example: "08:00" }),
  frequencyType: z.nativeEnum(FrequencyType).openapi({ example: FrequencyType.DAILY }),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional().openapi({ example: [1, 3, 5], description: "0 for Sunday, 1 for Monday, etc. Relevant if frequencyType is CUSTOM" }),
}).openapi({ description: "Schema for medication schedules" });

export type MedicationScheduleInput = z.infer<typeof MedicationScheduleSchema>;
