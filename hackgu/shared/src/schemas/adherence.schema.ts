import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const AdherenceReportSchema = z.object({
  userId: z.string().openapi({ example: "60d0fe4f5311236168a109ca" }),
  date: z.string().openapi({ example: "2024-04-10" }),
  totalDoses: z.number().int().nonnegative().openapi({ example: 4 }),
  takenDoses: z.number().int().nonnegative().openapi({ example: 3 }),
  missedDoses: z.number().int().nonnegative().openapi({ example: 1 }),
  adherencePercentage: z.number().min(0).max(100).openapi({ example: 75 }),
}).openapi({ description: "Schema for Adherence Reports" });

export type AdherenceReportInput = z.infer<typeof AdherenceReportSchema>;
