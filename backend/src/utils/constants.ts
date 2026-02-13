export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 60 * 60, // 1 hour
  DAY: 24 * 60 * 60, // 24 hours
};

export const RATE_LIMIT = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts
  },
  API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  PAYMENT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 payment attempts per hour
  },
};

export const USER_TYPES = {
  CREATOR: "creator",
  EVENTEE: "eventee",
};

export const EVENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

export const TICKET_STATUS = {
  ACTIVE: "active",
  USED: "used",
  REFUNDED: "refunded",
};

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const NOTIFICATION_TYPE = {
  REMINDER: "reminder",
  UPDATE: "update",
  PAYMENT_RECEIPT: "payment_receipt",
  QR_SCAN: "qr_scan",
  EVENT_CANCELLED: "event_cancelled",
};

export const DELIVERY_METHOD = {
  EMAIL: "email",
  SMS: "sms",
  IN_APP: "in_app",
};

export const SOCIAL_PLATFORMS = {
  FACEBOOK: "facebook",
  TWITTER: "twitter",
  WHATSAPP: "whatsapp",
  INSTAGRAM: "instagram",
  EMAIL: "email",
};

export const REMINDER_OPTIONS = {
  ONE_DAY: "1day",
  ONE_WEEK: "1week",
  CUSTOM: "custom",
};

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
};
