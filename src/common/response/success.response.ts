import { type Response } from "express";


export const successResponse = <T>({
    res, message = 'Success', statusCode = 200, data
} : {
    res: Response,
    message?: string,
    statusCode?: number,
    data?: T
}) => {
    return res.status(statusCode).json({
        message,
        statusCode,
        data
    })
}