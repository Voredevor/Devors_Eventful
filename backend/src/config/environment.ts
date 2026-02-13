import dotenv from "dotenv";

dotenv.config();

export const config = {
  app: {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
    apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret",
    expiryTime: process.env.JWT_EXPIRY || "24h",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
    refreshExpiryTime: process.env.JWT_REFRESH_EXPIRY || "7d",
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "eventful_db",
    ssl: process.env.DB_SSL === "true",
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0", 10),
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY || "",
    resendFromEmail: process.env.RESEND_EMAIL_FROM || "noreply@eventful.com",
  },
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
  },
  payment: {
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || "",
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
    paystackWebhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || "",
  },
  frontend: {
    url: process.env.FRONTEND_URL || "http://localhost:5173",
  },
  logging: {
    logLevel: process.env.LOG_LEVEL || "info",
  },
};

export default config;
