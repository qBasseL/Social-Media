import { AppException } from "./app.exception";

export class BadRequestException extends AppException {
    constructor(message: string = "BadRequest", cause?: unknown) {
        super(message, 400, cause);
    }
}

export class ConflictException extends AppException {
    constructor(message: string = "ConflictRequest", cause?: unknown) {
        super(message, 409, cause);
    }
}

export class NotFoundException extends AppException {
    constructor(message: string = "NotFound", cause?: unknown) {
        super(message, 404, cause);
    }
}

export class UnauthorizedException extends AppException {
    constructor(message: string = "Unauthorized", cause?: unknown) {
        super(message, 401, cause);
    }
}

export class ForbiddenException extends AppException {
    constructor(message: string = "Forbidden", cause?: unknown) {
        super(message, 403, cause);
    }
}