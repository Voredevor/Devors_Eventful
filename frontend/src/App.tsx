import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "@stores/authStore";
import LoginPage from "@pages/LoginPage";
import RegisterPage from "@pages/RegisterPage";
import HomePage from "@pages/HomePage";
import DashboardPage from "@pages/DashboardPage";
import EventListPage from "@pages/EventListPage";
import EventDetailPage from "@pages/EventDetailPage";
import EventCreatePage from "@pages/EventCreatePage";
import TicketPage from "@pages/TicketPage";
import MyTicketsPage from "@pages/MyTicketsPage";
import CheckoutPage from "@pages/CheckoutPage";
import NotificationsPage from "@pages/NotificationsPage";
import { AnalyticsDashboardPage } from "@pages/AnalyticsDashboardPage";
import { EventShareStatsPage } from "@pages/EventShareStatsPage";
import ProtectedRoute from "@components/Auth/ProtectedRoute";

const App: React.FC = () => {
  const { loadFromStorage, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events" element={<EventListPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:eventId"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:ticketId"
            element={
              <ProtectedRoute>
                <TicketPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute>
                <MyTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute requiredRole="creator">
                <AnalyticsDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:eventId/share-stats"
            element={
              <ProtectedRoute requiredRole="creator">
                <EventShareStatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/create"
            element={
              <ProtectedRoute requiredRole="creator">
                <EventCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:ticketId"
            element={
              <ProtectedRoute>
                <TicketPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute>
                <MyTicketsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />}
          />
        </Routes>
      </div>

      <Toaster position="top-right" />
    </Router>
  );
};

export default App;
