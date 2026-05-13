import { z } from 'zod';
import { generalValidationField } from '../../common';



export const loginSchema = {
    body: z.strictObject({
        email: generalValidationField.email,
        password: generalValidationField.password,
    })
}

export const signupSchema = {
    body: loginSchema.body.safeExtend({
        username: generalValidationField.username,
        confirmPassword: generalValidationField.confirmPassword,
        gender: generalValidationField.gender
    }).superRefine((data, ctx) => {

    if (data.password !== data.confirmPassword) {

        ctx.addIssue({
            code: "custom",
            path: ["confirmPassword"],
            message:
                "Password and confirm password should match"
        })
    }
})
}