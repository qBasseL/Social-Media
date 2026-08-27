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
    {
      originalName,
      ContentType,
    }: { originalName: string; ContentType: string },
    user: HydratedDocument<IUser>,
  ): Promise<{ user: IUser; url: string }> {
    const { url, key } = await this.s3.generatePreSignedLink({
      Path: `users/${user._id.toString()}/profile`,
      ContentType,
      originalName,
    });

    user.profilePicture = key as string;
    await user.save();
    return { user, url };
  }

  public async ProfileCoverImage(
    file: Express.Multer.File[],
    user: HydratedDocument<IUser>,
  ) {
    user.profileCoverPicture = await this.s3.uploadAssets({
      Files: file,
      Path: `users/${user._id.toString()}/profile-cover`,
      storageApproach: MulterEnum.Memory,
    });
    await user.save();
    return user.toJSON();
  }
}

export default new UserService();
