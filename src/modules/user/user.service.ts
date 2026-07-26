import { HydratedDocument } from "mongoose"
import { IUser } from "../../common"

class UserService {

    constructor() { }

    public async GetProfile(data: HydratedDocument<IUser>): Promise<any> {
        return Promise.resolve(true)
    }

}

export default new UserService()