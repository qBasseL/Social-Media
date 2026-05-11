
import { LoginDto, SignupDto } from "./auth.dto";

export class AuthenticationService {

    constructor() {

    }

    public Login(data: LoginDto): LoginDto {
        // throw new ForbiddenException('Method not implemented.', {cause: {extra: 'Additional error information'}});
        return data;
    }

    public Signup(data: SignupDto): SignupDto {
        return data;
    }

}

export default new AuthenticationService(); 