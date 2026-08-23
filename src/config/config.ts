import { config } from "dotenv";
import { resolve } from "node:path";


config({ path: resolve(`./.env.${process.env.NODE_ENV}`) })

export const NODE_ENV = process.env.NODE_ENV as string

export const PORT = process.env.PORT;
export const DB_URI = process.env.DB_URI as string
export const SALT_ROUND = Number(process.env.SALT_ROUND as string);
export const IV_LENGTH = Number(process.env.IV_LENGTH as string)
export const ENC_SECRET_KEY = Buffer.from(process.env.ENC_SECRET_KEY!, 'hex')
export const TOKEN_ACCESS_SECRET_KEY = process.env.TOKEN_ACCESS_SECRET_KEY as string
export const TOKEN_REFRESH_SECRET_KEY = process.env.TOKEN_REFRESH_SECRET_KEY as string
export const SYSTEM_TOKEN_ACCESS_SECRET_KEY = process.env.SYSTEM_TOKEN_ACCESS_SECRET_KEY as string
export const SYSTEM_TOKEN_REFRESH_SECRET_KEY = process.env.SYSTEM_TOKEN_REFRESH_SECRET_KEY as string
export const ACCESS_TOKEN_EXPIRES_IN = Number(process.env.ACCESS_TOKEN_EXPIRES_IN!);
export const REFRESH_TOKEN_EXPIRES_IN = Number(process.env.REFRESH_TOKEN_EXPIRES_IN!);
export const WEB_CLIENT_ID = process.env.WEB_CLIENT_ID as string
export const REDIS_URI = process.env.REDIS_URI as string
export const GOOGLE_APP_PASSWORD = process.env.GOOGLE_APP_PASSWORD as string
export const GOOGLE_APP_EMAIL = process.env.GOOGLE_APP_EMAIL as string
export const APP_NAME = process.env.APP_NAME as string
export const AWS_REGION = process.env.AWS_REGION as string
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME as string
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY as string
export const AWS_EXPIRES_IN = Number(process.env.AWS_EXPIRES_IN as string)
export const APPLICATION_NAME = process.env.APPLICATION_NAME as string







