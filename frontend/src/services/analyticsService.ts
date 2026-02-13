import { api as apiClient } from "./api";

export interface EventAnalytics {
  totalAttendees: number;
  totalTicketsSold: number;
  ticketHoldersWithScannedQr: number;
  revenue: number;
  qrScanRate: number;
}

export interface CreatorDashboard {
  totalEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  totalTicketsSold: number;
  averageQrScanRate: number;
  eventMetrics: Array<{
    eventId: string;
    eventTitle: string;
    totalTicketsSold: number;
    revenue: number;
    qrScanRate: number;
  }>;
}

export const getEventAnalytics = async (
  eventId: string
): Promise<EventAnalytics> => {
  const data = await apiClient.get<any>(`/analytics/events/${eventId}`);
  return data.data;
};

export const getCreatorDashboard = async (): Promise<CreatorDashboard> => {
  const data = await apiClient.get<any>(`/analytics/creator/dashboard`);
  return data.data;
};

export const updateEventAnalytics = async (eventId: string) => {
  const data = await apiClient.post<any>(`/analytics/events/${eventId}/update`);
  return data.data;
};

export const getTrendingEvents = async (limit: number = 5) => {
  const data = await apiClient.get<any>(`/analytics/trending?limit=${limit}`);
  return data.data;
};
