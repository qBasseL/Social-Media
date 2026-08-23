import { HydratedDocument } from "mongoose";
import { IUser, MulterEnum, s3service, S3Service } from "../../common";

class UserService {
  private readonly s3: S3Service;
  constructor() {
    this.s3 = s3service;
  }

  public async GetProfile(data: HydratedDocument<IUser>): Promise<any> {
    return data.toJSON();
  }

  public async ProfileImage(
    file: Express.Multer.File,
    user: HydratedDocument<IUser>,
  ) {
    user.profilePicture = await this.s3.uploadAsset({
      File: file,
      Path: `users/${user._id.toString()}/profile`,
      storageApproach: MulterEnum.Disk
    });
    await user.save();
    return user.toJSON();
  }
}

export default new UserService();
