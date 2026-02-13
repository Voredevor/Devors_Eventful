import { Request, Response, NextFunction } from "express";
import { isAppError } from "../utils/errors";
import { HTTP_STATUS_CODES } from "../utils/constants";
import config from "../config/environment";

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
  };
  timestamp: string;
  path: string;
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  const timestamp = new Date().toISOString();
  const path = req.originalUrl;

  if (isAppError(error)) {
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: error.code || "APP_ERROR",
        message: error.message,
        statusCode: error.statusCode,
      },
      timestamp,
      path,
    };

    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // Handle unknown errors
  const isDevelopment = config.app.nodeEnv === "development";
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: isDevelopment ? error.message : "An unexpected error occurred",
      statusCode: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      details: isDevelopment ? { stack: error.stack } : undefined,
    },
    timestamp,
    path,
  };

  res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json(errorResponse);
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
