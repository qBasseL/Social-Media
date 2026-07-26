import type { NextFunction, Request, Response } from "express";
import { TokenService, TokenTypeEnums, UnauthorizedException } from "../common";


export const authentication = (tokenType: TokenTypeEnums = TokenTypeEnums.Access_Token) => {

    const tokenService = new TokenService()

    return async (req: Request, res: Response, next: NextFunction) => {
        const [key, credentials] = req.headers?.authorization?.split(' ') || []
        if (key !== 'Bearer' || !credentials) {
            throw new UnauthorizedException('Missing authorization')
        }

        const { user, decoded } = await tokenService.decodeToken({ token: credentials, tokenType })
        req.user = user;
        req.decoded = decoded

        next()
    }
}