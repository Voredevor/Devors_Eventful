import { Router } from "express";
import { ticketController } from "@controllers/TicketController";
import { authenticate } from "@middleware/auth";

const router = Router();

// Purchase ticket (protected, eventee required)
router.post("/purchase", authenticate, ticketController.purchaseTicket);

// Get all user tickets (protected)
router.get("/my-tickets", authenticate, ticketController.getUserTickets);

// Get upcoming user tickets (protected)
router.get("/upcoming", authenticate, ticketController.getUpcomingTickets);

// Get specific ticket (public, but validates ownership if authenticated)
router.get("/:ticketId", ticketController.getTicket);

// Refund ticket (protected)
router.post("/:ticketId/refund", authenticate, ticketController.refundTicket);

// Scan QR code (protected - for event staff/organizer)
router.post("/scan", authenticate, ticketController.scanTicket);

// Get event tickets (protected - creator only)
router.get("/event/:eventId", authenticate, ticketController.getEventTickets);

// Get event attendance statistics (protected - creator only)
router.get("/event/:eventId/statistics", authenticate, ticketController.getEventStatistics);

export default router;
