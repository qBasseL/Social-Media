import { z } from 'zod';

export const signupSchema = {
    body: z.object({
        username: z.string().min(2).max(25),
        email: z.email(),
        password: z.string()
    })
}