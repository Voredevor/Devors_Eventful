import { Request, Response, NextFunction } from "express";
import { getRedisClient } from "../config/redis";
import { RATE_LIMIT } from "../utils/constants";
import { AppError } from "../utils/errors";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests in the window
}

const getClientIdentifier = (req: Request): string => {
  return (req.headers["x-forwarded-for"] as string) || req.ip || "unknown";
};

export const createRateLimiter = (config: RateLimitConfig) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const client = getRedisClient();
      const identifier = getClientIdentifier(req);
      const key = `ratelimit:${req.path}:${identifier}`;

      const currentCount = await client.incr(key);

      if (currentCount === 1) {
        // Set expiry on first request
        await client.expire(key, Math.ceil(config.windowMs / 1000));
      }

      const retryAfter = await client.ttl(key);

      if (currentCount > config.maxRequests) {
        throw new AppError(
          429,
          `Too many requests. Please try again after ${retryAfter} seconds.`,
          "RATE_LIMIT_EXCEEDED"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authRateLimiter = createRateLimiter(RATE_LIMIT.AUTH);
export const apiRateLimiter = createRateLimiter(RATE_LIMIT.API);
export const paymentRateLimiter = createRateLimiter(RATE_LIMIT.PAYMENT);
