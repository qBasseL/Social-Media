import { NextFunction, Request, Response } from "express"
import { ForbiddenException, RoleEnum } from "../common"

export const authorization = (roles: RoleEnum[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(req.user.role)) {
            throw new ForbiddenException("You can't access this page")
        }
        next()
    }
}