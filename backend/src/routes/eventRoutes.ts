import { Router } from "express";
import { EventController } from "../controllers/EventController";
import { authenticate, requireCreator } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/", EventController.getPublicEvents);
router.get("/upcoming", EventController.getUpcomingEvents);
router.get("/:eventId", EventController.getEvent);

// Creator routes (protected)
router.post("/", authenticate, requireCreator, EventController.createEvent);
router.get("/my-events", authenticate, requireCreator, EventController.getMyEvents);
router.patch("/:eventId", authenticate, requireCreator, EventController.updateEvent);
router.post("/:eventId/publish", authenticate, requireCreator, EventController.publishEvent);
router.post("/:eventId/cancel", authenticate, requireCreator, EventController.cancelEvent);
router.delete("/:eventId", authenticate, requireCreator, EventController.deleteEvent);

export default router;
