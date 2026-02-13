import { Repository, Between } from "typeorm";
import { Payment } from "@models/Payment";
import { appDataSource } from "@config/database";

export class PaymentRepository {
  private repository: Repository<Payment>;

  constructor() {
    this.repository = appDataSource.getRepository(Payment);
  }

  async create(data: Partial<Payment>): Promise<Payment> {
    const payment = this.repository.create(data);
    return this.repository.save(payment);
  }

  async findById(paymentId: string): Promise<Payment | null> {
    return this.repository.findOne({
      where: { id: paymentId },
      relations: ["user", "ticket"],
    });
  }

  async findByReference(paymentReference: string): Promise<Payment | null> {
    return this.repository.findOne({
      where: { paymentReference },
      relations: ["user", "ticket"],
    });
  }

  async findByUserId(userId: string, page = 1, limit = 10): Promise<{ payments: Payment[]; total: number }> {
    const [payments, total] = await this.repository.findAndCount({
      where: { userId },
      relations: ["ticket", "event"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { payments, total };
  }

  async findByEventId(eventId: string, page = 1, limit = 10): Promise<{ payments: Payment[]; total: number }> {
    const [payments, total] = await this.repository.findAndCount({
      where: { eventId },
      relations: ["user"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { payments, total };
  }

  async findByTicketId(ticketId: string): Promise<Payment | null> {
    return this.repository.findOne({
      where: { ticketId },
    });
  }

  async update(paymentId: string, data: Partial<Payment>): Promise<Payment> {
    await this.repository.update(paymentId, data);
    const payment = await this.findById(paymentId);
    if (!payment) throw new Error("Payment not found after update");
    return payment;
  }

  async countByStatus(status: string): Promise<number> {
    return this.repository.count({ where: { status: status as "pending" | "completed" | "failed" } });
  }

  async findCompletedPayments(startDate: Date, endDate: Date): Promise<Payment[]> {
    return this.repository.find({
      where: {
        status: "completed",
        createdAt: Between(startDate, endDate),
      },
      relations: ["user", "event"],
    });
  }

  async getTotalRevenue(eventId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder("payment")
      .select("SUM(payment.amount)", "total")
      .where("payment.eventId = :eventId", { eventId })
      .andWhere("payment.status = :status", { status: "completed" })
      .getRawOne();

    return result?.total || 0;
  }

  async delete(paymentId: string): Promise<void> {
    await this.repository.delete(paymentId);
  }
}

export const paymentRepository = new PaymentRepository();
