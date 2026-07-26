import { Request } from "express";
import { HydratedDocument } from "mongoose";
import { IUser } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";

export interface IRequest extends Request {
    user: HydratedDocument<IUser>
    decoded: JwtPayload
}