import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const LoginSchema = z.object({
  email: z.string().email().openapi({ example: "user@example.com" }),
  password: z.string().min(6).openapi({ example: "password123" }),
}).openapi({ description: "Login credentials" });

export const RegisterSchema = z.object({
  name: z.string().min(2).openapi({ example: "John Doe" }),
  email: z.string().email().openapi({ example: "john@example.com" }),
  password: z.string().min(6).openapi({ example: "secret123" }),
}).openapi({ description: "Register details" });

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
