import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { UserRole } from "./enums";

extendZodWithOpenApi(z);

export const LoginSchema = z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
  password: z.string().min(6).openapi({ example: "password123" }),
}).openapi({ description: "Login credentials" });

export const RegisterSchema = z.object({
  name: z.string().min(2).openapi({ example: "John Doe" }),
  email: z.string().email().openapi({ example: "john@example.com" }),
  password: z.string().min(6).openapi({ example: "secret123" }),
  role: z.nativeEnum(UserRole).default(UserRole.PATIENT).openapi({ example: UserRole.PATIENT }),
  phone: z.string().optional().openapi({ example: "+91 9876543210" }),
  timezone: z.string().default("Asia/Kolkata").openapi({ example: "Asia/Kolkata" }),
}).openapi({ description: "Register details" });

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.nativeEnum(UserRole),
    phone: z.string().optional(),
    timezone: z.string(),
    adherenceScore: z.number().optional(),
  }),
}).openapi({ description: "Auth Response Payload" });

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
