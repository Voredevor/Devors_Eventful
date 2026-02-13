import { Router } from "express";
import { AnalyticsController } from "../controllers/AnalyticsController";
import { authenticate } from "../middleware/auth";

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// Get event analytics (creator only)
router.get("/events/:eventId", AnalyticsController.getEventAnalytics);

// Get creator dashboard
router.get("/creator/dashboard", AnalyticsController.getCreatorDashboard);

// Update event analytics (manual trigger)
router.post("/events/:eventId/update", AnalyticsController.updateEventAnalytics);

// Get trending events (public)
router.get("/trending", AnalyticsController.getTrendingEvents);

export default router;
