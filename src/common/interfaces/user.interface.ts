import { GenderEnum, ProviderEnum, RoleEnum } from "../enums";

export interface IUser {
  firstName: string;
  lastName: string;
  username?: string;
  slug: string;
  email: string;
  phone?: string;
  password?: string;
  profilePicture?: string;
  profileCoverPicture?: string[];
  gender: GenderEnum;
  role: RoleEnum;
  provider: ProviderEnum;
  changeCredentialTime?: Date;
  DOB?: Date;
  confirmEmail?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
