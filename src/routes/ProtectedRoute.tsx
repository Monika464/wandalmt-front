// src/components/ProtectedRoute.tsx

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
