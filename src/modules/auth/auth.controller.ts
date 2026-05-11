import { NextFunction, Request, Response, Router, type Router as RouterType } from "express";
import  AuthenticationService  from "./auth.service";
import { successResponse } from "../../common/response";
import { ILoginResponse, ISignupResponse } from "./auth.entity";
import { signupSchema } from "./auth.validation";
import { BadRequestException } from "../../common";

const router: RouterType = Router()

router.post('/login', (req:Request, res:Response, next:NextFunction): Response => {
    const result = AuthenticationService.Login(req.body)
    return successResponse<ILoginResponse>({res, statusCode: 201, data: result})
}) 

router.post('/signup', (req:Request, res:Response, next:NextFunction): Response => {
    try {
        const data = signupSchema.body.parse(req.body)
    } catch (error) {
        throw new BadRequestException("Validation Error", {error: JSON.parse(error as string)})
    }
    const data = AuthenticationService.Signup(req.body)
    return successResponse<any>({res, statusCode: 201, data})
}) 

export default router