import { api } from "./api";
import { Event, PaginatedResponse, EventFilters } from "@/types";

export const eventService = {
  async getPublishedEvents(
    filters?: EventFilters
  ): Promise<PaginatedResponse<Event>> {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.minPrice) params.append("minPrice", filters.minPrice.toString());
    if (filters?.maxPrice) params.append("maxPrice", filters.maxPrice.toString());

    const response = await api.get<{ data: Event[]; pagination: any }>(
      `/v1/events?${params.toString()}`
    );
    return { success: true, data: response.data, pagination: response.pagination };
  },

  async getEventById(eventId: string): Promise<Event> {
    const response = await api.get<{ data: Event }>(`/v1/events/${eventId}`);
    return response.data;
  },

  async getMyEvents(page = 1, limit = 10): Promise<PaginatedResponse<Event>> {
    const response = await api.get<{ data: Event[]; pagination: any }>(
      `/v1/events/my-events?page=${page}&limit=${limit}`
    );
    return { success: true, data: response.data, pagination: response.pagination };
  },

  async createEvent(data: Record<string, unknown>): Promise<Event> {
    const response = await api.post<{ data: Event }>("/v1/events", data);
    return response.data;
  },

  async updateEvent(eventId: string, data: Record<string, unknown>): Promise<Event> {
    const response = await api.patch<{ data: Event }>(`/v1/events/${eventId}`, data);
    return response.data;
  },

  async publishEvent(eventId: string): Promise<Event> {
    const response = await api.post<{ data: Event }>(`/v1/events/${eventId}/publish`, {});
    return response.data;
  },

  async cancelEvent(eventId: string): Promise<Event> {
    const response = await api.post<{ data: Event }>(`/v1/events/${eventId}/cancel`, {});
    return response.data;
  },

  async deleteEvent(eventId: string): Promise<void> {
    await api.delete(`/v1/events/${eventId}`);
  },

  async getUpcomingEvents(limit = 5): Promise<Event[]> {
    const response = await api.get<{ data: Event[] }>(`/v1/events/upcoming?limit=${limit}`);
    return response.data;
  },
};
