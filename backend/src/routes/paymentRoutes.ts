import { Router } from "express";
import { paymentController } from "@controllers/PaymentController";
import { authenticate } from "@middleware/auth";

const router = Router();

// Initialize payment (protected)
router.post("/initialize", authenticate, paymentController.initializePayment);

// Verify payment (protected)
router.get("/verify/:reference", authenticate, paymentController.verifyPayment);

// Webhook for Paystack (public - but verified with signature)
router.post("/webhook", paymentController.webhookHandler);

// Get specific payment (protected)
router.get("/:paymentId", authenticate, paymentController.getPayment);

// Get user payments (protected)
router.get("/", authenticate, paymentController.getUserPayments);

// Refund payment (protected)
router.post("/:paymentId/refund", authenticate, paymentController.refundPayment);

// Get event payments (protected - creator only)
router.get("/event/:eventId", authenticate, paymentController.getEventPayments);

// Get event revenue (protected - creator only)
router.get("/event/:eventId/revenue", authenticate, paymentController.getEventRevenue);

export default router;
