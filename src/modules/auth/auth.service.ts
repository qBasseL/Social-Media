
export class AuthenticationService {

    constructor() {

    }

    public Login(data: string): string {
        throw new Error('Method not implemented.', {cause: {statusCode: 400}});
        return 'lol';
    }
}

export default new AuthenticationService(); 