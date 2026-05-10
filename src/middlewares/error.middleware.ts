import type { NextFunction, Request, Response } from "express";

interface IError extends Error {
    statusCode?: number;
}

export const GlobalErrorHandler = (err: IError, req: Request, res: Response, next: NextFunction): Response => {
    const status = err.statusCode || 500;
    return res.status(status).json({
        message: err.message || 'Internal Server Error',
        stack: err.stack,
        cause: err.cause,
        err
    })
}   