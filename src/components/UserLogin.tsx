// src/components/Login.jsx
import { useState } from "react";
import api from "../utils/api";
import type { User } from "../types";

export default function UserLogin({
  onLogin,
}: {
  onLogin: (user: User) => void;
}) {
  //export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Submitting login for:", email, password);

    try {
      const response = await api.post("/login", { email, password });
      const { user, token } = response.data;

      console.log("Login successful:", user, token);

      // Zapisz token w localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Wywołaj callback, aby powiadomić App o zalogowaniu
      // onLogin(user);
      onLogin(user);
    } catch (err) {
      console.log("Login error details:", err);
      setError(err.response?.data?.error || "Błąd logowania");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h2 className="text-xl font-bold mb-4">Logowanie</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full rounded"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Zaloguj
        </button>
      </form>
    </div>
  );
}
