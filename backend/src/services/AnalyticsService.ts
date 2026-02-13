import { DataSource } from "typeorm";
import { AnalyticsRepository } from "../repositories/AnalyticsRepository";
import { EventRepository } from "../repositories/EventRepository";
import { TicketRepository } from "../repositories/TicketRepository";
import { PaymentRepository } from "../repositories/PaymentRepository";
import { Analytics } from "../models/Analytics";
import { Ticket } from "../models/Ticket";
import { Payment } from "../models/Payment";
import { NotFoundError, AuthorizationError } from "../utils/errors";

export class AnalyticsService {
  private analyticsRepository: AnalyticsRepository;
  private eventRepository: EventRepository;
  private ticketRepository: TicketRepository;
  private paymentRepository: PaymentRepository;

  constructor(private dataSource: DataSource) {
    this.analyticsRepository = new AnalyticsRepository(dataSource);
    this.eventRepository = new EventRepository();
    this.ticketRepository = new TicketRepository();
    this.paymentRepository = new PaymentRepository();
  }

  /**
   * Get analytics for a specific event
   * Only event creator can access
   */
  async getEventAnalytics(eventId: string, userId: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError("Event not found");
    }

    if (event.creatorId !== userId) {
      throw new AuthorizationError(
        "You are not authorized to view this event's analytics"
      );
    }

    // Get or create analytics if it doesn't exist
    let analytics = await this.analyticsRepository.findByEventId(eventId);

    if (!analytics) {
      // Generate analytics from ticket and payment data
      const ticketCount = await this.ticketRepository.countByEventId(eventId);
      const scannedTickets = await this.dataSource
        .getRepository(Ticket)
        .count({
          where: { eventId, qrScanned: true },
        });

      const payments = await this.paymentRepository.findByEventId(
        eventId,
        1,
        999999
      );
      const revenue = payments.payments
        .filter((p: Payment) => p.status === "completed")
        .reduce((sum: number, p: Payment) => sum + Number(p.amount), 0);

      analytics = await this.analyticsRepository.create({
        eventId,
        creatorId: userId,
        totalTicketsSold: ticketCount,
        ticketHoldersWithScannedQr: scannedTickets,
        revenue,
        totalAttendees: scannedTickets,
        dateTracked: new Date(),
      });
    }

    return await this.analyticsRepository.getEventAnalytics(eventId);
  }

  /**
   * Get creator's dashboard with all their events' metrics
   */
  async getCreatorDashboard(userId: string) {
    return await this.analyticsRepository.getCreatorDashboard(userId);
  }

  /**
   * Manually trigger analytics generation/update for an event
   * (Can be called by background job or manually)
   */
  async updateEventAnalytics(eventId: string): Promise<Analytics | null> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError("Event not found");
    }

    const ticketCount = await this.ticketRepository.countByEventId(eventId);
    const scannedTickets = await this.dataSource
      .getRepository(Ticket)
      .count({
        where: { eventId, qrScanned: true },
      });

    const payments = await this.paymentRepository.findByEventId(
      eventId,
      1,
      999999
    );
    const revenue = payments.payments
      .filter((p: Payment) => p.status === "completed")
      .reduce((sum: number, p: Payment) => sum + Number(p.amount), 0);

    const analytics = await this.analyticsRepository.findByEventId(eventId);

    if (analytics) {
      return await this.analyticsRepository.update(analytics.id, {
        totalTicketsSold: ticketCount,
        ticketHoldersWithScannedQr: scannedTickets,
        revenue,
        totalAttendees: scannedTickets,
        dateTracked: new Date(),
      });
    } else {
      return await this.analyticsRepository.create({
        eventId,
        creatorId: event.creatorId,
        totalTicketsSold: ticketCount,
        ticketHoldersWithScannedQr: scannedTickets,
        revenue,
        totalAttendees: scannedTickets,
        dateTracked: new Date(),
      });
    }
  }

  /**
   * Get trending events based on ticket sales and QR scans
   */
  async getTrendingEvents(limit: number = 5) {
    const events = await this.dataSource
      .getRepository(Analytics)
      .query(
        `
        SELECT 
          eventId, 
          "totalTicketsSold", 
          "ticketHoldersWithScannedQr",
          revenue,
          events.title
        FROM analytics
        LEFT JOIN events ON analytics."eventId" = events.id
        ORDER BY "totalTicketsSold" DESC, "ticketHoldersWithScannedQr" DESC
        LIMIT $1
      `,
        [limit]
      );

    return events;
  }
}
