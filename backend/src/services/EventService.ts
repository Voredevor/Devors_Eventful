import { Event } from "../models/Event";
import { eventRepository } from "../repositories/EventRepository";
import { NotFoundError, AuthorizationError, ValidationError } from "../utils/errors";
import { cacheSetObject, cacheDelete, cacheGetObject } from "../config/redis";
import { CACHE_TTL } from "../utils/constants";

export interface CreateEventDTO {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  location: string;
  startDate: string;
  endDate: string;
  totalTickets: number;
  price: number;
  reminderDefault?: string;
  customReminderHours?: number;
}

export interface UpdateEventDTO {
  title?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  totalTickets?: number;
  price?: number;
  reminderDefault?: string;
  customReminderHours?: number;
  status?: string;
}

export class EventService {
  async createEvent(creatorId: string, data: CreateEventDTO): Promise<Event> {
    const event = await eventRepository.create({
      creatorId,
      title: data.title,
      description: data.description,
      category: data.category,
      imageUrl: data.imageUrl,
      location: data.location,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      totalTickets: data.totalTickets,
      price: data.price,
      reminderDefault: data.reminderDefault || "1day",
      customReminderHours: data.customReminderHours,
      status: "draft",
    });

    return event;
  }

  async getEventById(eventId: string): Promise<Event> {
    const cacheKey = `event:${eventId}`;
    const cached = await cacheGetObject<Event>(cacheKey);
    if (cached) return cached;

    const event = await eventRepository.findById(eventId);
    if (!event) throw new NotFoundError("Event");

    await cacheSetObject(cacheKey, event, CACHE_TTL.LONG);
    return event;
  }

  async getEventsByCreator(creatorId: string, page = 1, limit = 10) {
    return eventRepository.findByCreatorId(creatorId, page, limit);
  }

  async getPublishedEvents(page = 1, limit = 10, filters?: any) {
    return eventRepository.findPublished(page, limit, filters);
  }

  async updateEvent(
    eventId: string,
    creatorId: string,
    data: UpdateEventDTO
  ): Promise<Event> {
    const event = await this.getEventById(eventId);

    if (event.creatorId !== creatorId) {
      throw new AuthorizationError("You can only update your own events");
    }

    if (event.status === "published" && data.status !== "cancelled") {
      throw new ValidationError("Cannot modify published events. Cancel and create new one.");
    }

    const updateData: Partial<Event> = {};
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.category) updateData.category = data.category;
    if (data.imageUrl) updateData.imageUrl = data.imageUrl;
    if (data.location) updateData.location = data.location;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.totalTickets) updateData.totalTickets = data.totalTickets;
    if (data.price) updateData.price = data.price;
    if (data.status) updateData.status = data.status as any;

    const updated = await eventRepository.update(eventId, updateData);
    if (!updated) throw new NotFoundError("Event");

    // Invalidate cache
    await cacheDelete(`event:${eventId}`);

    return updated;
  }

  async publishEvent(eventId: string, creatorId: string): Promise<Event> {
    const event = await this.getEventById(eventId);

    if (event.creatorId !== creatorId) {
      throw new AuthorizationError("You can only publish your own events");
    }

    if (event.status !== "draft") {
      throw new ValidationError("Only draft events can be published");
    }

    const updated = await eventRepository.update(eventId, { status: "published" });
    if (!updated) throw new NotFoundError("Event");

    await cacheDelete(`event:${eventId}`);
    return updated;
  }

  async cancelEvent(eventId: string, creatorId: string): Promise<Event> {
    const event = await this.getEventById(eventId);

    if (event.creatorId !== creatorId) {
      throw new AuthorizationError("You can only cancel your own events");
    }

    if (event.status === "completed") {
      throw new ValidationError("Cannot cancel completed events");
    }

    const updated = await eventRepository.update(eventId, { status: "cancelled" });
    if (!updated) throw new NotFoundError("Event");

    await cacheDelete(`event:${eventId}`);
    return updated;
  }

  async deleteEvent(eventId: string, creatorId: string): Promise<void> {
    const event = await this.getEventById(eventId);

    if (event.creatorId !== creatorId) {
      throw new AuthorizationError("You can only delete your own events");
    }

    const deleted = await eventRepository.delete(eventId);
    if (!deleted) throw new NotFoundError("Event");

    await cacheDelete(`event:${eventId}`);
  }

  async getUpcomingEvents(limit = 5): Promise<Event[]> {
    return eventRepository.getUpcomingEvents(limit);
  }
}

export const eventService = new EventService();
