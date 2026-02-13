import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";
import { AuthenticationError } from "../utils/errors";
import { cacheGetObject } from "../config/redis";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthenticationError("Missing or invalid authorization header");
    }

    const token = authHeader.substring(7);

    // Try to get user from cache first
    const cachedUser = await cacheGetObject<JwtPayload>(`auth:${token}`);

    if (cachedUser) {
      req.user = cachedUser;
      next();
      return;
    }

    // If not in cache, verify token
    const payload = verifyAccessToken(token);
    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: Array<"creator" | "eventee">) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError("User not authenticated");
    }

    if (!allowedRoles.includes(req.user.userType)) {
      throw new AuthenticationError(
        `This action requires one of the following roles: ${allowedRoles.join(", ")}`
      );
    }

    next();
  };
};

export const requireCreator = authorize("creator");
export const requireEventee = authorize("eventee");
