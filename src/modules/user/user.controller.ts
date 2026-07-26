import { NextFunction, type Request, Response, Router } from "express";
import { RoleEnum, successResponse, TokenTypeEnums } from "../../common";
import UserService from './user.service'
import { authentication, authorization } from "../../middlewares";

const router = Router()

router.get('/profile',
    authentication(TokenTypeEnums.Access_Token),
    authorization([RoleEnum.User]),
    async (req: Request, res: Response, next: NextFunction) => {
        const data = await UserService.GetProfile(req.user)
        return successResponse({ res, data })
    }
)

export default router