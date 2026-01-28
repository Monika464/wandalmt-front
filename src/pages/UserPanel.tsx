//import { useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { formatTimeRemaining } from "../utils/authUtils";

//import type { RootState } from "../store";

import Navbar from "../components/elements/Navbar";
import { Link } from "react-router-dom";
import { ChangeEmail } from "../components/auth/ChangeEmail";
import UserProfile from "../components/orders/UserProfile";

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
      <Navbar />
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
      {/* {user && <LogoutButton />} */}
      <Link
        to="userorders"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Zobacz orders
      </Link>
      <Link
        to="userresources"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Zobacz produkty
      </Link>
      <Link
        to="/user/products"
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 ml-4"
      >
        Produkty usera
      </Link>

      <ChangeEmail />

      <UserProfile />
    </div>
  );
};

export default UserPanel;
