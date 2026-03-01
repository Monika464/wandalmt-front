//import { useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { formatTimeRemaining } from "../utils/authUtils";

//import type { RootState } from "../store";

import UserProductsDashboard from "./UserProductDashboard";

const UserPanel = () => {
  //const { user } = useSelector((state: RootState) => state.auth);
  const { isAuthenticated, user, isLoading, timeUntilExpiry } = useAuth();

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={`/login?redirect=${encodeURIComponent("/userpanel")}`} />
    );
  }

  if (user?.role !== "user") {
    return <Navigate to="/" />;
  }

  return (
    <div>
      {timeUntilExpiry > 0 && (
        <div
          style={{
            fontSize: "12px",
            color: "#666",
            backgroundColor: "#f0f0f0",
            padding: "5px",
            borderRadius: "4px",
            marginBottom: "10px",
          }}
        >
          ⏰ Sesja wygaśnie za: {formatTimeRemaining(timeUntilExpiry)}
        </div>
      )}
      <h1>Witaj, {user ? user.name : "Gościu"}!</h1>
      <UserProductsDashboard />
    </div>
  );
};

export default UserPanel;
