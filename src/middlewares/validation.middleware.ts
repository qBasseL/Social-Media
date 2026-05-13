import { NextFunction, Request, Response } from "express"
import { BadRequestException } from "../common"

export const validation = (schema: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const validationResult = await schema.body.safeParseAsync(req.body)
        if (!validationResult.success) {
            throw new BadRequestException("Validation Error", { error: JSON.parse(validationResult.error) })
        }
        next()
    }
}