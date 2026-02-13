import { useState } from "react";
import { paymentService } from "@services/paymentService";
import toast from "react-hot-toast";

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializePayment = async (eventId: string, ticketId: string, amount: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await paymentService.initializePayment(eventId, ticketId, amount);
      return result;
    } catch (err: any) {
      const message = err.response?.data?.error?.message || "Failed to initialize payment";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      setLoading(true);
      setError(null);
      const payment = await paymentService.verifyPayment(reference);
      toast.success("Payment verified successfully!");
      return payment;
    } catch (err: any) {
      const message = err.response?.data?.error?.message || "Failed to verify payment";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refundPayment = async (paymentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const payment = await paymentService.refundPayment(paymentId);
      toast.success("Payment refunded successfully!");
      return payment;
    } catch (err: any) {
      const message = err.response?.data?.error?.message || "Failed to refund payment";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserPayments = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      return await paymentService.getUserPayments(page, limit);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || "Failed to load payments";
      setError(message);
      return { success: true as const, data: [], pagination: { page, limit, total: 0, pages: 0 } };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    initializePayment,
    verifyPayment,
    refundPayment,
    getUserPayments,
  };
};
