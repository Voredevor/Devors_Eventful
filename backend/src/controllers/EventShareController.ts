import { Request, Response } from "express";
import { getDatabase } from "../config/database";
import { EventShareService } from "../services/EventShareService";
import { asyncHandler } from "../middleware/errorHandler";

const eventShareService = new EventShareService(getDatabase());

export class EventShareController {
  /**
   * Create a share link for an event
   */
  static shareEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;
    const { platform } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: "User not authenticated" } });
      return;
    }

    if (!platform) {
      res.status(400).json({
        success: false,
        error: { message: "Platform is required" },
      });
      return;
    }

    const share = await eventShareService.generateShareLink(
      eventId,
      userId,
      platform
    );

    const shareUrl = eventShareService.getShareUrl(
      eventId,
      platform,
      share.shareLink
    );

    res.status(201).json({
      success: true,
      data: {
        ...share,
        shareUrl,
      },
    });
  });

  /**
   * Get share statistics for an event
   */
  static getEventShareStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: "User not authenticated" } });
      return;
    }

    const stats = await eventShareService.getEventShareStats(eventId, userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  /**
   * Get all shares for an event
   */
  static getEventShares = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;

    const shares = await eventShareService.getEventShares(eventId);

    res.status(200).json({
      success: true,
      data: shares,
      total: shares.length,
    });
  });

  /**
   * Get creator's sharing statistics
   */
  static getCreatorShareStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: "User not authenticated" } });
      return;
    }

    const stats = await eventShareService.getCreatorShareStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  /**
   * Get popular platforms for an event
   */
  static getPopularPlatforms = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;
    const { limit = 5 } = req.query;

    const platforms = await eventShareService.getPopularPlatforms(
      eventId,
      Number(limit)
    );

    res.status(200).json({
      success: true,
      data: platforms,
    });
  });
}
