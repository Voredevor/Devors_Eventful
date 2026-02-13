import { Request, Response } from "express";
import { ticketService } from "@services/TicketService";
import { asyncHandler } from "@middleware/errorHandler";
import {
  validateRequest,
  createTicketPurchaseSchema,
  createScanTicketSchema,
} from "@utils/validators";

export const ticketController = {
  purchaseTicket: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schema = createTicketPurchaseSchema();
    const { eventId } = validateRequest<{ eventId: string }>(req.body, schema);
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: "User not authenticated" } });
      return;
    }

    const ticket = await ticketService.purchaseTicket(userId, eventId);

    res.status(201).json({
      success: true,
      data: { ticket },
      message: "Ticket purchased successfully",
    });
  }),

  getTicket: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { ticketId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: "User not authenticated" } });
      return;
    }

    const ticket = await ticketService.getTicketById(ticketId, userId);

    res.status(200).json({
      success: true,
      data: { ticket },
    });
  }),

  getUserTickets: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: "User not authenticated" } });
      return;
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { tickets, total, pages } = await ticketService.getUserTickets(userId, page, limit);

    res.status(200).json({
      success: true,
      data: { tickets },
      pagination: { page, limit, total, pages },
    });
  }),

  getEventTickets: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { tickets, total, pages } = await ticketService.getEventTickets(eventId, page, limit);

    res.status(200).json({
      success: true,
      data: { tickets },
      pagination: { page, limit, total, pages },
    });
  }),

  scanTicket: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const schema = createScanTicketSchema();
    const { qrData } = validateRequest<{ qrData: string }>(req.body, schema);

    const ticket = await ticketService.scanTicket(qrData);

    res.status(200).json({
      success: true,
      data: { ticket },
      message: "Ticket scanned successfully",
    });
  }),

  getUpcomingTickets: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: "User not authenticated" } });
      return;
    }
    const limit = parseInt(req.query.limit as string) || 5;

    const tickets = await ticketService.getUserUpcomingTickets(userId, limit);

    res.status(200).json({
      success: true,
      data: { tickets },
    });
  }),

  refundTicket: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { ticketId } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: "User not authenticated" } });
      return;
    }

    const ticket = await ticketService.refundTicket(ticketId, userId);

    res.status(200).json({
      success: true,
      data: { ticket },
      message: "Ticket refunded successfully",
    });
  }),

  getEventStatistics: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;

    const stats = await ticketService.getEventAttendanceStats(eventId);

    res.status(200).json({
      success: true,
      data: { statistics: stats },
    });
  }),
};
