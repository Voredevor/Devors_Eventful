import { Repository, DataSource } from "typeorm";
import { Analytics } from "../models/Analytics";

export class AnalyticsRepository {
  private repository: Repository<Analytics>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Analytics);
  }

  async create(analyticsData: Partial<Analytics>): Promise<Analytics> {
    const analytics = this.repository.create(analyticsData);
    return this.repository.save(analytics);
  }

  async findById(id: string): Promise<Analytics | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["event", "creator"],
    });
  }

  async findByEventId(eventId: string): Promise<Analytics | null> {
    return this.repository.findOne({
      where: { eventId },
      relations: ["event", "creator"],
    });
  }

  async findByCreatorId(
    creatorId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Analytics[]; total: number }> {
    const [data, total] = await this.repository.findAndCount({
      where: { creatorId },
      relations: ["event"],
      order: { dateTracked: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async getEventAnalytics(
    eventId: string
  ): Promise<{
    totalAttendees: number;
    totalTicketsSold: number;
    ticketHoldersWithScannedQr: number;
    revenue: number;
    qrScanRate: number;
  } | null> {
    const analytics = await this.repository.findOne({
      where: { eventId },
    });

    if (!analytics) {
      return null;
    }

    const scanRate =
      analytics.totalTicketsSold > 0
        ? (analytics.ticketHoldersWithScannedQr / analytics.totalTicketsSold) *
          100
        : 0;

    return {
      totalAttendees: analytics.totalAttendees,
      totalTicketsSold: analytics.totalTicketsSold,
      ticketHoldersWithScannedQr: analytics.ticketHoldersWithScannedQr,
      revenue: Number(analytics.revenue),
      qrScanRate: Number(scanRate.toFixed(2)),
    };
  }

  async getCreatorDashboard(
    creatorId: string
  ): Promise<{
    totalEvents: number;
    totalRevenue: number;
    totalAttendees: number;
    totalTicketsSold: number;
    averageQrScanRate: number;
    eventMetrics: Array<{
      eventId: string;
      eventTitle?: string;
      totalTicketsSold: number;
      revenue: number;
      qrScanRate: number;
    }>;
  }> {
    const [events, total] = await this.repository.findAndCount({
      where: { creatorId },
      relations: ["event"],
    });

    let totalRevenue = 0;
    let totalAttendees = 0;
    let totalTicketsSold = 0;
    let totalQrScans = 0;

    const eventMetrics = events.map((event) => {
      totalRevenue += Number(event.revenue);
      totalAttendees += event.totalAttendees;
      totalTicketsSold += event.totalTicketsSold;
      totalQrScans += event.ticketHoldersWithScannedQr;

      const qrScanRate =
        event.totalTicketsSold > 0
          ? (event.ticketHoldersWithScannedQr / event.totalTicketsSold) * 100
          : 0;

      return {
        eventId: event.eventId,
        eventTitle: event.event?.title || "Unknown Event",
        totalTicketsSold: event.totalTicketsSold,
        revenue: Number(event.revenue),
        qrScanRate: Number(qrScanRate.toFixed(2)),
      };
    });

    const averageQrScanRate =
      totalTicketsSold > 0
        ? (totalQrScans / totalTicketsSold) * 100
        : 0;

    return {
      totalEvents: total,
      totalRevenue,
      totalAttendees,
      totalTicketsSold,
      averageQrScanRate: Number(averageQrScanRate.toFixed(2)),
      eventMetrics,
    };
  }

  async update(
    id: string,
    updateData: Partial<Analytics>
  ): Promise<Analytics | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
