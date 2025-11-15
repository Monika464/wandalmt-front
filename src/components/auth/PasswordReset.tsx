import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  requestPasswordReset,
  resetPassword,
} from "../../store/slices/emailSlice";
import type { RootState, AppDispatch } from "../../store";

export const PasswordReset: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, success } = useSelector(
    (state: RootState) => state.auth
  );

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleRequestReset = () => dispatch(requestPasswordReset(email));
  const handleReset = () => dispatch(resetPassword({ token, newPassword }));

  return (
    <div>
      <h2>Odzyskiwanie hasła</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleRequestReset}>Wyślij link resetu</button>

      <hr />

      <input
        placeholder="Token z maila"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <input
        placeholder="Nowe hasło"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleReset}>Zresetuj hasło</button>

      {loading && <p>Ładowanie...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};
