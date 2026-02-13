import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "creator" | "eventee";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.userType !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
