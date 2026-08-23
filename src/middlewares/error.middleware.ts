import type { NextFunction, Request, Response } from "express";
import { NODE_ENV } from "../config/config";

interface IError extends Error {
  statusCode?: number;
}

export const GlobalErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction,
): Response => {
  if (err.name === "MulterError") {
    err.statusCode = 400;
  }
  const status = err.statusCode || 500;
  return res.status(status).json({
    message: err.message || "Internal Server Error",
    stack: NODE_ENV === "development" ? err.stack : undefined,
    cause: err.cause,
    err,
  });
};
