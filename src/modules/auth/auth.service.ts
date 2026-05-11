
import { LoginDto, SignupDto } from "./auth.dto";
import { ISignupResponse } from "./auth.entity";

export class AuthenticationService {

    constructor() {

    }

    public Login(data: LoginDto): LoginDto {
        return data;
    }

    public Signup(data: SignupDto): ISignupResponse {
        return { _id: "2313", ...data };
    }

}

export default new AuthenticationService(); 