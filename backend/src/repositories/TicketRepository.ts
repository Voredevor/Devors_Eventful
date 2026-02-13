import { Repository } from "typeorm";
import { Ticket } from "@models/Ticket";
import { appDataSource } from "@config/database";

export class TicketRepository {
  private repository: Repository<Ticket>;

  constructor() {
    this.repository = appDataSource.getRepository(Ticket);
  }

  async create(data: Partial<Ticket>): Promise<Ticket> {
    const ticket = this.repository.create(data);
    return this.repository.save(ticket);
  }

  async findById(ticketId: string): Promise<Ticket | null> {
    return this.repository.findOne({
      where: { id: ticketId },
      relations: ["event", "user"],
    });
  }

  async findByQRCode(qrCodeData: string): Promise<Ticket | null> {
    return this.repository.findOne({
      where: { qrCodeData },
      relations: ["event", "user"],
    });
  }

  async findByUserId(userId: string, page = 1, limit = 10): Promise<{ tickets: Ticket[]; total: number }> {
    const [tickets, total] = await this.repository.findAndCount({
      where: { userId },
      relations: ["event"],
      order: { purchaseDate: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { tickets, total };
  }

  async findByEventId(eventId: string, page = 1, limit = 10): Promise<{ tickets: Ticket[]; total: number }> {
    const [tickets, total] = await this.repository.findAndCount({
      where: { eventId },
      relations: ["user"],
      order: { purchaseDate: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { tickets, total };
  }

  async findByUserAndEvent(userId: string, eventId: string): Promise<Ticket | null> {
    return this.repository.findOne({
      where: { userId, eventId },
    });
  }

  async update(ticketId: string, data: Partial<Ticket>): Promise<Ticket> {
    await this.repository.update(ticketId, data);
    const ticket = await this.findById(ticketId);
    if (!ticket) throw new Error("Ticket not found after update");
    return ticket;
  }

  async markAsScanned(ticketId: string): Promise<Ticket> {
    return this.update(ticketId, {
      qrScanned: true,
      qrScannedAt: new Date(),
      status: "used",
    });
  }

  async countByEventId(eventId: string): Promise<number> {
    return this.repository.count({ where: { eventId } });
  }

  async countActiveByEventId(eventId: string): Promise<number> {
    return this.repository.count({ where: { eventId, status: "active" } });
  }

  async countScannedByEventId(eventId: string): Promise<number> {
    return this.repository.count({ where: { eventId, qrScanned: true } });
  }

  async findUpcomingByUserId(userId: string, limit = 5): Promise<Ticket[]> {
    return this.repository
      .createQueryBuilder("ticket")
      .leftJoinAndSelect("ticket.event", "event")
      .where("ticket.userId = :userId", { userId })
      .andWhere("event.startDate > NOW()")
      .andWhere("ticket.status = :status", { status: "active" })
      .orderBy("event.startDate", "ASC")
      .take(limit)
      .getMany();
  }

  async delete(ticketId: string): Promise<void> {
    await this.repository.delete(ticketId);
  }
}

export const ticketRepository = new TicketRepository();
