import { z } from 'zod';
import { GenderEnum } from '../enums';

export const generalValidationField = {
    email: z.string({ error: "Email is required" }).email({ error: "Invalid email address" }),
    password: z.string({ error: "Password is required" }).min(6, { error: "Password must be at least 6 characters" }).max(100, { error: "Password must be at most 100 characters" }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { error: "Password must contain at least one lowercase letter, one uppercase letter, and one digit" }),
    username: z.string({ error: "Username is required" }).min(2, { error: "Username must be at least 2 characters" }).max(25, { error: "Username must be at most 25 characters" }),
    confirmPassword: z.string(),
    gender: z.enum(GenderEnum)
}


