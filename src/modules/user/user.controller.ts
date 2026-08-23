import { NextFunction, type Request, Response, Router } from "express";
import {
  MulterEnum,
  RoleEnum,
  successResponse,
  TokenTypeEnums,
} from "../../common";
import UserService from "./user.service";
import { authentication, authorization } from "../../middlewares";
import { cloudFileUpload } from "../../common/utils/multer";

const router = Router();

router.get(
  "/profile",
  authentication(TokenTypeEnums.Access_Token),
  authorization([RoleEnum.User]),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await UserService.GetProfile(req.user);
    return successResponse({ res, data });
  },
);

router.patch(
  "/profile-image",
  authentication(TokenTypeEnums.Access_Token),
  authorization([RoleEnum.User]),
  cloudFileUpload({ storageApproach: MulterEnum.Memory }).single("attachment"),
  async (req: Request, res: Response, next: NextFunction) => {
    // const data = await UserService.ProfileImage(
    //   req.file as Express.Multer.File,
    //   req.user,
    // );
    return successResponse({ res, data: req.file });
  },
);

export default router;
