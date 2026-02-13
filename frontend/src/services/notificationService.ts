import { api } from "./api";
import { Notification } from "@/types";

export const notificationService = {
  async getNotifications(page = 1, limit = 20): Promise<{ data: Notification[]; unreadCount: number; pagination: any }> {
    const response = await api.get<{ data: { notifications: Notification[]; unreadCount: number }; pagination: any }>(
      `/v1/notifications?page=${page}&limit=${limit}`
    );
    return {
      data: response.data.notifications,
      unreadCount: response.data.unreadCount,
      pagination: response.pagination,
    };
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ data: { unreadCount: number } }>("/v1/notifications/unread/count");
    return response.data.unreadCount;
  },

  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await api.patch<{ data: { notification: Notification } }>(
      `/v1/notifications/${notificationId}/read`,
      {}
    );
    return response.data.notification;
  },

  async markAllAsRead(): Promise<void> {
    await api.post("/v1/notifications/mark-all-read", {});
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/v1/notifications/${notificationId}`);
  },
};
