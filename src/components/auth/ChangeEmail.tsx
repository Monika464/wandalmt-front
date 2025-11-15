import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeEmail } from "../../store/slices/emailSlice";
import type { RootState, AppDispatch } from "../../store";

export const ChangeEmail: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, success } = useSelector(
    (state: RootState) => state.email
  );

  const [newEmail, setNewEmail] = useState("");

  const handleChangeEmail = () => dispatch(changeEmail(newEmail));

  return (
    <div>
      <h2>Zmiana e-maila</h2>
      <input
        placeholder="Nowy e-mail"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
      />
      <button onClick={handleChangeEmail}>Zmień e-mail</button>

      {loading && <p>Ładowanie...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};
