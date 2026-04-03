import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Role } from "../enums";

extendZodWithOpenApi(z);

/**
 * Schema for linking a caregiver to a patient.
 */
export const LinkCaregiverSchema = z.object({
  patientId: z.string().openapi({ example: "64f1a2b3c4d5e6f7a8b9c0d1" }),
}).openapi({ description: "Link caregiver to a patient by patient ID" });

/**
 * Schema for a public user response (no password).
 */
export const UserResponseSchema = z.object({
  id: z.string().openapi({ example: "64f1a2b3c4d5e6f7a8b9c0d1" }),
  name: z.string().openapi({ example: "John Doe" }),
  email: z.string().email().openapi({ example: "john@example.com" }),
  role: z.nativeEnum(Role).openapi({ example: Role.PATIENT }),
  isActive: z.boolean().openapi({ example: true }),
}).openapi({ description: "Public user profile" });

export type LinkCaregiverInput = z.infer<typeof LinkCaregiverSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
