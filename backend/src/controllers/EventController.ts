import { Request, Response } from "express";
import { eventService } from "../services/EventService";
import { asyncHandler } from "../middleware/errorHandler";
import { validateRequest, createEventSchema } from "../utils/validators";

export class EventController {
  static createEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schema = createEventSchema();
    const data = validateRequest<{
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
    }>(req.body, schema);
    const creatorId = req.user?.userId;
    if (!creatorId) throw new Error("User not authenticated");

    const event = await eventService.createEvent(creatorId, data);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });
  });

  static getEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;
    const event = await eventService.getEventById(eventId);

    res.status(200).json({
      success: true,
      data: event,
    });
  });

  static getMyEvents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const creatorId = req.user?.userId;
    if (!creatorId) throw new Error("User not authenticated");
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { events, total } = await eventService.getEventsByCreator(creatorId, page, limit);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  static getPublicEvents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters = {
      category: req.query.category as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      search: req.query.search as string,
    };

    const { events, total } = await eventService.getPublishedEvents(page, limit, filters);

    res.status(200).json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  });

  static updateEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;
    const creatorId = req.user?.userId;
    if (!creatorId) throw new Error("User not authenticated");

    const event = await eventService.updateEvent(eventId, creatorId, req.body);

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: event,
    });
  });

  static publishEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;
    const creatorId = req.user?.userId;
    if (!creatorId) throw new Error("User not authenticated");

    const event = await eventService.publishEvent(eventId, creatorId);

    res.status(200).json({
      success: true,
      message: "Event published successfully",
      data: event,
    });
  });

  static cancelEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;
    const creatorId = req.user?.userId;
    if (!creatorId) throw new Error("User not authenticated");

    const event = await eventService.cancelEvent(eventId, creatorId);

    res.status(200).json({
      success: true,
      message: "Event cancelled successfully",
      data: event,
    });
  });

  static deleteEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;
    const creatorId = req.user?.userId;
    if (!creatorId) throw new Error("User not authenticated");

    await eventService.deleteEvent(eventId, creatorId);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  });

  static getUpcomingEvents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const limit = parseInt(req.query.limit as string) || 5;
    const events = await eventService.getUpcomingEvents(limit);

    res.status(200).json({
      success: true,
      data: events,
    });
  });
}
