import { NextFunction, Request, Response } from "express"
import { BadRequestException } from "../common"
import { ZodError, ZodType } from "zod";

type KeyReqType = keyof Request;
type SchemaType = Partial<Record<KeyReqType, ZodType>>
type IssuesType = Array<{
    key: KeyReqType,
    issues: Array<{
        message: string
        path: Array<(string | symbol | null | undefined | number)>,
    }>
}>

export const validation = (schema: SchemaType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const issues: IssuesType = []
        for (const key of Object.keys(schema) as KeyReqType[]) {
            if (!schema[key]) continue;
            const validationResult = await schema[key].safeParseAsync(req[key])
            if (!validationResult.success) {
                const errors = validationResult.error as ZodError
                issues.push({ key, issues: errors.issues.map((issue) => { return { path: issue.path, message: issue.message, key } }) })
            }
        }
        if (issues.length) {
            throw new BadRequestException('Validation Error',  issues )
        }
        next()
    }
}