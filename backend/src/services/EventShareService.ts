import { DataSource } from "typeorm";
import { EventShareRepository } from "../repositories/EventShareRepository";
import { EventRepository } from "../repositories/EventRepository";
import { EventShare } from "../models/EventShare";
import { NotFoundError } from "../utils/errors";
import crypto from "crypto";

export class EventShareService {
  private eventShareRepository: EventShareRepository;
  private eventRepository: EventRepository;

  constructor(private dataSource: DataSource) {
    this.eventShareRepository = new EventShareRepository(dataSource);
    this.eventRepository = new EventRepository();
  }

  /**
   * Generate a unique share link for an event on a specific platform
   */
  async generateShareLink(
    eventId: string,
    userId: string,
    platform: string
  ): Promise<EventShare> {
    try {
      const event = await this.eventRepository.findById(eventId);
      if (!event) {
        throw new NotFoundError("Event not found");
      }

      // Generate unique share link
      const shareToken = crypto.randomBytes(12).toString("hex");
      const shareLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/events/${eventId}?shared_by=${shareToken}&platform=${platform}`;

      const share = await this.eventShareRepository.create({
        eventId,
        userId,
        platform,
        shareLink,
      });

      return share;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get sharing stats for an event (creator only)
   */
  async getEventShareStats(
    eventId: string,
    userId: string
  ): Promise<{
    totalShares: number;
    sharesByPlatform: { [key: string]: number };
    uniqueSharers: number;
  }> {
    try {
      const event = await this.eventRepository.findById(eventId);
      if (!event) {
        throw new NotFoundError("Event not found");
      }

      if (event.creatorId !== userId) {
        throw new Error("Not authorized to view share stats for this event");
      }

      return await this.eventShareRepository.getShareStats(eventId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all shares for an event
   */
  async getEventShares(eventId: string): Promise<EventShare[]> {
    try {
      return await this.eventShareRepository.findByEventId(eventId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get creator's sharing statistics across all their events
   */
  async getCreatorShareStats(userId: string) {
    try {
      return await this.eventShareRepository.getCreatorShareStats(userId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get share URL for specific platform
   * Formats the share link appropriately for each platform
   */
  getShareUrl(
    eventId: string,
    platform: string,
    shareLink: string
  ): string {
    const eventTitle = encodeURIComponent("Check out this amazing event!");
    const encodedShareLink = encodeURIComponent(shareLink);

    switch (platform.toLowerCase()) {
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedShareLink}`;

      case "twitter":
        return `https://twitter.com/intent/tweet?url=${encodedShareLink}&text=${eventTitle}`;

      case "whatsapp":
        return `https://wa.me/?text=${encodedShareLink}`;

      case "instagram":
        // Instagram doesn't have a direct share URL, return the share link
        return shareLink;

      case "email":
        return `mailto:?subject=${eventTitle}&body=Check%20this%20out:%20${encodedShareLink}`;

      default:
        return shareLink;
    }
  }

  /**
   * Track share clicks (called when someone opens the shared link)
   */
  async trackShareClick(shareToken: string): Promise<boolean> {
    try {
      // In a real implementation, you might track clicks/analytics
      // For now, this is a placeholder for tracking functionality
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get popular sharing platforms for an event
   */
  async getPopularPlatforms(
    eventId: string,
    limit: number = 5
  ): Promise<Array<{ platform: string; shareCount: number }>> {
    try {
      const stats = await this.eventShareRepository.getShareStats(eventId);
      const platforms = Object.entries(stats.sharesByPlatform)
        .map(([platform, count]) => ({
          platform,
          shareCount: count,
        }))
        .sort((a, b) => b.shareCount - a.shareCount)
        .slice(0, limit);

      return platforms;
    } catch (error) {
      throw error;
    }
  }
}
