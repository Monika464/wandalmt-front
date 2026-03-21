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

  const [success, setSuccess] = useState<string>("");
  const [localError, setLocalError] = useState<string>("");

  // Clearing errors when the component mounts
  useEffect(() => {
    dispatch(clearError());
    setLocalError("");
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clearing errors when changing fields
    if (error || localError) {
      dispatch(clearError());
      setLocalError("");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Error reset
    dispatch(clearError());
    setLocalError("");
    setSuccess("");

    // Validation
    if (!captchaToken) {
      setLocalError(t("errors.captchaRequired"));
      return;
    }

    if (!formData.name.trim()) {
      setLocalError(t("errors.nameRequired"));
      return;
    }

    if (!formData.surname.trim()) {
      setLocalError(t("errors.surnameRequired"));
      return;
    }

    if (!formData.email.trim()) {
      setLocalError(t("errors.emailRequired"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
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
        setSuccess(t("register.successAdmin"));
      } else {
        await dispatch(
          registerUser({
            name: formData.name,
            surname: formData.surname,
            email: formData.email,
            password: formData.password,
            captchaToken: captchaToken,
          }),
        ).unwrap();

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

  return (
    <>
      <div className="max-w-md mx-auto mt-10 p-6 border rounded">
        <h2 className="text-xl font-bold mb-4">{t("register.title")}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder={t("register.name")}
            value={formData.name}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
          <input
            type="text"
            name="surname"
            placeholder={t("register.surname")}
            value={formData.surname}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder={t("register.email")}
            value={formData.email}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder={t("register.password")}
            value={formData.password}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />

          {/* If the current user is an admin, we show the role selection */}
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            disabled={currentUser?.role !== "admin"}
          >
            <option value="user">{t("register.user")}</option>
            {currentUser?.role === "admin" && (
              <option value="admin">{t("register.admin")}</option>
            )}
          </select>

          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded w-full"
            disabled={status === "loading"}
          >
            {status === "loading"
              ? t("register.registering")
              : t("register.submit")}
          </button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
          {success && <p className="text-green-600 mt-2">{success}</p>}

          <ReCAPTCHA
            key={i18n.language}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={(token) => setCaptchaToken(token || "")}
            hl={i18n.language === "pl" ? "pl" : "en"}
          />

          {/* Information text under captcha */}
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
            {t("captcha.and")}{" "}
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500"
            >
              {t("captcha.terms")}
            </a>
          </p>
        </form>
        {localError && <p className="text-red-500 mt-2">{localError}</p>}
      </div>
    </>
  );
};

export default Register;
