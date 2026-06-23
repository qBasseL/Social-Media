import { NextFunction, Request, Response, Router, type Router as RouterType } from "express";
import AuthenticationService from "./auth.service";
import { successResponse } from "../../common/response";
import * as validators from './auth.validation'
import { validation } from "../../middlewares";
import { IUser } from "../../common";
import { ILoginResponse } from "./auth.entity";



const router: RouterType = Router()

router.post('/signup', validation(validators.signupSchema), async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const data = await AuthenticationService.Signup(req.body)
    return successResponse<IUser>({ res, statusCode: 201, data })
})

router.patch("/confirm-email", validation(validators.confirmEmail), async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const result = await AuthenticationService.confirmSignup(req.body);
    return successResponse({ res, statusCode: 200, data: result });
});

router.patch("/resend-confirm-email", validation(validators.resendConfirmEmail), async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    const result = await AuthenticationService.resendConfirmSignup(req.body);
    return successResponse({ res, statusCode: 200, data: result });
});

router.post("/login", validation(validators.loginSchema), async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const result = await AuthenticationService.Login(req.body);
  return successResponse<ILoginResponse>({ res, statusCode: 200, data: result });
});

export default router