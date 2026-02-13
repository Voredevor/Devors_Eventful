import { Router } from "express";
import { notificationController } from "@controllers/NotificationController";
import { authenticate } from "@middleware/auth";

const router = Router();

// Get all notifications (protected)
router.get("/", authenticate, notificationController.getNotifications);

// Get unread count (protected)
router.get("/unread/count", authenticate, notificationController.getUnreadCount);

// Mark notification as read (protected)
router.patch("/:notificationId/read", authenticate, notificationController.markAsRead);

// Mark all notifications as read (protected)
router.post("/mark-all-read", authenticate, notificationController.markAllAsRead);

// Delete notification (protected)
router.delete("/:notificationId", authenticate, notificationController.deleteNotification);

export default router;
