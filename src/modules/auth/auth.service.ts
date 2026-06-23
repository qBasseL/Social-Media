import { ConfrimEmailDto, LoginDto, ResendConfrimEmailDto, SignupDto } from "./auth.dto";
import { ILoginResponse } from "./auth.entity";
import { BadRequestException, compareHash, ConflictException, createNumberOtp, EmailEnum, generateHash, IUser, NotFoundException, ProviderEnum, redisService, RedisService } from "../../common";
import { UserRepository } from "../../DB";
import { generateDecryption, generateEncryption } from "../../common/utils/security/encryption.security";
import { emailEvent, sendEmail } from "../../common/utils/email";
import { emailTemplate } from "../../common/utils/email/template.email";

export class AuthenticationService {
    private readonly userModel: UserRepository
    private readonly redis: RedisService
    constructor() {
        this.userModel = new UserRepository()
        this.redis = redisService
    }

    private async resendOTP({ email, subject, title }: { email: string, subject: EmailEnum, title: string }) {
        const isBlocked = await this.redis.ttl({ key: this.redis.otpBlockTemplateKey({ email, subject }) });

        if ((isBlocked ?? 0) > 0) {
            throw new BadRequestException("Sorry we can't request another otp rn please try again after 10 minutes",);
        }

        const hashOtp = await this.redis.ttl({ key: this.redis.otpTemplateKey({ email, subject }) });

        if ((hashOtp ?? 0) > 0) {
            throw new BadRequestException("Sorry we can't request another otp rn please try again later",);
        }

        const maxTrial = await this.redis.get({ key: this.redis.otpMaxTrial({ email, subject }) });
        const maxTrialNumber = Number(maxTrial)

        if (maxTrialNumber >= 3) {
            await this.redis.set({
                key: this.redis.otpBlockTemplateKey({ email, subject }),
                value: 1,
                ttl: 600,
            });
            throw new BadRequestException("Can't generate more OTP's right not please try again later",);
        }

        const code = await createNumberOtp();
        await this.redis.set({
            key: this.redis.otpTemplateKey({ email, subject }),
            value: await generateHash({ plaintext: `${code}` }),
            ttl: 300,
        });

        emailEvent.emit("sendEmail", async () => {
            await sendEmail({
                to: email,
                subject,
                html: emailTemplate({ title, code }),
            });

            await this.redis.incr({ key: this.redis.otpMaxTrial({ email, subject }) });
        });
    };

    public async login({ email, password }: LoginDto) {

        const checkUser = await this.userModel.findOne({
            filter: { email, provider: ProviderEnum.System, confirmEmail: { $exists: true } },
            // select:'firstName lastName email',
            options: {
                lean: true,
            },
        });
        if (!checkUser) {
            throw new NotFoundException("Couldn't Find This User");
        }
        if (!checkUser.confirmEmail) {
            throw new ConflictException(
                "Verify your account before you can signin",
            );
        }
        if (checkUser.phone) {
            checkUser.phone = await generateDecryption(checkUser.phone);
        }
        const match = await compareHash({
            plaintext: password,
            ciphertext: checkUser.password,
            // approach: HashApproachEnums.argon2
        });

        if (!match) {
            throw new NotFoundException("Email or password is wrong");
        }

        return createLoginCredentials(checkUser);
    };

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

        const result = await this.userModel.createOne({
            data: {
                email,
                username,
                password: await generateHash({ plaintext: password }),
                ...(phone ? { phone: generateEncryption(phone) } : {})
            }
        })

        if (!result) {
            throw new BadRequestException("Something went wrong")
        }

        await sendEmail({ to: email, subject: "Confirm Email", html: emailTemplate({ code: 342324, title: "Clouven" }) })

        return result.toJSON()
    }

    public async confirmSignup({ email, otp }: ConfrimEmailDto) {

        const checkUser = await this.userModel.findOne({
            filter: {
                email,
                confirmedEmail: { $exists: false },
                provider: ProviderEnum.System,
            },
        });
        if (!checkUser) {
            throw new NotFoundException("User is not found to be verfied");
        }

        const hashOtp = await this.redis.get({
            key: this.redis.otpTemplateKey({ email, subject: EmailEnum.ConfirmEmail }),
        });

        if (!hashOtp) {
            throw new NotFoundException("Didn't find your one time password");
        }

        if (!(await compareHash({ plaintext: otp, ciphertext: hashOtp }))) {
            throw new ConflictException("Invalid OTP");
        }

        checkUser.confirmEmail = new Date();
        await checkUser.save();

        const keysToDelete = await this.redis.keys({
            prefix: this.redis.otpTemplateKey({ email, subject: EmailEnum.ConfirmEmail }),
        }) ?? [];

        if (keysToDelete.length) {
            await this.redis.deletekey({ key: keysToDelete });
        }

        return;
    };

    public async resendConfirmSignup({ email }: ResendConfrimEmailDto) {

        const checkUser = await this.userModel.findOne({
            filter: {
                email,
                confirmedEmail: { $exists: false },
                provider: ProviderEnum.System,
            },
        });
        if (!checkUser) {
            throw new NotFoundException("User is not found to be verfied");
        }

        await this.resendOTP({
            email,
            subject: EmailEnum.ConfirmEmail,
            title: "Verify Email",
        });

        return;
    };

}

export default new AuthenticationService(); 