import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

export const ProtectedUserRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || user?.role !== "user") return <Navigate to="/auth/user" replace />;
  return <>{children}</>;
};

export const ProtectedAdminRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  // Non-admins hitting /admin get silently redirected to home — not to admin login
  // This prevents users from even knowing the admin login page exists
  if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};
