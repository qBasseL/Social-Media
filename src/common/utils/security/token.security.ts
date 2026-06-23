import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import { TOKEN_ACCESS_SECRET_KEY } from '../../../config/config'

export class TokenService {
    constructor() { }

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
}   