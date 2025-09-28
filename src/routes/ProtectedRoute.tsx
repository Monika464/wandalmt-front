// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import type { JSX } from "react";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: "user" | "admin";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user } = useSelector((state: RootState) => state.auth);

  // Brak zalogowanego użytkownika → przekierowanie na /homepage
  if (!user) {
    return <Navigate to="/homepage" replace />;
  }

  // Jeśli jest wymagane sprawdzenie roli i user nie spełnia warunku
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/homepage" replace />;
  }

  return children;
}

// src/routes/ProtectedRoute.tsx
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth";
// import type { JSX } from "react";

// interface ProtectedRouteProps {
//   children: JSX.Element;
//   requiredRole?: "user" | "admin";
// }

// export default function ProtectedRoute({
//   children,
//   requiredRole,
// }: ProtectedRouteProps) {
//   const { user } = useAuth();

//   if (!user) {
//     // jeśli brak zalogowanego usera, przekieruj na stronę logowania
//     return <Navigate to="/homepage" replace />;
//   }

//   if (requiredRole && user.role !== requiredRole) {
//     // jeśli user nie ma wymaganej roli
//     return <Navigate to="/homepage" replace />;
//   }

//   return children;
// }
