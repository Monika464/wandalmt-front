//import { useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { formatTimeRemaining } from "../utils/authUtils";
import { useTranslation } from "react-i18next";

import UserProductsDashboard from "./UserProductDashboard";

const UserPanel = () => {
  const { isAuthenticated, user, isLoading, timeUntilExpiry } = useAuth();
  const { t } = useTranslation();

  if (isLoading) {
    return <div>{t("userPanel.loading")}</div>;
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
          ⏰ {t("userPanel.sessionExpiresIn")}:{" "}
          {formatTimeRemaining(timeUntilExpiry)}
        </div>
      )}
      <h1>
        {t("userPanel.welcome", {
          name: user ? user.name : t("userPanel.guest"),
        })}
      </h1>
      <UserProductsDashboard />
    </div>
  );
};

export default UserPanel;
