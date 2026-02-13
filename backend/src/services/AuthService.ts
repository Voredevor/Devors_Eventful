import { User } from "../models/User";
import { userRepository } from "../repositories/UserRepository";
import { RegisterDTO, LoginDTO, AuthResponseDTO, RefreshTokenDTO } from "../types/auth";
import { hashPassword, comparePassword } from "../utils/password";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";
import {
  ConflictError,
  NotFoundError,
  AuthenticationError,
  ValidationError,
} from "../utils/errors";
import { cacheSetObject, cacheDelete } from "../config/redis";
import { CACHE_TTL } from "../utils/constants";

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterDTO): Promise<AuthResponseDTO> {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError(`User with email ${data.email} already exists`);
    }

    // Validate user type
    if (!["creator", "eventee"].includes(data.userType)) {
      throw new ValidationError("User type must be either 'creator' or 'eventee'");
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await userRepository.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      passwordHash,
      userType: data.userType,
      isActive: true,
      // In production, set verified: false and send verification email
      verified: true,
    });

    // Generate tokens
    const token = generateAccessToken({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    });

    // Store refresh token
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7); // 7 days
    await userRepository.setRefreshToken(user.id, refreshToken, refreshTokenExpiresAt);

    return this.formatAuthResponse(user, token, refreshToken);
  }

  /**
   * Login user
   */
  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    // Find user by email
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Verify password
    const passwordMatch = await comparePassword(data.password, user.passwordHash);
    if (!passwordMatch) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError("Your account has been deactivated");
    }

    // Generate tokens
    const token = generateAccessToken({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    });

    // Update refresh token and last login
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);
    await userRepository.setRefreshToken(user.id, refreshToken, refreshTokenExpiresAt);
    await userRepository.updateLastLogin(user.id);

    // Cache tokens
    await cacheSetObject(`auth:${token}`, user, CACHE_TTL.LONG);

    return this.formatAuthResponse(user, token, refreshToken);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenDTO> {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Find user
    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    // Verify refresh token matches stored token
    if (user.refreshToken !== refreshToken) {
      throw new AuthenticationError("Invalid refresh token");
    }

    // Check expiry
    if (user.refreshTokenExpiresAt && new Date() > user.refreshTokenExpiresAt) {
      throw new AuthenticationError("Refresh token has expired");
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      userType: user.userType,
    });

    // Cache new token
    await cacheSetObject(`auth:${newAccessToken}`, user, CACHE_TTL.LONG);

    return {
      success: true,
      token: newAccessToken,
    };
  }

  /**
   * Logout user - clear refresh token
   */
  async logout(userId: string): Promise<void> {
    await userRepository.clearRefreshToken(userId);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updateData: Partial<Pick<User, "firstName" | "lastName" | "phone" | "profilePictureUrl">>
  ): Promise<User> {
    const user = await userRepository.update(userId, updateData);
    if (!user) {
      throw new NotFoundError("User");
    }

    // Invalidate cache
    await cacheDelete(`auth:${userId}`);

    return user;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return { message: "If the email exists, a password reset link has been sent" };
    }

    // In production, generate reset token and send email
    // For now, just return success message
    return { message: "If the email exists, a password reset link has been sent" };
  }

  /**
   * Reset password
   */
  async resetPassword(_resetToken: string, _newPassword: string): Promise<{ message: string }> {
    // In production, verify reset token and update password
    // For now, just return success message
    return { message: "Password has been reset successfully" };
  }

  /**
   * Format auth response
   */
  private formatAuthResponse(user: User, token: string, refreshToken: string): AuthResponseDTO {
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        userType: user.userType,
        verified: user.verified,
        profilePictureUrl: user.profilePictureUrl,
        createdAt: user.createdAt.toISOString(),
      },
      token,
      refreshToken,
    };
  }
}

export const authService = new AuthService();
