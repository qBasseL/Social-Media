import {ConfrimEmailDto, LoginDto, ResendConfrimEmailDto, SignupDto} from "./auth.dto";
import {
    BadRequestException,
    compareHash,
    ConflictException,
    createNumberOtp,
    EmailEnum,
    emailEvent,
    generateHash,
    IUser,
    LogoutEnums,
    NotFoundException,
    ProviderEnum,
    redisService,
    RedisService,
    sendEmail,
    TokenService
} from "../../common";
import {UserRepository} from "../../DB";
import {generateDecryption, generateEncryption} from "../../common/utils/security/encryption.security";
import {emailTemplate} from "../../common/utils/email/template.email";
import {ILoginResponse} from "./auth.entity";
import {ACCESS_TOKEN_EXPIRES_IN, WEB_CLIENT_ID} from "../../config/config";
import {HydratedDocument} from "mongoose";
import {OAuth2Client} from "google-auth-library";


export class AuthenticationService {
    private readonly userModel: UserRepository
    private readonly redis: RedisService
    private readonly tokenService: TokenService
    constructor() {
        this.userModel = new UserRepository()
        this.tokenService = new TokenService()
        this.redis = redisService
    }

    private async verifyGoogleAccount(idToken: string) {
        const client = new OAuth2Client(WEB_CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: WEB_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload?.email_verified) {
            throw new BadRequestException("Can't use this email");
        }

        return payload;
    };

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

    public async Login({ email, password }: LoginDto): Promise<ILoginResponse> {

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
                "Verify your account before you can sign in",
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

        return await this.tokenService.createLoginCredentials(checkUser);
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
            throw new ConflictException("User Already Signed up")
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

        await sendEmail({ to: email, subject: "Confirm Email", html: emailTemplate({ code: await createNumberOtp(), title: "Social Media" }) })

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
            throw new NotFoundException("User is not found to be verified");
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
            await this.redis.deleteKey({key: keysToDelete});
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
            throw new NotFoundException("User is not found to be verified");
        }

        await this.resendOTP({
            email,
            subject: EmailEnum.ConfirmEmail,
            title: "Verify Email",
        });

        return;
    };

    public async logout({ flag }: { flag: LogoutEnums },
        user: HydratedDocument<IUser>,
        { jti, iat, sub, exp }: { jti: string, iat: number, sub: string, exp: number }): Promise<number> {

        let status = 200;

        switch (flag) {
            case LogoutEnums.All:
                user.changeCredentialTime = new Date();
                await user.save();
                await this.redis.deleteKey({
                    key: await this.redis.keys({
                        prefix: this.redis.baseRevokeTokenKey({ userId: sub }),
                    }) as string[],
                });
                break;

            default:
                await this.redis.set({
                    key: this.redis.revokeTokenKey({ userId: sub, jti }),
                    value: jti,
                    ttl: exp - Math.floor(Date.now() / 1000),
                });
                status = 201;
                break;
        }

        return status;
    };


    public async rotateToken(user: HydratedDocument<IUser>,
        { jti, iat, sub, exp }: { jti: string, iat: number, sub: string, exp: number }) {

        if ((iat + ACCESS_TOKEN_EXPIRES_IN) * 1000 > Date.now() + 30000) {
            throw new ConflictException(
                "Current access token is still valid",
            );
        }
        await this.redis.set({
            key: this.redis.revokeTokenKey({ userId: sub, jti }),
            value: jti,
            ttl: exp - Math.floor(Date.now() / 1000),
        });
        return this.tokenService.createLoginCredentials(user);
    };

    public async signupWithGmail(idToken: string) {
        const payload = await this.verifyGoogleAccount(idToken);

        const checkUser = await this.userModel.findOne({
            filter: {
                email: payload.email!,
                provider: ProviderEnum.Google
            },
        });

        if (checkUser) {
            if (checkUser.provider !== ProviderEnum.Google) {
                throw new ConflictException("Try to login with Google");
            }
            return await this.loginWithGmail(idToken);
        }

        const user = await this.userModel.createOne({
            data: {
                firstName: payload.given_name!,
                lastName: payload.family_name || "empty",
                email: payload.email!,
                profilePicture: payload.picture!,
                confirmEmail: new Date(),
                provider: ProviderEnum.Google,
            },
        });

        return { status: 201, credentials: await this.tokenService.createLoginCredentials(user) };
    };

    public async loginWithGmail(idToken: string) {
        const payload = await this.verifyGoogleAccount(idToken);

        const checkUser = await this.userModel.findOne({
            filter: {
                email: payload.email!,
                provider: ProviderEnum.Google,
            },
            options: {
                lean: true,
            },
        });

        if (!checkUser) {
            throw new NotFoundException(
                "This Account is not found",
            );
        }

        if (checkUser.provider !== ProviderEnum.Google) {
            throw new ConflictException(
                "Try logging in with your normal credentials.",
            );
        }

        return {
            status: 200,
            credentials: await this.tokenService.createLoginCredentials(checkUser),
        };
    };

}

export default new AuthenticationService(); 