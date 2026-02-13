import axios from "axios";
import crypto from "crypto";
import { paymentRepository } from "@repositories/PaymentRepository";
import { ticketRepository } from "@repositories/TicketRepository";
import { eventRepository } from "@repositories/EventRepository";
import { Payment } from "@models/Payment";
import { User } from "@models/User";
import { ValidationError, NotFoundError, AuthorizationError } from "@utils/errors";
import config from "@config/environment";
import { AppDataSource } from "@config/database";

const PAYSTACK_API_BASE = "https://api.paystack.co";
const PAYSTACK_SECRET = config.payment.paystackSecretKey;

interface InitializePaymentData {
  userId: string;
  eventId: string;
  ticketId: string;
  amount: number;
}

export class PaymentService {
  async initializePayment(data: InitializePaymentData): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
    // Validate ticket exists and is active
    const ticket = await ticketRepository.findById(data.ticketId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    if (ticket.userId !== data.userId) {
      throw new AuthorizationError("Unauthorized access to this ticket");
    }

    // Check if payment already exists for this ticket
    const existingPayment = await paymentRepository.findByTicketId(data.ticketId);
    if (existingPayment && existingPayment.status === "completed") {
      throw new ValidationError("Payment already completed for this ticket");
    }

    // Get user details for payment
    const user = await AppDataSource
      .getRepository(User)
      .findOne({
        where: { id: data.userId },
      });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Create pending payment record
    const payment = await paymentRepository.create({
      userId: data.userId,
      eventId: data.eventId,
      ticketId: data.ticketId,
      amount: data.amount,
      currency: "NGN",
      status: "pending",
      paymentMethod: "paystack",
    });

    // Initialize Paystack payment
    try {
      const paystackResponse = await axios.post(
        `${PAYSTACK_API_BASE}/transaction/initialize`,
        {
          email: user.email,
          amount: data.amount * 100, // Amount in kobo
          reference: payment.id,
          metadata: {
            userId: data.userId,
            eventId: data.eventId,
            ticketId: data.ticketId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!paystackResponse.data.status) {
        throw new Error("Failed to initialize Paystack payment");
      }

      // Update payment with Paystack reference
      await paymentRepository.update(payment.id, {
        paymentReference: paystackResponse.data.data.reference,
      });

      return {
        authorizationUrl: paystackResponse.data.data.authorization_url,
        accessCode: paystackResponse.data.data.access_code,
        reference: paystackResponse.data.data.reference,
      };
    } catch (error: any) {
      // Delete payment record if Paystack initialization fails
      await paymentRepository.delete(payment.id);
      throw new Error(`Paystack initialization failed: ${error.message}`);
    }
  }

  async verifyPayment(reference: string): Promise<Payment> {
    // Find payment by reference
    const payment = await paymentRepository.findByReference(reference);
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    if (payment.status === "completed") {
      return payment;
    }

    // Verify with Paystack
    try {
      const response = await axios.get(`${PAYSTACK_API_BASE}/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      });

      if (!response.data.status) {
        throw new Error("Payment verification failed");
      }

      const paystackData = response.data.data;

      if (paystackData.status === "success") {
        // Update payment status
        const updatedPayment = await paymentRepository.update(payment.id, {
          status: "completed",
          paymentDate: new Date(),
        });

        // Update ticket status to active
        await ticketRepository.update(payment.ticketId, {
          status: "active",
        });

        return updatedPayment;
      } else {
        // Mark as failed
        await paymentRepository.update(payment.id, {
          status: "failed",
        });
        throw new ValidationError("Payment was not successful");
      }
    } catch (error: any) {
      await paymentRepository.update(payment.id, {
        status: "failed",
      });
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  async handleWebhook(body: any, signature: string): Promise<Payment> {
    // Verify webhook signature
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(JSON.stringify(body)).digest("hex");

    if (hash !== signature) {
      throw new ValidationError("Invalid webhook signature");
    }

    if (body.event === "charge.success") {
      const reference = body.data.reference;
      return this.verifyPayment(reference);
    }

    throw new ValidationError("Unsupported webhook event");
  }

  async refundPayment(paymentId: string, userId: string): Promise<Payment> {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    if (payment.userId !== userId) {
      throw new AuthorizationError("Unauthorized access to this payment");
    }

    if (payment.status !== "completed") {
      throw new ValidationError("Only completed payments can be refunded");
    }

    // Check if ticket has been scanned
    const ticket = await ticketRepository.findById(payment.ticketId);
    if (ticket && ticket.qrScanned) {
      throw new ValidationError("Cannot refund a ticket that has been used");
    }

    // Process refund with Paystack
    try {
      const response = await axios.post(
        `${PAYSTACK_API_BASE}/refund`,
        {
          transaction: payment.paymentReference,
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.status) {
        throw new Error("Refund failed");
      }

      // Update payment status
      const updatedPayment = await paymentRepository.update(paymentId, {
        status: "refunded",
      });

      // Update ticket status
      if (ticket) {
        await ticketRepository.update(payment.ticketId, {
          status: "refunded",
        });
      }

      return updatedPayment;
    } catch (error: any) {
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  async getPaymentById(paymentId: string, userId?: string): Promise<Payment> {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }

    if (userId && payment.userId !== userId) {
      throw new AuthorizationError("Unauthorized access to this payment");
    }

    return payment;
  }

  async getPaymentsByUserId(userId: string, page = 1, limit = 10): Promise<{ payments: Payment[]; total: number; pages: number }> {
    const { payments, total } = await paymentRepository.findByUserId(userId, page, limit);
    return {
      payments,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getPaymentsByEventId(eventId: string, page = 1, limit = 10): Promise<{ payments: Payment[]; total: number; pages: number }> {
    const { payments, total } = await paymentRepository.findByEventId(eventId, page, limit);
    return {
      payments,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getEventRevenue(eventId: string): Promise<number> {
    return paymentRepository.getTotalRevenue(eventId);
  }
}

export const paymentService = new PaymentService();
