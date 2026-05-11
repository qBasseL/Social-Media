import { NextFunction, Request, Response, Router, type Router as RouterType } from "express";
import  AuthenticationService  from "./auth.service";
import { successResponse } from "../../common/response";
import { ILoginResponse, ISignupResponse } from "./auth.entity";

const router: RouterType = Router()

router.post('/login', (req:Request, res:Response, next:NextFunction): Response => {
    const result = AuthenticationService.Login(req.body)
    return successResponse<ILoginResponse>({res, statusCode: 201, data: result})
}) 

router.post('/signup', (req:Request, res:Response, next:NextFunction): Response => {
    const data = AuthenticationService.Signup(req.body)
    return successResponse<ISignupResponse>({res, statusCode: 201, data})
}) 

export default router