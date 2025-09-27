// // src/components/Login.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth";
// import api from "../utils/api";
// import axios from "axios";

// const UserLogin = () => {
//   //export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const response = await api.post("/login", { email, password });
//       const { user, token } = response.data;

//       console.log("Login successful", user);

//       login(user, token);

//       navigate("/userpanel");
//     } catch (err: unknown) {
//       if (axios.isAxiosError(err) && err.response) {
//         setError(err.response.data.error || "Błąd logowania");
//       } else if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Nieznany błąd");
//       }
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 border rounded">
//       <h2 className="text-xl font-bold mb-4">Logowanie</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="border p-2 w-full rounded"
//         />
//         <input
//           type="password"
//           placeholder="Hasło"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="border p-2 w-full rounded"
//         />
//         {error && <p className="text-red-500">{error}</p>}
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           Zaloguj
//         </button>
//         {error && <p>{error}</p>}
//       </form>
//     </div>
//   );
// };

// export default UserLogin;
