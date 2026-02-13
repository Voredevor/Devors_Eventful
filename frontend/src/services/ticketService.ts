import { api } from "./api";
import { Ticket, PaginatedResponse } from "@/types";

export const ticketService = {
  async purchaseTicket(eventId: string): Promise<Ticket> {
    const response = await api.post<{ data: { ticket: Ticket } }>("/v1/tickets/purchase", {
      eventId,
    });
    return response.data.ticket;
  },

  async getMyTickets(page = 1, limit = 10): Promise<PaginatedResponse<Ticket>> {
    const response = await api.get<{ data: Ticket[]; pagination: any }>(
      `/v1/tickets/my-tickets?page=${page}&limit=${limit}`
    );
    return {
      success: true,
      data: response.data,
      pagination: response.pagination,
    };
  },

  async getUpcomingTickets(limit = 5): Promise<Ticket[]> {
    const response = await api.get<{ data: Ticket[] }>(`/v1/tickets/upcoming?limit=${limit}`);
    return response.data;
  },

  async getTicketById(ticketId: string): Promise<Ticket> {
    const response = await api.get<{ data: Ticket }>(`/v1/tickets/${ticketId}`);
    return response.data;
  },

  async refundTicket(ticketId: string): Promise<Ticket> {
    const response = await api.post<{ data: Ticket }>(`/v1/tickets/${ticketId}/refund`, {});
    return response.data;
  },

  async scanTicket(qrData: string): Promise<Ticket> {
    const response = await api.post<{ data: Ticket }>("/v1/tickets/scan", { qrData });
    return response.data;
  },

  async getEventStatistics(eventId: string) {
    const response = await api.get<{ data: any }>(`/v1/tickets/event/${eventId}/statistics`);
    return response.data;
  },
};
