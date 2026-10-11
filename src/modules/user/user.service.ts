import {HydratedDocument} from "mongoose";
import {BadRequestException, IUser, MulterEnum, s3service, S3Service} from "../../common";

class UserService {
  private readonly s3: S3Service;
  constructor() {
    this.s3 = s3service;
  }

  public async GetProfile(data: HydratedDocument<IUser>): Promise<any> {
    return data.toJSON();
  }

  public async ProfileImage(
      data: { originalName: string; ContentType: string } | undefined,
    user: HydratedDocument<IUser>,
  ): Promise<{ user: IUser; url: string }> {
    if (
        !data ||
        typeof data.originalName !== "string" ||
        !data.originalName.trim() ||
        typeof data.ContentType !== "string" ||
        !data.ContentType.trim()
    ) {
      throw new BadRequestException(
          "Send a JSON body with originalName and ContentType using Content-Type: application/json",
      );
    }
    const {originalName, ContentType} = data;
    const oldPic = user.profilePicture
    const { url, key } = await this.s3.generatePreSignedLink({
      Path: `users/${user._id.toString()}/profile`,
      ContentType,
      originalName,
    });

    user.profilePicture = key as string;
    console.log(oldPic);

    if (oldPic) {
      await this.s3.deleteAsset({Key: oldPic})
    }
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

    const oldPics = user.profileCoverPicture

    if (oldPics?.length) {
      await this.s3.deleteAssets({
        Keys: oldPics.map((ele) => {
          return {Key: ele}
        })
      })
    }
    await user.save();
    return user.toJSON();
  }
}

export default new UserService();
