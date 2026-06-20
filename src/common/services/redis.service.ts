import { createClient, RedisClientType } from "redis";
import { REDIS_URI } from "../../config/config";
import { EmailEnum } from "../enums";
import { Types } from "mongoose";


type RedisKeyType = { email: string, subject?: EmailEnum }

export class RedisService {
    private readonly client: RedisClientType
    constructor() {
        this.client = createClient({ url: REDIS_URI })
        this.handleEvent()
    }

    private handleEvent() {
        this.client.on('error', (error) => {
            console.log(`Couldn't connect to redis, ${error}`)
        })
    }

    public async connectRedis() {

        try {
            await this.client.connect()
            console.log(`Connected to redis successfully`)
        } catch (error) {
            console.error('Something went wrong with redis connection')
        }
    }

    public baseRevokeTokenKey = ({ userId }: { userId: Types.ObjectId | string }): string => {
        return `RevokeToken::${userId}`;
    };

    public revokeTokenKey = ({ userId, jti }: { userId: Types.ObjectId | string, jti: string }): string => {
        return `${this.baseRevokeTokenKey({ userId })}::${jti}`;
    };

    public otpTemplateKey = ({ email, subject = EmailEnum.ConfirmEmail }: RedisKeyType): string => {
        return `OTP::User::${email}::${subject}`;
    };

    public otpBlockTemplateKey = ({ email, subject = EmailEnum.ConfirmEmail }: RedisKeyType): string => {
        return `${this.otpTemplateKey({ email, subject })}::Block`;
    };

    public otpMaxTrial = ({ email, subject = EmailEnum.ConfirmEmail }: RedisKeyType): string => {
        return `${this.otpTemplateKey({ email, subject })}::MaxTrial`;
    };

    public set = async ({ key, value, ttl }: { key: string, value: any, ttl?: number | undefined }): Promise<string | null> => {
        try {
            let data = typeof value === "string" ? value : JSON.stringify(value);
            return ttl
                ? await this.client.set(key, data, { EX: ttl })
                : await this.client.set(key, data);
        } catch (error) {
            console.log(`Failed in redis set operation ${error}`);
            return null
        }
    };

    public update = async ({ key, value, ttl }: { key: string, value: string | object, ttl?: number | undefined }): Promise<string | null | number> => {
        try {
            if (!(await this.exists({ key }))) {
                return 0;
            }
            return await this.set({ key, value, ttl });
        } catch (error) {
            console.log(`Failed in redis update operation ${error}`);
            return null
        }
    };

    public get = async ({ key }: { key: string }): Promise<string | number | null> => {
        try {
            try {
                return JSON.parse(await this.client.get(key) as string);
            } catch (error) {
                return await this.client.get(key)
            }
        } catch (error) {
            console.log(`Failed in redis get operation ${error}`);
            return null
        }
    };

    public ttl = async ({ key }: { key: string }): Promise<number | null> => {
        try {
            if (!(await this.exists({ key }))) {
                return 0;
            }
            return await this.client.ttl(key);
        } catch (error) {
            console.log(`Failed in redis ttl operation ${error}`);
            return null
        }
    };

    public exists = async ({ key }: { key: string }): Promise<number | null> => {
        try {
            return await this.client.exists(key);
        } catch (error) {
            console.log(`Failed in redis exists operation ${error}`);
            return null
        }
    };

    public expire = async ({ key, ttl }: { key: string, ttl: number }): Promise<number | null> => {
        try {
            return await this.client.expire(key, ttl);
        } catch (error) {
            console.log(`Failed in redis expire operation ${error}`);
            return null
        }
    };

    public mGet = async ({ keys = [] }: { keys: string[] }): Promise<(string | null)[] | number | null> => {
        try {
            if (!keys.length) {
                return 0;
            }
            return await this.client.mGet(keys);
        } catch (error) {
            console.log(`Failed in redis mGet operation ${error}`);
            return null
        }
    };

    public keys = async ({ prefix }: { prefix: string }): Promise<string[] | null> => {
        try {
            return await this.client.keys(`${prefix}*`);
        } catch (error) {
            console.log(`Failed in redis keys operation ${error}`);
            return null
        }
    };

    public deletekey = async ({ key }: { key: string | string[] }): Promise<number> => {
        try {
            if (Array.isArray(key)) {
                if (!key.length) return 0;
                return await this.client.del(key as string[]);
            }
            return await this.client.del(key);
        } catch (error) {
            console.log(`Failed in redis delete operation ${error}`);
            return 0
        }
    };

    public incr = async ({ key }: { key: string }): Promise<number | null> => {
        try {
            return await this.client.incr(key);
        } catch (error) {
            console.log(`Failed in redis incr operation ${error}`);
            return null
        }
    };


}

export const redisService = new RedisService()