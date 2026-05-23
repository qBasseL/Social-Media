import { IUser } from "../../common";
import { UserModel } from "../models/user.model";
import { DatabaseRepository } from "./base.repository";

export class UserRepository extends DatabaseRepository<IUser> {
    constructor() {
        super(UserModel)
    }
}