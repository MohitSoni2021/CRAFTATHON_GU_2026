import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const MedicationSchema = z.object({
  userId: z.string().openapi({ example: "60d0fe4f5311236168a109ca" }),
  name: z.string().min(1).openapi({ example: "Metformin" }),
  dosage: z.string().openapi({ example: "500mg" }),
  instructions: z.string().openapi({ example: "Take after lunch" }),
  startDate: z.string().datetime().openapi({ example: "2024-01-01T08:00:00Z" }),
  endDate: z.string().datetime().optional().openapi({ example: "2024-12-31T08:00:00Z" }),
}).openapi({ description: "Schema for medication details" });

export type MedicationInput = z.infer<typeof MedicationSchema>;
