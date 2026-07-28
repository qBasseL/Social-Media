import { NextFunction, Request, Response, Router, type Router as RouterType } from "express";
import AuthenticationService from "./auth.service";
import { successResponse } from "../../common/response";
import * as validators from './auth.validation'
import { authentication, authorization, validation } from "../../middlewares";
import { IUser, RoleEnum, TokenTypeEnums } from "../../common";
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

router.post(
    "/token-rotate",
    authentication(TokenTypeEnums.Refresh_Token),
    authorization([RoleEnum.Admin, RoleEnum.User]),
    async (req, res, next) => {
        const result = await AuthenticationService.rotateToken(req.user, req.decoded as { jti: string, iat: number, sub: string, exp: number });
        return successResponse({ res, statusCode: 201, data: result });
    },
);

router.post(
    "/logout",
    authentication(TokenTypeEnums.Access_Token),
    authorization([RoleEnum.Admin, RoleEnum.User]),
    async (req, res, next) => {
        const result = await AuthenticationService.logout(req.body, req.user, req.decoded as { jti: string, iat: number, sub: string, exp: number });
        return successResponse({ res, statusCode: result });
    },
);

router.post("/signup/gmail", async (req, res, next) => {
    const { status, credentials } = await AuthenticationService.signupWithGmail(
        req.body.idToken,
    );
    return successResponse({ res, statusCode: status, data: credentials });
});

router.post("/login/gmail", async (req, res, next) => {
    const { status, credentials } = await AuthenticationService.loginWithGmail(req.body.idToken);
    return successResponse({ res, statusCode: status, data: credentials });
});

export default router