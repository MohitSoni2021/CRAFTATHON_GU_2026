import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { DoseStatus } from "../enums";

extendZodWithOpenApi(z);

export const DoseLogSchema = z.object({
  medicationId: z.string().openapi({ example: "60d0fe4f5311236168a109cb" }),
  scheduledTime: z.string().datetime().openapi({ example: "2024-04-10T08:00:00Z" }),
  takenTime: z.string().datetime().optional().openapi({ example: "2024-04-10T08:15:00Z" }),
  status: z.nativeEnum(DoseStatus).openapi({ example: DoseStatus.TAKEN }),
  delayMinutes: z.number().int().nonnegative().optional().openapi({ example: 15 }),
}).openapi({ description: "Schema for DoseLogs" });

export type DoseLogInput = z.infer<typeof DoseLogSchema>;
