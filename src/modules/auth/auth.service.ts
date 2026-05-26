import { LoginDto, SignupDto } from "./auth.dto";
import { ILoginResponse } from "./auth.entity";
import { BadRequestException, ConflictException, generateHash, IUser } from "../../common";
import { UserRepository } from "../../DB";
import { generateEncryption } from "../../common/utils/security/encryption.security";
import { sendEmail } from "../../common/utils/email";
import { emailTemplate } from "../../common/utils/email/template.email";

export class AuthenticationService {
    private readonly userModel: UserRepository
    constructor() {
        this.userModel = new UserRepository()
    }

    public Login(data: LoginDto): ILoginResponse {
        return data;
    }

    public async Signup(data: SignupDto): Promise<IUser> {
        const { email, password, username, phone } = data
        const checkUser = await this.userModel.findOne({
            filter: { email },
            projection: { _id: 1, email: 1, username: 1, firstName: 1, lastName: 1 },
            options: { runValidators: true, lean: true },
            populate: [{ path: 'email', select: 'username' }]
        })

        if (checkUser) {
            throw new ConflictException("User Already Signedup")
        }

        const userData: Partial<IUser> = {
            email,
            password: await generateHash({ plaintext: password }),
            username,
            ...(phone ? { phone: generateEncryption(phone) } : {})
        }

        const result = await this.userModel.createOne({
            data: userData
        })

        if (!result) {
            throw new BadRequestException("Database Error")
        }

        await sendEmail({ to: email, subject: "Confirm Email", html: emailTemplate({ code: 342324, title: "Clouven" }) })

        return result.toJSON()
    }

}

export default new AuthenticationService(); 