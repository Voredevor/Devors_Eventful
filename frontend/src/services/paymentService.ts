import { api } from "./api";
import { Payment } from "@/types";

export const paymentService = {
  async initializePayment(eventId: string, ticketId: string, amount: number): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
    const response = await api.post<{
      data: {
        authorizationUrl: string;
        accessCode: string;
        reference: string;
      };
    }>("/v1/payments/initialize", {
      eventId,
      ticketId,
      amount,
    });
    return response.data;
  },

  async verifyPayment(reference: string): Promise<Payment> {
    const response = await api.get<{ data: { payment: Payment } }>(`/v1/payments/verify/${reference}`);
    return response.data.payment;
  },

  async getPaymentById(paymentId: string): Promise<Payment> {
    const response = await api.get<{ data: { payment: Payment } }>(`/v1/payments/${paymentId}`);
    return response.data.payment;
  },

  async getUserPayments(page = 1, limit = 10) {
    const response = await api.get<{ data: Payment[]; pagination: any }>(
      `/v1/payments?page=${page}&limit=${limit}`
    );
    return {
      success: true as const,
      data: response.data,
      pagination: response.pagination,
    };
  },

  async refundPayment(paymentId: string): Promise<Payment> {
    const response = await api.post<{ data: { payment: Payment } }>(
      `/v1/payments/${paymentId}/refund`,
      {}
    );
    return response.data.payment;
  },

  async getEventRevenue(eventId: string): Promise<{ totalRevenue: number; currency: string }> {
    const response = await api.get<{ data: any }>(`/v1/payments/event/${eventId}/revenue`);
    return response.data;
  },
};
