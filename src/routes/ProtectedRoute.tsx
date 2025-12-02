// src/components/ProtectedRoute.tsx

import { useSelector } from "react-redux";
import type { RootState } from "../store";
import type { JSX } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  //children: JSX.Element;
  children: React.ReactNode;
  requiredRole?: "user" | "admin";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  //const { user } = useSelector((state: RootState) => state.auth);
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
      />
    );
  }

  if (user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
// Brak zalogowanego użytkownika → przekierowanie na /homepage
// if (!user) {
//   return <Navigate to="/homepage" replace />;
// }

// // Jeśli jest wymagane sprawdzenie roli i user nie spełnia warunku
// if (requiredRole && user.role !== requiredRole) {
//   return <Navigate to="/homepage" replace />;
// }

//return children;
//}
