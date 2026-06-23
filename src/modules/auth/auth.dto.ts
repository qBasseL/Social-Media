import { z } from "zod";
import { confirmEmail, loginSchema, resendConfirmEmail, signupSchema } from "./auth.validation";

export type LoginDto = z.infer<typeof loginSchema.body>

export type SignupDto = z.infer<typeof signupSchema.body>

export type ConfrimEmailDto = z.infer<typeof confirmEmail.body>

export type ResendConfrimEmailDto = z.infer<typeof resendConfirmEmail.body>
