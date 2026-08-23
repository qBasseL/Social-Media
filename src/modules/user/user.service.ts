import { HydratedDocument } from "mongoose";
import { IUser } from "../../common";

class UserService {
  constructor() {}

  public async GetProfile(data: HydratedDocument<IUser>): Promise<any> {
    return data.toJSON();
  }

  public async ProfileImage(
    file: Express.Multer.File,
    user: HydratedDocument<IUser>,
  ) {
    return user.toJSON();
  }
}

export default new UserService();
