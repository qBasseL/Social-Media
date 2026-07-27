import { z } from 'zod';
import { generalValidationField } from '../../common';



export const resendConfirmEmail = {
    body: z.strictObject({
        email: generalValidationField.email,
    })
}

export const confirmEmail = {
    body: resendConfirmEmail.body.safeExtend({
        otp: generalValidationField.otp
    })
}

export const loginSchema = {
    body: resendConfirmEmail.body.safeExtend({
        password: generalValidationField.password,
    })
}

export const signupSchema = {
    body: loginSchema.body.safeExtend({
        username: generalValidationField.username,
        confirmPassword: generalValidationField.confirmPassword,
        phone: generalValidationField.phone.optional()
        // gender: generalValidationField.gender
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