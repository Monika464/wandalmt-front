import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  resetPassword,
  clearEmailMessages,
} from "../../store/slices/emailSlice";
import type { RootState, AppDispatch } from "../../store";
import { useNavigate, useParams } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

const SetNewPassword: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token } = useParams();
  const { t } = useTranslation();

  const { loading, error, success } = useSelector(
    (state: RootState) => state.email,
  );

  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Walidacja hasła
  const validatePassword = (pass: string, repeat: string) => {
    if (!pass) {
      setPasswordError(t("passwordReset.passwordRequired"));
      return false;
    }
    if (pass.length < 6) {
      setPasswordError(t("passwordReset.passwordMinLength"));
      return false;
    }
    if (pass !== repeat && repeat) {
      setPasswordError(t("passwordReset.passwordsDoNotMatch"));
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordRepeat) validatePassword(value, passwordRepeat);
  };

  const handlePasswordRepeatChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setPasswordRepeat(value);
    if (password) validatePassword(password, value);
  };

  const handleResetPassword = () => {
    if (!validatePassword(password, passwordRepeat)) return;
    dispatch(resetPassword({ token: token || "", newPassword: password }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      !loading &&
      password &&
      passwordRepeat &&
      !passwordError
    ) {
      handleResetPassword();
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearEmailMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  // Sprawdź czy hasła są takie same
  const passwordsMatch =
    password && passwordRepeat && password === passwordRepeat;
  const isPasswordValid = password.length >= 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t("passwordReset.setNewPassword")}
          </h1>
          <p className="text-gray-600 text-sm">
            {t("passwordReset.setNewPasswordDescription")}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Nowe hasło */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("passwordReset.newPassword")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordReset.newPasswordPlaceholder")}
                value={password}
                onChange={handlePasswordChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className={`
                  w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
                  ${
                    password && isPasswordValid
                      ? "border-green-300 focus:ring-green-200 focus:border-green-400"
                      : password && !isPasswordValid
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
                  }
                  ${loading ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${password.length >= 6 ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  <span
                    className={
                      password.length >= 6 ? "text-green-600" : "text-gray-500"
                    }
                  >
                    {t("passwordReset.minCharacters")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Powtórz hasło */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("passwordReset.confirmPassword")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPasswordRepeat ? "text" : "password"}
                placeholder={t("passwordReset.confirmPasswordPlaceholder")}
                value={passwordRepeat}
                onChange={handlePasswordRepeatChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className={`
                  w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
                  ${
                    passwordRepeat && passwordsMatch
                      ? "border-green-300 focus:ring-green-200 focus:border-green-400"
                      : passwordRepeat && !passwordsMatch
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                        : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
                  }
                  ${loading ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
                `}
              />
              <button
                type="button"
                onClick={() => setShowPasswordRepeat(!showPasswordRepeat)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswordRepeat ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Komunikat błędu */}
          {passwordError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {passwordError}
              </p>
            </div>
          )}

          {/* Przycisk zmiany hasła */}
          <button
            onClick={handleResetPassword}
            disabled={
              loading || !password || !passwordRepeat || !!passwordError
            }
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
              flex items-center justify-center gap-2
              ${
                loading || !password || !passwordRepeat || passwordError
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("passwordReset.changing")}
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                {t("passwordReset.changePasswordButton")}
              </>
            )}
          </button>

          {/* Komunikaty z API */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">
                    {t("passwordReset.error")}
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    {error === "Invalid token"
                      ? t("passwordReset.invalidToken")
                      : error === "Token expired"
                        ? t("passwordReset.tokenExpired")
                        : error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">
                    {t("passwordReset.success")}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {t("passwordReset.successMessage")}
                  </p>
                  <p className="text-xs text-green-500 mt-2">
                    {t("passwordReset.redirecting")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Link powrotu */}
          <div className="text-center mt-6">
            <a
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("passwordReset.backToLogin")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetNewPassword;

// import { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   resetPassword,
//   clearEmailMessages,
// } from "../../store/slices/emailSlice";
// import type { RootState, AppDispatch } from "../../store";
// import { useNavigate, useParams } from "react-router-dom";

// const SetNewPassword: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const { token } = useParams(); // <-- tu pobieramy token z URL

//   const { loading, error, success } = useSelector(
//     (state: RootState) => state.email,
//   );

//   const [password, setPassword] = useState("");
//   const [passwordRepeat, setPasswordRepeat] = useState("");

//   const handleResetPassword = () => {
//     if (password !== passwordRepeat) {
//       alert("Hasła muszą się zgadzać!");
//       return;
//     }

//     dispatch(resetPassword({ token: token || "", newPassword: password }));
//   };

//   useEffect(() => {
//     if (error || success) {
//       const timer = setTimeout(() => {
//         dispatch(clearEmailMessages());
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [error, success]);

//   useEffect(() => {
//     if (success) {
//       const timer = setTimeout(() => {
//         navigate("/login");
//       }, 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [success]);

//   return (
//     <div>
//       <h2>Ustaw nowe hasło</h2>

//       <input
//         type="password"
//         placeholder="Nowe hasło"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />

//       <input
//         type="password"
//         placeholder="Powtórz hasło"
//         value={passwordRepeat}
//         onChange={(e) => setPasswordRepeat(e.target.value)}
//       />

//       <button onClick={handleResetPassword} disabled={loading}>
//         Zmień hasło
//       </button>

//       {loading && <p>Ładowanie...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       {success && (
//         <p style={{ color: "green" }}>
//           Hasło zostało zmienione! Przekierowuję…
//         </p>
//       )}
//     </div>
//   );
// };

// export default SetNewPassword;
