import { AppDataSource } from "../config/database";
import { Event } from "../models/Event";

export class EventRepository {
  private repository = AppDataSource.getRepository(Event);

  async findById(id: string): Promise<Event | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["creator"],
    });
  }

  async create(eventData: Partial<Event>): Promise<Event> {
    const event = this.repository.create(eventData);
    return this.repository.save(event);
  }

  async update(id: string, updateData: Partial<Event>): Promise<Event | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByCreatorId(creatorId: string, page = 1, limit = 10) {
    const [events, total] = await this.repository.findAndCount({
      where: { creatorId },
      relations: ["creator"],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });
    return { events, total };
  }

  async findPublished(page = 1, limit = 10, filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    let query = this.repository
      .createQueryBuilder("event")
      .where("event.status = :status", { status: "published" })
      .leftJoinAndSelect("event.creator", "creator")
      .orderBy("event.startDate", "ASC")
      .skip((page - 1) * limit)
      .take(limit);

    if (filters?.category) {
      query = query.andWhere("event.category = :category", { category: filters.category });
    }

    if (filters?.minPrice !== undefined) {
      query = query.andWhere("event.price >= :minPrice", { minPrice: filters.minPrice });
    }

    if (filters?.maxPrice !== undefined) {
      query = query.andWhere("event.price <= :maxPrice", { maxPrice: filters.maxPrice });
    }

    if (filters?.search) {
      query = query.andWhere(
        "(event.title ILIKE :search OR event.description ILIKE :search OR event.location ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.startDate) {
      query = query.andWhere("event.startDate >= :startDate", { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query = query.andWhere("event.endDate <= :endDate", { endDate: filters.endDate });
    }

    const [events, total] = await query.getManyAndCount();
    return { events, total };
  }

  async getUpcomingEvents(limit = 5) {
    return this.repository.find({
      where: { status: "published" },
      relations: ["creator"],
      order: { startDate: "ASC" },
      take: limit,
    });
  }

  async updateSoldTickets(eventId: string, amount: number): Promise<void> {
    await this.repository.increment({ id: eventId }, "soldTickets", amount);
  }
}

export const eventRepository = new EventRepository();
