import { Router } from "express";
import { EventShareController } from "../controllers/EventShareController";
import { authenticate } from "../middleware/auth";

const router = Router();

// All sharing routes require authentication
router.use(authenticate);

// Create a share link for an event
router.post("/:eventId/share", EventShareController.shareEvent);

// Get share statistics for an event (creator only)
router.get("/:eventId/share-stats", EventShareController.getEventShareStats);

// Get all shares for an event
router.get("/:eventId/shares", EventShareController.getEventShares);

// Get creator's sharing statistics
router.get("/creator/stats", EventShareController.getCreatorShareStats);

// Get popular platforms for an event
router.get("/:eventId/popular-platforms", EventShareController.getPopularPlatforms);

export default router;
