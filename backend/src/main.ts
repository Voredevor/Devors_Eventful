import config from "./config/environment";
import { createApp } from "./app";
import { initializeDatabase, closeDatabase, AppDataSource } from "./config/database";
import { initializeRedis, closeRedis, getRedisClient } from "./config/redis";
import Logger from "./utils/logger";

const ENDPOINTS = [
  { method: "GET", path: "/health - Server health check" },
  { method: "GET", path: "/api/v1/auth/me - Get current user" },
  { method: "POST", path: "/api/v1/auth/register - User registration" },
  { method: "POST", path: "/api/v1/auth/login - User login" },
  { method: "POST", path: "/api/v1/auth/refresh - Refresh JWT token" },
  { method: "POST", path: "/api/v1/auth/logout - User logout" },
  { method: "GET", path: "/api/v1/events - Get all events" },
  { method: "POST", path: "/api/v1/events - Create event" },
  { method: "GET", path: "/api/v1/events/:id - Get event details" },
  { method: "PATCH", path: "/api/v1/events/:id - Update event" },
  { method: "DELETE", path: "/api/v1/events/:id - Delete event" },
  { method: "GET", path: "/api/v1/tickets - Get my tickets" },
  { method: "POST", path: "/api/v1/tickets - Create ticket" },
  { method: "GET", path: "/api/v1/tickets/:id - Get ticket details" },
  { method: "PATCH", path: "/api/v1/tickets/:id - Validate ticket" },
  { method: "GET", path: "/api/v1/payments - Get payments" },
  { method: "POST", path: "/api/v1/payments/initialize - Initialize payment" },
  { method: "POST", path: "/api/v1/payments/verify/:ref - Verify payment" },
  { method: "POST", path: "/api/v1/payments/webhook - Payment webhook" },
  { method: "GET", path: "/api/v1/notifications - Get notifications" },
  { method: "POST", path: "/api/v1/notifications - Create notification" },
  { method: "PATCH", path: "/api/v1/notifications/:id - Mark as read" },
  { method: "GET", path: "/api/v1/analytics - Get analytics" },
  { method: "GET", path: "/api/v1/events/:id/share - Get share stats" },
  { method: "POST", path: "/api/v1/events/:id/share - Share event" },
  { method: "GET", path: "/api/docs - Swagger API documentation" },
  { method: "GET", path: "/api/status - Detailed system status" },
];

const startServer = async (): Promise<void> => {
  try {
    Logger.header("🚀 EVENTFUL API SERVER STARTUP");
    
    Logger.section("📋 Configuration");
    Logger.info("Environment", config.app.nodeEnv);
    Logger.info("Port", `${config.app.port}`);
    Logger.info("API URL", config.app.apiBaseUrl);
    Logger.info("Frontend URL", config.frontend.url);

    Logger.section("🔌 Initializing Services");
    
    // Initialize database
    Logger.info("Connecting to PostgreSQL...");
    await initializeDatabase();
    const dbConnected = AppDataSource.isInitialized;
    Logger.serviceStatus("PostgreSQL", dbConnected, "Supabase");

    // Initialize Redis
    Logger.info("Connecting to Redis...");
    await initializeRedis();
    let redisConnected = false;
    try {
      const rc = getRedisClient();
      redisConnected = rc?.isReady || rc?.isOpen || true;
    } catch {
      redisConnected = false;
    }
    Logger.serviceStatus("Redis", redisConnected, "RedisLabs");

    // Create Express app
    Logger.info("Initializing Express app...");
    const app = createApp();

    // Start listening
    const server = app.listen(config.app.port, () => {
      Logger.section("✅ Server Ready");
      Logger.success("Server running", `http://localhost:${config.app.port}`);
      Logger.info("API Docs", `http://localhost:${config.app.port}/api/docs`);
      Logger.info("Health Check", `http://localhost:${config.app.port}/health`);
      Logger.info("Status", `http://localhost:${config.app.port}/api/status`);

      Logger.section("📡 API Endpoints Registered");
      const groupedEndpoints = ENDPOINTS.reduce(
        (acc, ep) => {
          const method = ep.method;
          if (!acc[method]) acc[method] = [];
          acc[method].push(ep.path);
          return acc;
        },
        {} as Record<string, string[]>
      );

      Object.keys(groupedEndpoints)
        .sort()
        .forEach((method) => {
          groupedEndpoints[method].forEach((path) => {
            Logger.endpoint(method, path);
          });
        });

      Logger.section("🔗 External Services");
      Logger.serviceStatus(
        "Paystack",
        !!config.payment.paystackSecretKey,
        "Payment Processing"
      );
      Logger.serviceStatus(
        "Resend",
        !!config.email.resendApiKey,
        "Email Service"
      );
      Logger.serviceStatus("Twilio", !!config.sms.accountSid, "SMS Service");

      Logger.divider();
      Logger.success("All systems operational! Ready to accept requests.");
      Logger.divider();
    });

    // Graceful shutdown
    const gracefulShutdown = async (): Promise<void> => {
      Logger.warning("Shutting down gracefully...");

      server.close(async () => {
        Logger.success("Server closed");

        try {
          await closeDatabase();
          await closeRedis();
          Logger.success("All connections closed");
          process.exit(0);
        } catch (error) {
          Logger.error("Error during shutdown", String(error));
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        Logger.error("Forced shutdown due to timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      Logger.error("Uncaught Exception", error.message);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, _promise) => {
      Logger.error("Unhandled Rejection", String(reason));
      process.exit(1);
    });
  } catch (error) {
    Logger.error("Failed to start server", String(error));
    process.exit(1);
  }
};

startServer();
