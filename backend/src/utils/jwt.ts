import jwt from "jsonwebtoken";
import config from "../config/environment";

export interface JwtPayload {
  userId: string;
  email: string;
  userType: "creator" | "eventee";
  iat?: number;
  exp?: number;
}

export const generateAccessToken = (payload: Omit<JwtPayload, "iat" | "exp">): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiryTime,
  });
};

export const generateRefreshToken = (payload: Omit<JwtPayload, "iat" | "exp">): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiryTime,
  });
};

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired access token");
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};
