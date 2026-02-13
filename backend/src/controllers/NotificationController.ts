import { Request, Response } from "express";
import { notificationService } from "@services/NotificationService";
import { asyncHandler } from "@middleware/errorHandler";

export const notificationController = {
  getNotifications: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: "User not authenticated" } });
      return;
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const response = await notificationService.getNotifications(userId, page, limit);

    res.status(200).json({
      success: true,
      data: {
        notifications: response.notifications,
        unreadCount: response.unread,
      },
      pagination: {
        page,
        limit,
        total: response.total,
        pages: response.pages,
      },
    });
  }),

  getUnreadCount: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: "User not authenticated" } });
      return;
    }
    const unreadCount = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: {
        unreadCount,
      },
    });
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { notificationId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: "User not authenticated" } });
      return;
    }

    const notification = await notificationService.markAsRead(notificationId, userId);

    res.status(200).json({
      success: true,
      data: { notification },
      message: "Notification marked as read",
    });
  }),

  markAllAsRead: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: "User not authenticated" } });
      return;
    }

    await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  }),

  deleteNotification: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { notificationId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: "User not authenticated" } });
      return;
    }

    await notificationService.deleteNotification(notificationId, userId);

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  }),
};
