import { config } from "dotenv";
import { resolve } from "node:path";


config({ path: resolve(`./.env.${process.env.NODE_ENV}`) })

export const PORT = process.env.PORT;
export const DB_URI = process.env.DB_URI as string
export const SALT_ROUND = process.env.SALT_ROUND;
export const IV_LENGTH = process.env.IV_LENGTH
export const ENC_SECRET_KEY = Buffer.from(process.env.ENC_SECRET_KEY!, 'hex')
export const TOKEN_ACCESS_SECRET_KEY = process.env.TOKEN_ACCESS_SECRET_KEY as string
export const TOKEN_REFRESH_SECRET_KEY = process.env.TOKEN_REFRESH_SECRET_KEY as string
export const SYSTEM_TOKEN_ACCESS_SECRET_KEY = process.env.SYSTEM_TOKEN_ACCESS_SECRET_KEY as string
export const SYSTEM_TOKEN_REFRESH_SECRET_KEY = process.env.SYSTEM_TOKEN_REFRESH_SECRET_KEY as string
export const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN!);
export const REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN!);
export const WEB_CLIENT_ID = process.env.WEB_CLIENT_ID as string
export const REDIS_URI = process.env.REDIS_URI as string
export const GOOGLE_APP_PASSWORD = process.env.GOOGLE_APP_PASSWORD as string
export const GOOGLE_APP_EMAIL = process.env.GOOGLE_APP_EMAIL as string
