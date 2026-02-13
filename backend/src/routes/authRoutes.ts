import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authenticate } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimiter";

const router = Router();

/**
 * Public routes
 */
router.post("/register", authRateLimiter, AuthController.register);
router.post("/login", authRateLimiter, AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/forgot-password", authRateLimiter, AuthController.requestPasswordReset);
router.post("/reset-password", AuthController.resetPassword);

/**
 * Protected routes
 */
router.post("/logout", authenticate, AuthController.logout);
router.get("/profile", authenticate, AuthController.getProfile);
router.patch("/profile", authenticate, AuthController.updateProfile);

export default router;
