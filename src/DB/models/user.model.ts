import { model, models, Schema } from "mongoose";
import { BadRequestException, IUser } from "../../common";
import {
  GenderEnum,
  RoleEnum,
  ProviderEnum,
} from "../../common/enums/user.enum";

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    slug: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    password: {
      type: String,
      required: function (this) {
        return this.provider === ProviderEnum.System;
      },
    },
    profilePicture: { type: String },
    profileCoverPicture: { type: [String] },
    gender: { type: Number, enum: GenderEnum, default: GenderEnum.Male },
    role: { type: Number, enum: RoleEnum, default: RoleEnum.User },
    provider: {
      type: Number,
      enum: ProviderEnum,
      default: ProviderEnum.System,
    },
    changeCredentialTime: { type: Date },
    DOB: { type: Date },
    confirmEmail: { type: Date },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "Users",
  },
);

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ") || [];
    this.firstName = firstName as string;
    this.lastName = lastName as string;
    this.slug = value.replaceAll(/\s+/g, "-");
  })
  .get(function () {
    return this.firstName + " " + this.lastName;
  });

userSchema.pre("validate", function () {
  if (this.password && this.provider === ProviderEnum.Google) {
    throw new BadRequestException("Google Provider Can't Hold Passwords");
  }
});

userSchema.post("validate", function () {
  if (!this.slug || this.slug.includes(" ")) {
    throw new BadRequestException("Wrong slug format");
  }
});

export const UserModel = models.User || model<IUser>("User", userSchema);
