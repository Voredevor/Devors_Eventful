import { Request, Response } from "express";
import { authService } from "../services/AuthService";
import { asyncHandler } from "../middleware/errorHandler";
import { validateRequest } from "../utils/validators";
import {
  createRegisterSchema,
  createLoginSchema,
} from "../utils/validators";
import { RegisterDTO, LoginDTO } from "../types/auth";

export class AuthController {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schema = createRegisterSchema();
    const data = validateRequest<RegisterDTO>(req.body, schema);

    const result = await authService.register(data);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schema = createLoginSchema();
    const data = validateRequest<LoginDTO>(req.body, schema);

    const result = await authService.login(data);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh-token
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    const result = await authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  });

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  static logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    await authService.logout(userId);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  });

  /**
   * Get current user profile
   * GET /api/v1/auth/profile
   */
  static getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await authService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        userType: user.userType,
        verified: user.verified,
        profilePictureUrl: user.profilePictureUrl,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  });

  /**
   * Update user profile
   * PATCH /api/v1/auth/profile
   */
  static updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const { firstName, lastName, phone, profilePictureUrl } = req.body;
    const updateData: Record<string, unknown> = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (profilePictureUrl !== undefined) updateData.profilePictureUrl = profilePictureUrl;

    const user = await authService.updateProfile(userId, updateData);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        userType: user.userType,
        profilePictureUrl: user.profilePictureUrl,
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  });

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  static requestPasswordReset = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    if (!email) {
      throw new Error("Email is required");
    }

    const result = await authService.requestPasswordReset(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });

  /**
   * Reset password
   * POST /api/v1/auth/reset-password
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      throw new Error("Reset token and new password are required");
    }

    const result = await authService.resetPassword(resetToken, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}
