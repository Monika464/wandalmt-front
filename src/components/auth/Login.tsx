// src/components/auth/Login.tsx
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { login } from "../../store/slices/authSlice";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { tokenRefreshService } from "../../services/tokenRefreshService";
import { useTranslation } from "react-i18next";

const Login = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state: RootState) => state.auth);
  const { isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/userpanel";

  // Efekt do przekierowania jeśli użytkownik jest już zalogowany
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("Użytkownik już zalogowany, przekierowuję...");
      const targetPath = user.role === "admin" ? "/adminpanel" : redirectTo;
      navigate(targetPath);
    }
  }, [isAuthenticated, user, navigate, redirectTo]);

  // Cleanup timer przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      tokenRefreshService.clearRefreshTimer();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Walidacja
    if (!email.trim()) {
      setLocalError(t("errors.emailRequired"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError(t("errors.emailInvalid"));
      return;
    }

    if (!password) {
      setLocalError(t("errors.passwordRequired"));
      return;
    }

    dispatch(login({ email, password })).then((result) => {
      if (login.fulfilled.match(result)) {
        const { expiresAt, user } = result.payload;

        // Po udanym logowaniu - ustaw timer odświeżania tokena
        if (expiresAt && user) {
          tokenRefreshService.setupTokenRefresh(expiresAt, () => {
            console.log("Token wymaga odświeżenia (callback z Login)");
          });

          console.log(
            `Token ważny do: ${new Date(expiresAt).toLocaleString()}`,
          );
        }

        if (result.payload.user.role === "admin") {
          navigate("/adminpanel");
        }
        if (result.payload.user.role === "user") {
          navigate(redirectTo);
        }
      }
    });
  };

  // Jeśli użytkownik jest już zalogowany, pokaż ładowanie
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">{t("login.alreadyLoggedIn")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded bg-white shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {t("login.title")}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("login.email")}
          </label>
          <input
            id="email"
            type="email"
            placeholder={t("login.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t("login.password")}
          </label>
          <input
            id="password"
            type="password"
            placeholder={t("login.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "loading" ? t("login.loggingIn") : t("login.submit")}
        </button>

        {/* Błędy */}
        {(error || localError) && (
          <p className="text-red-500 text-sm mt-2 text-center">
            {localError || error}
          </p>
        )}
      </form>

      {/* Linki pomocnicze */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-gray-600">
          {t("login.noAccount")}{" "}
          <Link
            to={`/register?redirect=${encodeURIComponent(redirectTo)}`}
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
          >
            {t("login.register")}
          </Link>
        </p>
        <p className="text-sm">
          <Link
            to={`/reset-password-request?redirect=${encodeURIComponent(redirectTo)}`}
            className="text-gray-500 hover:text-gray-700 hover:underline"
          >
            {t("login.forgotPassword")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

// import { useDispatch, useSelector } from "react-redux";
// import type { RootState, AppDispatch } from "../../store";
// import { login } from "../../store/slices/authSlice";
// import { useState, useEffect } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import { useAuth } from "../../hooks/useAuth";
// import { tokenRefreshService } from "../../services/tokenRefreshService";
// import Navbar from "../elements/Navbar";

// const Login = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { status, error } = useSelector((state: RootState) => state.auth);
//   const { isAuthenticated, user } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const params = new URLSearchParams(location.search);
//   const redirectTo = params.get("redirect") || "/userpanel";

//   // Efekt do przekierowania jeśli użytkownik jest już zalogowany
//   useEffect(() => {
//     if (isAuthenticated && user) {
//       console.log("Użytkownik już zalogowany, przekierowuję...");
//       const targetPath = user.role === "admin" ? "/adminpanel" : redirectTo;
//       navigate(targetPath);
//     }
//   }, [isAuthenticated, user, navigate, redirectTo]);

//   // Cleanup timer przy odmontowaniu komponentu
//   useEffect(() => {
//     return () => {
//       tokenRefreshService.clearRefreshTimer();
//     };
//   }, []);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     //console.log("Dispatching login for:", email);
//     dispatch(login({ email, password })).then((result) => {
//       if (login.fulfilled.match(result)) {
//         const { expiresAt, user } = result.payload;

//         // Po udanym logowaniu - ustaw timer odświeżania tokena
//         if (expiresAt && user) {
//           tokenRefreshService.setupTokenRefresh(expiresAt, () => {
//             console.log("Token wymaga odświeżenia (callback z Login)");
//             // Timer zadziała, ale rzeczywiste odświeżenie będzie
//             // obsłużone przez hook useAuth w innych komponentach
//           });

//           console.log(
//             `Token ważny do: ${new Date(expiresAt).toLocaleString()}`
//           );
//         }

//         if (result.payload.user.role === "admin") {
//           navigate("/adminpanel");
//         }
//         if (result.payload.user.role === "user") {
//           //navigate("/userpanel");
//           navigate(redirectTo);
//         }
//       }
//     });
//   };

//   // Jeśli użytkownik jest już zalogowany, pokaż ładowanie zamiast formularza
//   if (isAuthenticated) {
//     return (
//       <>
//         <Navbar />
//         <div style={{ textAlign: "center", padding: "50px" }}>
//           <p>Jesteś już zalogowany. Przekierowuję...</p>
//         </div>
//       </>
//     );
//   }
//   return (
//     <>
//       <Navbar />

//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           type="password"
//           placeholder="Hasło"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button type="submit">
//           {status === "loading" ? "Logowanie..." : "Zaloguj"}
//         </button>
//         {error && <p>{error}</p>}
//         <p>
//           Nie masz konta?{" "}
//           <Link to={`/register?redirect=${encodeURIComponent(redirectTo)}`}>
//             Zarejestruj się
//           </Link>
//           <Link
//             to={`/reset-password-request?redirect=${encodeURIComponent(
//               redirectTo
//             )}`}
//             style={{ marginLeft: "10px" }}
//           >
//             Zapomniałeś hasła?
//           </Link>
//         </p>
//       </form>
//     </>
//   );
// };

// export default Login;
