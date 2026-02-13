import { Request, Response } from "express";
import { getDatabase } from "../config/database";
import { AnalyticsService } from "../services/AnalyticsService";
import { asyncHandler } from "../middleware/errorHandler";

const analyticsService = new AnalyticsService(getDatabase());

export class AnalyticsController {
  /**
   * Get analytics for a specific event (creator only)
   */
  static getEventAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const userId = (req as any).user?.userId;

    const analytics = await analyticsService.getEventAnalytics(
      eventId,
      userId
    );

    res.status(200).json({
      success: true,
      data: analytics,
    });
  });

  /**
   * Get creator's dashboard with all events analytics
   */
  static getCreatorDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;

    const dashboard = await analyticsService.getCreatorDashboard(userId);

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  });

  /**
   * Manually update analytics for an event
   */
  static updateEventAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const analytics = await analyticsService.updateEventAnalytics(eventId);

    res.status(200).json({
      success: true,
      data: analytics,
      message: "Event analytics updated successfully",
    });
  });

  /**
   * Get trending events
   */
  static getTrendingEvents = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 5 } = req.query;

    const events = await analyticsService.getTrendingEvents(Number(limit));

    res.status(200).json({
      success: true,
      data: events,
    });
  });
}
