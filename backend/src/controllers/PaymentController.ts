import { Request, Response } from "express";
import { paymentService } from "@services/PaymentService";
import { asyncHandler } from "@middleware/errorHandler";
import { validateRequest } from "@utils/validators";

export const paymentController = {
  initializePayment: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { eventId, ticketId, amount } = req.body;
    const userId = (req as any).user.id;

    validateRequest(
      {
        eventId: "string",
        ticketId: "string",
        amount: "number",
      },
      req.body
    );

    if (amount <= 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_AMOUNT",
          message: "Amount must be greater than 0",
          statusCode: 400,
        },
      });
      return;
    }

    const result = await paymentService.initializePayment({
      userId,
      eventId,
      ticketId,
      amount,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  }),

  verifyPayment: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { reference } = req.params;

    if (!reference) {
      res.status(400).json({
        success: false,
        error: {
          code: "MISSING_REFERENCE",
          message: "Payment reference is required",
          statusCode: 400,
        },
      });
      return;
    }

    const payment = await paymentService.verifyPayment(reference);

    res.status(200).json({
      success: true,
      data: { payment },
    });
  }),

  webhookHandler: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers["x-paystack-signature"] as string;

    if (!signature) {
      res.status(401).json({
        success: false,
        error: {
          code: "INVALID_SIGNATURE",
          message: "Invalid webhook signature",
          statusCode: 401,
        },
      });
      return;
    }

    const payment = await paymentService.handleWebhook(req.body, signature);

    res.status(200).json({
      success: true,
      data: { payment },
    });
  }),

  getPayment: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { paymentId } = req.params;
    const userId = (req as any).user?.id;

    const payment = await paymentService.getPaymentById(paymentId, userId);

    res.status(200).json({
      success: true,
      data: { payment },
    });
  }),

  getUserPayments: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { payments, total, pages } = await paymentService.getPaymentsByUserId(userId, page, limit);

    res.status(200).json({
      success: true,
      data: { payments },
      pagination: { page, limit, total, pages },
    });
  }),

  getEventPayments: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { payments, total, pages } = await paymentService.getPaymentsByEventId(eventId, page, limit);

    res.status(200).json({
      success: true,
      data: { payments },
      pagination: { page, limit, total, pages },
    });
  }),

  refundPayment: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { paymentId } = req.params;
    const userId = (req as any).user.id;

    const payment = await paymentService.refundPayment(paymentId, userId);

    res.status(200).json({
      success: true,
      data: { payment },
      message: "Payment refunded successfully",
    });
  }),

  getEventRevenue: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { eventId } = req.params;

    const revenue = await paymentService.getEventRevenue(eventId);

    res.status(200).json({
      success: true,
      data: {
        eventId,
        totalRevenue: revenue,
        currency: "NGN",
      },
    });
  }),
};
