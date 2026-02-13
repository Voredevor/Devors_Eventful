// API Error Response
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
  timestamp: string;
  path: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePictureUrl?: string;
  userType: "creator" | "eventee";
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth Response
export interface AuthResponse {
  success: true;
  user: User;
  token: string;
  refreshToken: string;
}

// Event Types
export interface Event {
  id: string;
  creatorId: string;
  creator?: User;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  location: string;
  startDate: string;
  endDate: string;
  totalTickets: number;
  soldTickets: number;
  price: number;
  status: "draft" | "published" | "cancelled" | "completed";
  reminderDefault: string;
  customReminderHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  location: string;
  startDate: string;
  endDate: string;
  totalTickets: number;
  price: number;
  reminderDefault: string;
  customReminderHours?: number;
}

// Ticket Types
export interface Ticket {
  id: string;
  eventId: string;
  event?: Event;
  userId: string;
  qrCodeData: string;
  qrCodeImageUrl: string;
  qrScanned: boolean;
  qrScannedAt?: string;
  purchaseDate: string;
  status: "active" | "used" | "refunded";
  createdAt: string;
}

// Payment Types
export interface Payment {
  id: string;
  userId: string;
  eventId: string;
  ticketId: string;
  amount: number;
  currency: string;
  paymentReference: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  paymentDate?: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  eventId?: string;
  type: string;
  title: string;
  message: string;
  scheduledDate?: string;
  sentDate?: string;
  deliveryMethod: string;
  read: boolean;
  createdAt: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Event Filters
export interface EventFilters extends PaginationParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Analytics
export interface EventAnalytics {
  totalAttendees: number;
  ticketsSold: number;
  revenue: number;
  qrScansCount: number;
  qrScanRate: number;
}

export interface CreatorAnalytics {
  totalEvents: number;
  totalAttendees: number;
  totalRevenue: number;
  trendingEvents: Event[];
}
