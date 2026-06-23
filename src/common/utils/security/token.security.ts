import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, SYSTEM_TOKEN_ACCESS_SECRET_KEY, SYSTEM_TOKEN_REFRESH_SECRET_KEY, TOKEN_ACCESS_SECRET_KEY, TOKEN_REFRESH_SECRET_KEY } from '../../../config/config'
import { randomUUID } from 'node:crypto'
import { TokenTypeEnums } from '../../enums/token.enum'
import { BadRequestException, NotFoundException, UnauthorizedException } from '../../exceptions'
import { RoleEnum } from '../../enums'
import { redisService, RedisService } from '../../services'
import { UserRepository } from '../../../DB'
import { ILoginResponse } from '../../../modules/auth/auth.entity'

type SignatureType = {accessSignature: string, refreshSignature: string}

export class TokenService {
    private readonly redis: RedisService
    private readonly UserModel: UserRepository
    constructor() {
        this.redis = redisService
        this.UserModel = new UserRepository()
     }

    public Sign({ payload, secret = TOKEN_ACCESS_SECRET_KEY, options }: {
        payload: object,
        secret: string,
        options?: SignOptions
    }): string {
        return jwt.sign(payload, secret, options)
    }

    public Verify({ token, secret = TOKEN_ACCESS_SECRET_KEY }: {
        token: string,
        secret: string,
    }): JwtPayload | string {
        return jwt.verify(token, secret)
    }

    public async detectSignatureLevels (level: RoleEnum): Promise<SignatureType>  {
        let signature : SignatureType ;

        switch (level) {
            case RoleEnum.Admin:
                signature = {
                    accessSignature: SYSTEM_TOKEN_ACCESS_SECRET_KEY,
                    refreshSignature: SYSTEM_TOKEN_REFRESH_SECRET_KEY,
                };
                break;

            default:
                signature = {
                    accessSignature: TOKEN_ACCESS_SECRET_KEY,
                    refreshSignature: TOKEN_REFRESH_SECRET_KEY,
                };
                break;
        }

        return signature;
    };

    public async decodeToken  ({
        token,
        tokenType = TokenTypeEnums.Access_Token,
    }: {token: string, tokenType: TokenTypeEnums}){
        const decoded = jwt.decode(token) as JwtPayload;

        if (!decoded || typeof decoded === "string") {
            throw new NotFoundException( "Invalid Token Payload" );
        }
        const { accessSignature, refreshSignature } = await this.detectSignatureLevels(
            decoded.role,
        );

        const secretKey = tokenType === TokenTypeEnums.Access_Token ? accessSignature : refreshSignature;
        let verifiedData: JwtPayload;

        try {
            verifiedData = this.Verify({
                token: token,
                secret: secretKey,
            }) as JwtPayload;
        } catch (error) {
            throw new NotFoundException("Wrong Token");
        }

        if (verifiedData.type !== tokenType) {
            throw new NotFoundException("Invalid Token Type");
        }

        if (
            decoded.jti &&
            (await this.redis.get({
                key: this.redis.revokeTokenKey({ userId: decoded.sub as string, jti: decoded.jti as string }),
            }))
        ) {
            throw new UnauthorizedException("Invalid Login Session" );
        }

        const user = await this.UserModel.findOne({
            filter: {
                _id: verifiedData.sub,
            },
        });

        if (!user) {
            throw new NotFoundException( "Couldn't find that user" );
        }

        if(!decoded.iat) {
            throw new BadRequestException("Something Went Wrong")
        }

        if (
            user.changeCredentialTime &&
            user.changeCredentialTime?.getTime() >= decoded.iat * 1000
        ) {
            throw new UnauthorizedException("Invalid Login Session");
        }

        return { user, decoded };
    };

    public createLoginCredentials(user: any): ILoginResponse {

        const jwtid = randomUUID();

        const access_token = this.Sign({
            payload: { sub: user._id, role: user.role, type: "access" },
            secret: TOKEN_ACCESS_SECRET_KEY,
            options: {
                expiresIn: ACCESS_TOKEN_EXPIRES_IN,
                issuer: "bassel-api",
                audience: [user.role],
                jwtid,
            },
        });

        const refresh_token = this.Sign({
            payload: { sub: user._id, role: user.role, type: "refresh" },
            secret: TOKEN_REFRESH_SECRET_KEY,
            options: {
                expiresIn: REFRESH_TOKEN_EXPIRES_IN,
                issuer: "bassel-api",
                audience: [user.role],
                jwtid,
            },
        });

        return { Access_Token: access_token, Refresh_Token: refresh_token };
    }

}