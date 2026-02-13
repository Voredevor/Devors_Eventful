import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { errorHandler, asyncHandler } from "./middleware/errorHandler";
import { apiRateLimiter } from "./middleware/rateLimiter";
import config from "./config/environment";
import { AppDataSource } from "./config/database";
import { getRedisClient } from "./config/redis";

import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import ticketRoutes from "./routes/ticketRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import eventShareRoutes from "./routes/eventShareRoutes";

let appInstance: Express | null = null;

export const createApp = (): Express => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.frontend.url,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ limit: "10kb", extended: true }));

  // Health check endpoint
  app.get("/health", asyncHandler(async (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
    });
  }));

  // API documentation
  const swaggerDocument = {
    openapi: "3.0.0",
    info: {
      title: "Eventful API",
      version: "1.0.0",
      description: "Event Ticketing Platform API",
      contact: {
        name: "Eventful Team",
      },
    },
    servers: [
      {
        url: config.app.apiBaseUrl,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  };

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Global rate limiter
  app.use("/api/", apiRateLimiter);

  // API Routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/events", eventRoutes);
  app.use("/api/v1/tickets", ticketRoutes);
  app.use("/api/v1/payments", paymentRoutes);
  app.use("/api/v1/notifications", notificationRoutes);
  app.use("/api/v1/analytics", analyticsRoutes);
  app.use("/api/v1/events", eventShareRoutes);

  // System Status Endpoint
  app.get(
    "/api/status",
    asyncHandler(async (_req, res) => {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      const timestamp = new Date().toISOString();

      const status = {
        success: true,
        timestamp,
        uptime: {
          seconds: Math.floor(uptime),
          formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        },
        system: {
          environment: config.app.nodeEnv,
          port: config.app.port,
          apiUrl: config.app.apiBaseUrl,
          frontendUrl: config.frontend.url,
        },
        services: {
          database: {
            name: "PostgreSQL (Supabase)",
            connected: AppDataSource.isInitialized,
            host: config.database.host,
            port: config.database.port,
            database: config.database.database,
          },
          redis: {
            name: "Redis",
            connected: (() => {
              try {
                const rc = getRedisClient();
                return rc?.isReady || rc?.isOpen || false;
              } catch {
                return false;
              }
            })(),
            host: config.redis.host,
            port: config.redis.port,
          },
          email: {
            service: "Resend",
            configured: !!config.email.resendApiKey,
            from: config.email.resendFromEmail,
          },
          sms: {
            service: "Twilio",
            configured: !!config.sms.accountSid,
          },
          payments: {
            service: "Paystack",
            configured: !!config.payment.paystackSecretKey,
          },
        },
        memory: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        },
        endpoints: {
          auth: [
            "GET /api/v1/auth/me",
            "POST /api/v1/auth/register",
            "POST /api/v1/auth/login",
            "POST /api/v1/auth/refresh",
            "POST /api/v1/auth/logout",
          ],
          events: [
            "GET /api/v1/events",
            "POST /api/v1/events",
            "GET /api/v1/events/:id",
            "PATCH /api/v1/events/:id",
            "DELETE /api/v1/events/:id",
          ],
          tickets: [
            "GET /api/v1/tickets",
            "POST /api/v1/tickets",
            "GET /api/v1/tickets/:id",
            "PATCH /api/v1/tickets/:id",
          ],
          payments: [
            "GET /api/v1/payments",
            "POST /api/v1/payments/initialize",
            "POST /api/v1/payments/verify/:ref",
            "POST /api/v1/payments/webhook",
          ],
          notifications: [
            "GET /api/v1/notifications",
            "POST /api/v1/notifications",
            "PATCH /api/v1/notifications/:id",
          ],
          analytics: ["GET /api/v1/analytics"],
          sharing: [
            "GET /api/v1/events/:id/share",
            "POST /api/v1/events/:id/share",
          ],
          docs: ["GET /api/docs", "GET /api/status", "GET /health"],
        },
      };

      res.status(200).json(status);
    })
  );

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
        statusCode: 404,
      },
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  appInstance = app;
  return app;
};

export const getApp = (): Express => {
  if (!appInstance) {
    throw new Error("App not initialized. Call createApp first.");
  }
  return appInstance;
};
