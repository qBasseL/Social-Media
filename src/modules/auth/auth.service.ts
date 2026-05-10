import { LoginDto } from "./auth.dto";

export class AuthenticationService {

    constructor() {

    }

    public Login(data: LoginDto): any {
        // throw new ForbiddenException('Method not implemented.', {cause: {extra: 'Additional error information'}});
        return data;
    }
}

export default new AuthenticationService(); 