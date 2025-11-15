import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  resetPassword,
  clearEmailMessages,
} from "../../store/slices/emailSlice";
import type { RootState, AppDispatch } from "../../store";
import { useNavigate, useParams } from "react-router-dom";

const SetNewPassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token } = useParams(); // <-- tu pobieramy token z URL

  const { loading, error, success } = useSelector(
    (state: RootState) => state.email
  );

  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const handleResetPassword = () => {
    if (password !== passwordRepeat) {
      alert("Hasła muszą się zgadzać!");
      return;
    }

    dispatch(resetPassword({ token: token || "", newPassword: password }));
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearEmailMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div>
      <h2>Ustaw nowe hasło</h2>

      <input
        type="password"
        placeholder="Nowe hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Powtórz hasło"
        value={passwordRepeat}
        onChange={(e) => setPasswordRepeat(e.target.value)}
      />

      <button onClick={handleResetPassword} disabled={loading}>
        Zmień hasło
      </button>

      {loading && <p>Ładowanie...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && (
        <p style={{ color: "green" }}>
          Hasło zostało zmienione! Przekierowuję…
        </p>
      )}
    </div>
  );
};

export default SetNewPassword;
