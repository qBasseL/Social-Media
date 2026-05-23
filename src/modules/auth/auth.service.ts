import { Model } from "mongoose";
import { LoginDto, SignupDto } from "./auth.dto";
import { ILoginResponse } from "./auth.entity";
import { BadRequestException, IUser } from "../../common";
import { UserModel } from "../../DB/models/user.model";
import { UserRepository } from "../../DB";

export class AuthenticationService {
    private userModel: UserRepository
    constructor() {
        this.userModel = new UserRepository()
    }

    public Login(data: LoginDto): ILoginResponse {
        return data;
    }

    public async Signup(data: SignupDto): Promise<IUser> {
        const [result] = await this.userModel.create({
            data: [data]
        })

        if(!result) {
            throw new BadRequestException("Database Error")
        }

        return result.toJSON()
    }

}

export default new AuthenticationService(); 