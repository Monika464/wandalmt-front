// src/routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: "user" | "admin";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    // jeśli brak zalogowanego usera, przekieruj na stronę logowania
    return <Navigate to="/homepage" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // jeśli user nie ma wymaganej roli
    return <Navigate to="/homepage" replace />;
  }

  return children;
}
