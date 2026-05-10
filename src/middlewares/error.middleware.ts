import type { NextFunction, Request, Response } from "express";

export const GlobalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): Response => {
    const status = (err.cause as any)?.statusCode || 500;
    return res.status(status).json({ message: 'An error occurred', error: err.message, stack: err.stack, cause: err.cause })
}