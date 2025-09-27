// src/components/Register.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";

type Role = "user" | "admin";

interface RegisterFormData {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: Role;
}

const Register = () => {
  const { user: currentUser, token } = useAuth(); // aktualnie zalogowany użytkownik
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    surname: "",
    email: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Decydujemy, który endpoint użyć
      const endpoint =
        formData.role === "admin" && currentUser?.role === "admin"
          ? "/register-admin"
          : "/register";

      const response = await api.post(endpoint, formData, {
        headers:
          formData.role === "admin"
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
      });

      setSuccess(
        `Użytkownik został pomyślnie zarejestrowany jako ${formData.role}!`
      );

      setFormData({
        name: "",
        surname: "",
        email: "",
        password: "",
        role: "user",
      });
    } catch (err: any) {
      console.log("co za blad", err);
      setError(err.response?.data?.error || "Błąd podczas rejestracji");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h2 className="text-xl font-bold mb-4">Rejestracja</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Imię"
          value={formData.name}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="text"
          name="surname"
          placeholder="Nazwisko"
          value={formData.surname}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Hasło"
          value={formData.password}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />

        {/* Wybór roli - admin widoczny tylko dla aktualnego admina */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          disabled={currentUser?.role !== "admin"}
        >
          <option value="user">User</option>
          {currentUser?.role === "admin" && (
            <option value="admin">Admin</option>
          )}
        </select>

        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Zarejestruj
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-600 mt-2">{success}</p>}
      </form>
    </div>
  );
};

export default Register;

// // src/components/Register.tsx
// import { useState } from "react";
// import type { FormEvent } from "react";
// import api from "../utils/api"; // Twój axios/fetch wrapper

// type Role = "user" | "admin";

// interface RegisterFormData {
//   name: string;
//   surname: string;
//   email: string;
//   password: string;
//   role: Role;
// }

// const Register = () => {
//   const [formData, setFormData] = useState<RegisterFormData>({
//     name: "",
//     surname: "",
//     email: "",
//     password: "",
//     role: "user",
//   });

//   const [error, setError] = useState<string>("");
//   const [success, setSuccess] = useState<string>("");

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     try {
//       const response = await api.post("/register", formData);
//       setSuccess("Użytkownik został pomyślnie zarejestrowany!");
//       setFormData({
//         name: "",
//         surname: "",
//         email: "",
//         password: "",
//         role: "user",
//       });
//     } catch (err: any) {
//       setError(err.response?.data?.error || "Błąd podczas rejestracji");
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto mt-10 p-6 border rounded">
//       <h2 className="text-xl font-bold mb-4">Rejestracja</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="text"
//           name="name"
//           placeholder="Imię"
//           value={formData.name}
//           onChange={handleChange}
//           className="border p-2 w-full rounded"
//           required
//         />
//         <input
//           type="text"
//           name="surname"
//           placeholder="Nazwisko"
//           value={formData.surname}
//           onChange={handleChange}
//           className="border p-2 w-full rounded"
//           required
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           className="border p-2 w-full rounded"
//           required
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Hasło"
//           value={formData.password}
//           onChange={handleChange}
//           className="border p-2 w-full rounded"
//           required
//         />
//         <select
//           name="role"
//           value={formData.role}
//           onChange={handleChange}
//           className="border p-2 w-full rounded"
//         >
//           <option value="user">User</option>
//           <option value="admin">Admin</option>
//         </select>

//         <button
//           type="submit"
//           className="bg-green-500 text-white px-4 py-2 rounded"
//         >
//           Zarejestruj
//         </button>

//         {error && <p className="text-red-500 mt-2">{error}</p>}
//         {success && <p className="text-green-600 mt-2">{success}</p>}
//       </form>
//     </div>
//   );
// };

// export default Register;
