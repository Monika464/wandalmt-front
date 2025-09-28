// src/components/Register.tsx
import { useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, registerAdmin } from "../store/slices/authSlice";
import type { AppDispatch, RootState } from "../store";
import { useNavigate } from "react-router-dom";

type Role = "user" | "admin";

interface RegisterFormData {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: Role;
}

const Register = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    user: currentUser,
    status,
    error,
  } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    surname: "",
    email: "",
    password: "",
    role: "user",
  });

  //console.log("Current User:", currentUser);

  const [success, setSuccess] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess("");

    try {
      if (formData.role === "admin" && currentUser?.role === "admin") {
        await dispatch(
          registerAdmin({
            name: formData.name,
            surname: formData.surname,
            email: formData.email,
            password: formData.password,
          })
        ).unwrap();
        setSuccess("Admin został pomyślnie zarejestrowany!");
      } else {
        // Rejestracja zwykłego usera + automatyczne logowanie
        //await dispatch(registerUser(formData)).unwrap();
        await dispatch(
          registerUser({
            name: formData.name,
            surname: formData.surname,
            email: formData.email,
            password: formData.password,
          })
        ).unwrap();
        navigate("/userpanel");
      }

      // Reset formularza
      setFormData({
        name: "",
        surname: "",
        email: "",
        password: "",
        role: "user",
      });
    } catch (err: any) {
      console.error("Błąd rejestracji:", err);
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

        {/* Jeśli aktualny user jest adminem, pokazujemy wybór roli */}
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
          className="bg-green-500 text-white px-4 py-2 rounded w-full"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Rejestrowanie..." : "Zarejestruj"}
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
// import api from "../utils/api";
// import { useAuth } from "../hooks/useAuth";
// import { useNavigate } from "react-router-dom";

// type Role = "user" | "admin";

// interface RegisterFormData {
//   name: string;
//   surname: string;
//   email: string;
//   password: string;
//   role: Role;
// }

// const Register = () => {
//   const { user: currentUser, token, login } = useAuth(); // aktualnie zalogowany użytkownik
//   const [formData, setFormData] = useState<RegisterFormData>({
//     name: "",
//     surname: "",
//     email: "",
//     password: "",
//     role: "user",
//   });

//   const [error, setError] = useState<string>("");
//   const [success, setSuccess] = useState<string>("");

//   const navigate = useNavigate();

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
//       // Decydujemy, który endpoint użyć
//       const endpoint =
//         formData.role === "admin" && currentUser?.role === "admin"
//           ? "/register-admin"
//           : "/register";

//       const response = await api.post(endpoint, formData, {
//         headers:
//           formData.role === "admin"
//             ? {
//                 Authorization: `Bearer ${token}`,
//               }
//             : {},
//       });

//       //   setSuccess(
//       //     `Użytkownik został pomyślnie zarejestrowany jako ${formData.role}!`
//       //   );
//       // Złap wartość role w stałą – TypeScript będzie spokojny
//       const role: Role = formData.role;

//       // Jeżeli to user – zaloguj automatycznie
//       if (formData.role === "user") {
//         const { user, token } = response.data; // backend zwraca user + token
//         login(user, token); // z useAuth
//         navigate("/userpanel");
//       }

//       if (formData.role === "admin") {
//         // admin – nie logujemy, tylko komunikat
//         setSuccess("Admin został pomyślnie zarejestrowany!");
//       }

//       setFormData({
//         name: "",
//         surname: "",
//         email: "",
//         password: "",
//         role: "user",
//       });
//     } catch (err: unknown) {
//       console.log("co za blad", err);
//       if (
//         err &&
//         typeof err === "object" &&
//         "response" in err &&
//         err.response &&
//         typeof err.response === "object" &&
//         "data" in err.response &&
//         err.response.data &&
//         typeof err.response.data === "object" &&
//         "error" in err.response.data
//       ) {
//         setError(
//           (err.response as { data: { error: string } }).data.error ||
//             "Błąd podczas rejestracji"
//         );
//       } else {
//         setError("Błąd podczas rejestracji");
//       }
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

//         {/* Wybór roli - admin widoczny tylko dla aktualnego admina */}
//         <select
//           name="role"
//           value={formData.role}
//           onChange={handleChange}
//           className="border p-2 w-full rounded"
//           disabled={currentUser?.role !== "admin"}
//         >
//           <option value="user">User</option>
//           {currentUser?.role === "admin" && (
//             <option value="admin">Admin</option>
//           )}
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

// // // src/components/Register.tsx
// // import { useState } from "react";
// // import type { FormEvent } from "react";
// // import api from "../utils/api"; // Twój axios/fetch wrapper

// // type Role = "user" | "admin";

// // interface RegisterFormData {
// //   name: string;
// //   surname: string;
// //   email: string;
// //   password: string;
// //   role: Role;
// // }

// // const Register = () => {
// //   const [formData, setFormData] = useState<RegisterFormData>({
// //     name: "",
// //     surname: "",
// //     email: "",
// //     password: "",
// //     role: "user",
// //   });

// //   const [error, setError] = useState<string>("");
// //   const [success, setSuccess] = useState<string>("");

// //   const handleChange = (
// //     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
// //   ) => {
// //     const { name, value } = e.target;
// //     setFormData((prev) => ({ ...prev, [name]: value }));
// //   };

// //   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
// //     e.preventDefault();
// //     setError("");
// //     setSuccess("");

// //     try {
// //       const response = await api.post("/register", formData);
// //       setSuccess("Użytkownik został pomyślnie zarejestrowany!");
// //       setFormData({
// //         name: "",
// //         surname: "",
// //         email: "",
// //         password: "",
// //         role: "user",
// //       });
// //     } catch (err: any) {
// //       setError(err.response?.data?.error || "Błąd podczas rejestracji");
// //     }
// //   };

// //   return (
// //     <div className="max-w-md mx-auto mt-10 p-6 border rounded">
// //       <h2 className="text-xl font-bold mb-4">Rejestracja</h2>
// //       <form onSubmit={handleSubmit} className="space-y-4">
// //         <input
// //           type="text"
// //           name="name"
// //           placeholder="Imię"
// //           value={formData.name}
// //           onChange={handleChange}
// //           className="border p-2 w-full rounded"
// //           required
// //         />
// //         <input
// //           type="text"
// //           name="surname"
// //           placeholder="Nazwisko"
// //           value={formData.surname}
// //           onChange={handleChange}
// //           className="border p-2 w-full rounded"
// //           required
// //         />
// //         <input
// //           type="email"
// //           name="email"
// //           placeholder="Email"
// //           value={formData.email}
// //           onChange={handleChange}
// //           className="border p-2 w-full rounded"
// //           required
// //         />
// //         <input
// //           type="password"
// //           name="password"
// //           placeholder="Hasło"
// //           value={formData.password}
// //           onChange={handleChange}
// //           className="border p-2 w-full rounded"
// //           required
// //         />
// //         <select
// //           name="role"
// //           value={formData.role}
// //           onChange={handleChange}
// //           className="border p-2 w-full rounded"
// //         >
// //           <option value="user">User</option>
// //           <option value="admin">Admin</option>
// //         </select>

// //         <button
// //           type="submit"
// //           className="bg-green-500 text-white px-4 py-2 rounded"
// //         >
// //           Zarejestruj
// //         </button>

// //         {error && <p className="text-red-500 mt-2">{error}</p>}
// //         {success && <p className="text-green-600 mt-2">{success}</p>}
// //       </form>
// //     </div>
// //   );
// // };

// // export default Register;
