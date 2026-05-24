import { LoginDto, SignupDto } from "./auth.dto";
import { ILoginResponse } from "./auth.entity";
import { BadRequestException, ConflictException, generateHash, IUser } from "../../common";
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
        const { email, password, username } = data
        const checkUser = await this.userModel.findOne({
            filter: { email },
            projection: { _id: 1, email: 1, username: 1, firstName: 1, lastName: 1 },
            options: { runValidators: true, lean: true },
            populate: [{ path: 'email', select: 'username' }]
        })
        console.log(checkUser)

        if (checkUser) {
            throw new ConflictException("User Already Signedup")
        }

        const result = await this.userModel.createOne({
            data: {
                email: email,
                password: await generateHash({plaintext: password}),
                username: username
            }
        })

        if (!result) {
            throw new BadRequestException("Database Error")
        }

        return result.toJSON()
    }

}

export default new AuthenticationService(); 