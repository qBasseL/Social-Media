
import { LoginDto, SignupDto } from "./auth.dto";
import { ILoginResponse, ISignupResponse } from "./auth.entity";

export class AuthenticationService {

    constructor() {

    }

    public Login(data: LoginDto): ILoginResponse {
        return data;
    }

    public Signup(data: SignupDto): ISignupResponse {
        return data;
    }

}

export default new AuthenticationService(); 