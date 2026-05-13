import { NextFunction, Request, Response, Router, type Router as RouterType } from "express";
import AuthenticationService from "./auth.service";
import { successResponse } from "../../common/response";
import { ILoginResponse, ISignupResponse } from "./auth.entity";
import * as validators from './auth.validation'
import { validation } from "../../middlewares";



const router: RouterType = Router()

router.post('/login', validation(validators.loginSchema), async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const data = AuthenticationService.Login(req.body)
    return successResponse<ILoginResponse>({ res, statusCode: 201, data })
})

router.post('/signup', validation(validators.signupSchema), async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const data = AuthenticationService.Signup(req.body)
    return successResponse<ISignupResponse>({ res, statusCode: 201, data })
})

export default router