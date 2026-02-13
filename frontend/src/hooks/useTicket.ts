import { useState } from "react";
import { ticketService } from "@services/ticketService";
import toast from "react-hot-toast";

export const useTicket = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchaseTicket = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      const ticket = await ticketService.purchaseTicket(eventId);
      toast.success("Ticket purchased successfully!");
      return ticket;
    } catch (err: any) {
      const message = err.response?.data?.error?.message || "Failed to purchase ticket";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingTickets = async (limit = 5) => {
    try {
      setLoading(true);
      setError(null);
      return await ticketService.getUpcomingTickets(limit);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || "Failed to load tickets";
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getMyTickets = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      return await ticketService.getMyTickets(page, limit);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || "Failed to load tickets";
      setError(message);
      return { success: true as const, data: [], pagination: { page, limit, total: 0, pages: 0 } };
    } finally {
      setLoading(false);
    }
  };

  const refundTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      setError(null);
      const ticket = await ticketService.refundTicket(ticketId);
      toast.success("Ticket refunded successfully!");
      return ticket;
    } catch (err: any) {
      const message = err.response?.data?.error?.message || "Failed to refund ticket";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTicketById = async (ticketId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await ticketService.getTicketById(ticketId);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || "Failed to load ticket";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    purchaseTicket,
    getUpcomingTickets,
    getMyTickets,
    refundTicket,
    getTicketById,
  };
};
