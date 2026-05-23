import { model, models, Schema } from "mongoose"
import { GenderEnum, IUser, ProviderEnum, RoleEnum } from "../../common"


const userSchema = new Schema<IUser>({

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: {
        type: String, required: function (this) {
            return this.provider === ProviderEnum.System
        }
    },
    profilePicture: { type: String },
    profileCoverPicture: { type: [String] },
    gender: { type: Number, enum: GenderEnum, default: GenderEnum.Male },
    role: { type: Number, enum: RoleEnum, default: RoleEnum.User },
    provider: { type: Number, enum: ProviderEnum, default: ProviderEnum.System },
    changeCredentialTime: { type: Date },
    DOB: { type: Date },
    confirmEmail: { type: Date },

}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: "Users"
})

export const UserModel = models.User || model<IUser>("User", userSchema)