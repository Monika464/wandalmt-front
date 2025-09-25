// src/routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { JSX } from "react";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: "user" | "admin";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <div>Ładowanie...</div>;

  if (!user) {
    // jeśli brak zalogowanego usera, przekieruj na stronę logowania
    return <Navigate to="/userlogin" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // jeśli user nie ma wymaganej roli
    return <Navigate to="/userlogin" replace />;
  }

  return children;
}
