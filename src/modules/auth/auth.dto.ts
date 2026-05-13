import { z } from "zod";
import { loginSchema, signupSchema } from "./auth.validation";

export type LoginDto = z.infer<typeof loginSchema.body>

export type SignupDto = z.infer<typeof signupSchema.body>