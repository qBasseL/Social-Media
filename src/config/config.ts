import { config } from "dotenv";
import { resolve } from "node:path";

config({path: resolve('./.env.development')})

export const PORT = process.env.PORT