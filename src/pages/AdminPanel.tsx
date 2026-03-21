import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AdminOrdersSummary from "../components/orders/AdminOrdersSummary";
import AdminFinancials from "../components/orders/AdminFinancials";

const AdminPanel = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={`/login?redirect=${encodeURIComponent("/adminpanel")}`} />
    );
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <div className="p-6">
      <AdminOrdersSummary />
      <AdminFinancials />
      <br></br>
      <br></br>

      <br></br>
      <br></br>
    </div>
  );
};

export default AdminPanel;
