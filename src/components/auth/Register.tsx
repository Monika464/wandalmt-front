// src/components/Register.tsx
import { useEffect, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  registerAdmin,
  clearError,
} from "../../store/slices/authSlice";
import type { AppDispatch, RootState } from "../../store";
import { useLocation, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";

type Role = "user" | "admin";

interface RegisterFormData {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: Role;
}

const Register: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirectTo = params.get("redirect") || "/userpanel";

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
  const [localError, setLocalError] = useState<string>("");

  // Czyszczenie błędów przy załadowaniu komponentu
  useEffect(() => {
    dispatch(clearError());
    setLocalError("");
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Czyszczenie błędów przy zmianie pola
    if (error || localError) {
      dispatch(clearError());
      setLocalError("");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset błędów
    dispatch(clearError());
    setLocalError("");
    setSuccess("");

    // Walidacja
    if (!captchaToken) {
      //setLocalError("Potwierdź, że nie jesteś robotem.");
      setLocalError(t("errors.captchaRequired"));
      return;
    }

    if (!formData.name.trim()) {
      //setLocalError("Imię jest wymagane");
      setLocalError(t("errors.nameRequired"));
      return;
    }

    if (!formData.surname.trim()) {
      //setLocalError("Nazwisko jest wymagane");
      setLocalError(t("errors.surnameRequired"));
      return;
    }

    if (!formData.email.trim()) {
      //setLocalError("Email jest wymagany");
      setLocalError(t("errors.emailRequired"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      //setLocalError("Nieprawidłowy format email");
      setLocalError(t("errors.emailInvalid"));
      return;
    }

    if (!formData.password) {
      setLocalError(t("errors.passwordRequired"));
      return;
    }

    if (formData.password.length < 6) {
      setLocalError(t("errors.passwordMinLength"));
      return;
    }

    try {
      if (formData.role === "admin" && currentUser?.role === "admin") {
        await dispatch(
          registerAdmin({
            name: formData.name,
            surname: formData.surname,
            email: formData.email,
            password: formData.password,
          }),
        ).unwrap();
        //setSuccess("Admin został pomyślnie zarejestrowany!");
        setSuccess(t("register.successAdmin"));
      } else {
        // Rejestracja zwykłego usera + automatyczne logowanie
        //await dispatch(registerUser(formData)).unwrap();
        await dispatch(
          registerUser({
            name: formData.name,
            surname: formData.surname,
            email: formData.email,
            password: formData.password,
            captchaToken: captchaToken,
          }),
        ).unwrap();
        // Reset formularza
        setFormData({
          name: "",
          surname: "",
          email: "",
          password: "",
          role: "user",
        });
        setCaptchaToken(null);
        navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`);
      }

      // Reset formularza
      setFormData({
        name: "",
        surname: "",
        email: "",
        password: "",
        role: "user",
      });
    } catch (err) {
      console.error("Błąd rejestracji:", err);
    }
  };

  // Funkcja do wyświetlania błędów
  // const getErrorMessage = () => {
  //   if (localError) return localError;
  //   if (error) {
  //     // Przekształć różne formaty błędów
  //     if (typeof error === "string") return error;
  //     if (error.error) return error.error;
  //     if (error.message) return error.message;
  //     return "Wystąpił błąd podczas rejestracji";
  //   }
  //   return null;
  // };

  // const errorMessage = getErrorMessage();
  //console.log("Current error:", localError);

  return (
    <>
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
          <ReCAPTCHA
            key={i18n.language} // <-- KLUCZOWE: wymusza przeładowanie przy zmianie języka
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={(token) => setCaptchaToken(token || "")}
            hl={i18n.language === "pl" ? "pl" : "en"} // <-- Ustawienie języka captcha
          />

          {/* Tekst informacyjny pod captcha (przetłumaczony) */}
          <p className="text-xs text-gray-500 mt-2">
            {t("captcha.info")}{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              {t("captcha.privacy")}
            </a>{" "}
            {/* {t("captcha.and")}{" "} */}
            {/* <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              {t("captcha.terms")}
            </a>{" "}
            {t("captcha.ofGoogle")}. */}
          </p>

          {/* <ReCAPTCHA
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={(token) => setCaptchaToken(token || "")}
          /> */}
        </form>
        {localError && <p className="text-red-500 mt-2">{localError}</p>}
      </div>
    </>
  );
};

export default Register;
