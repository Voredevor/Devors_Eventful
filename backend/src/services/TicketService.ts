import { ticketRepository } from "@repositories/TicketRepository";
import { eventRepository } from "@repositories/EventRepository";
import { qrCodeService } from "@services/QRCodeService";
import { cacheDelete } from "@config/redis";
import { Ticket } from "@models/Ticket";
import { AuthorizationError, ValidationError, NotFoundError } from "@utils/errors";

export class TicketService {
  async purchaseTicket(userId: string, eventId: string): Promise<Ticket> {
    // Check if event exists and is published
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new NotFoundError("Event not found");
    }

    if (event.status !== "published") {
      throw new ValidationError("Event is not available for ticket purchase");
    }

    // Check if user already has a ticket for this event
    const existingTicket = await ticketRepository.findByUserAndEvent(userId, eventId);
    if (existingTicket) {
      throw new ValidationError("You already have a ticket for this event");
    }

    // Check ticket availability
    if (event.soldTickets >= event.totalTickets) {
      throw new ValidationError("No tickets available for this event");
    }

    // Generate QR code
    const qrPayload = await qrCodeService.generateQRCode(userId, userId, eventId);
    const qrImage = await qrCodeService.generateQRCodeImage(qrPayload);

    // Create ticket
    const ticket = await ticketRepository.create({
      eventId,
      userId,
      qrCodeData: JSON.stringify(qrPayload),
      qrCodeImageUrl: qrImage,
      status: "active",
      purchaseDate: new Date(),
    });

    // Update event soldTickets count
    await eventRepository.updateSoldTickets(eventId, event.soldTickets + 1);

    // Invalidate event cache
    await cacheDelete(`event:${eventId}`);

    return ticket;
  }

  async getTicketById(ticketId: string, userId?: string): Promise<Ticket> {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    // Check authorization if userId provided
    if (userId && ticket.userId !== userId) {
      throw new AuthorizationError("You don't have access to this ticket");
    }

    return ticket;
  }

  async getUserTickets(userId: string, page = 1, limit = 10): Promise<{ tickets: Ticket[]; total: number; pages: number }> {
    const { tickets, total } = await ticketRepository.findByUserId(userId, page, limit);
    return {
      tickets,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getEventTickets(eventId: string, page = 1, limit = 10): Promise<{ tickets: Ticket[]; total: number; pages: number }> {
    const { tickets, total } = await ticketRepository.findByEventId(eventId, page, limit);
    return {
      tickets,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async scanTicket(qrData: string): Promise<Ticket> {
    // Parse and verify QR code
    const payload = qrCodeService.parseQRCode(qrData);
    if (!qrCodeService.verifyQRCode(payload)) {
      throw new ValidationError("Invalid or expired QR code");
    }

    // Find ticket by QR code
    const ticket = await ticketRepository.findByQRCode(qrData);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    // Check if already scanned
    if (ticket.qrScanned) {
      throw new ValidationError("This ticket has already been scanned");
    }

    // Mark as scanned
    return await ticketRepository.markAsScanned(ticket.id);
  }

  async refundTicket(ticketId: string, userId: string): Promise<Ticket> {
    const ticket = await this.getTicketById(ticketId, userId);

    if (ticket.status === "refunded") {
      throw new ValidationError("This ticket has already been refunded");
    }

    if (ticket.qrScanned) {
      throw new ValidationError("Cannot refund a ticket that has been used");
    }

    // Update ticket status
    const updatedTicket = await ticketRepository.update(ticketId, { status: "refunded" });

    // Update event sold tickets
    const event = await eventRepository.findById(ticket.eventId);
    if (event) {
      await eventRepository.updateSoldTickets(ticket.eventId, Math.max(0, event.soldTickets - 1));
      await cacheDelete(`event:${ticket.eventId}`);
    }

    return updatedTicket;
  }

  async getUserUpcomingTickets(userId: string, limit = 5): Promise<Ticket[]> {
    return ticketRepository.findUpcomingByUserId(userId, limit);
  }

  async getEventAttendanceStats(eventId: string): Promise<{ totalTickets: number; scannedTickets: number; scanRate: number }> {
    const totalTickets = await ticketRepository.countActiveByEventId(eventId);
    const scannedTickets = await ticketRepository.countScannedByEventId(eventId);

    return {
      totalTickets,
      scannedTickets,
      scanRate: totalTickets > 0 ? (scannedTickets / totalTickets) * 100 : 0,
    };
  }
}

export const ticketService = new TicketService();
