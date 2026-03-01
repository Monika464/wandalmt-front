import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  clearEmailMessages,
  requestPasswordReset,
} from "../../store/slices/emailSlice";
import type { RootState, AppDispatch } from "../../store";
import { Mail, Send, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

const PasswordResetRequest: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { loading, error, success } = useSelector(
    (state: RootState) => state.email,
  );

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError(t("passwordReset.emailRequired"));
      return false;
    }
    if (!re.test(email)) {
      setEmailError(t("passwordReset.emailInvalid"));
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) validateEmail(value);
  };

  const handleRequestReset = () => {
    if (!validateEmail(email)) return;
    dispatch(requestPasswordReset(email));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && email) {
      handleRequestReset();
    }
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => dispatch(clearEmailMessages()), 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t("passwordReset.title")}
          </h1>
          <p className="text-gray-600 text-sm">
            {t("passwordReset.description")}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Email input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("passwordReset.emailLabel")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder={t("passwordReset.emailPlaceholder")}
                value={email}
                onChange={handleEmailChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className={`
                  w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all
                  ${
                    emailError
                      ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                      : "border-gray-300 focus:ring-blue-200 focus:border-blue-400"
                  }
                  ${loading ? "bg-gray-50 cursor-not-allowed" : "bg-white"}
                `}
              />
            </div>
            {emailError && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {emailError}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            onClick={handleRequestReset}
            disabled={loading || !email || !!emailError}
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
              flex items-center justify-center gap-2
              ${
                loading || !email || !!emailError
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("passwordReset.sending")}
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {t("passwordReset.sendButton")}
              </>
            )}
          </button>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">
                    {t("passwordReset.error")}
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    {error === "User not found"
                      ? t("passwordReset.userNotFound")
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
                </div>
              </div>
            </div>
          )}

          {/* Back to login link */}
          <div className="text-center mt-6">
            <a
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              {t("passwordReset.backToLogin")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetRequest;

// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   clearEmailMessages,
//   requestPasswordReset,
// } from "../../store/slices/emailSlice";
// import type { RootState, AppDispatch } from "../../store";

// const PasswordResetRequest: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { loading, error, success } = useSelector(
//     (state: RootState) => state.email,
//   );

//   const [email, setEmail] = useState("");

//   const handleRequestReset = () => {
//     if (!email) return;
//     dispatch(requestPasswordReset(email));
//   };

//   useEffect(() => {
//     if (success || error) {
//       setTimeout(() => dispatch(clearEmailMessages()), 3000);
//     }
//   }, [success, error, dispatch]);

//   return (
//     <div>
//       <h2>Reset hasła</h2>

//       <input
//         placeholder="Podaj email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />

//       <button onClick={handleRequestReset} disabled={loading}>
//         Wyślij reset hasła
//       </button>

//       {loading && <p>Ładowanie...</p>}
//       {error && (
//         <p style={{ color: "red" }}>
//           {error === "User not found"
//             ? "Nie ma takiego maila w naszej bazie"
//             : error}
//         </p>
//       )}
//       {success && <p style={{ color: "green" }}>Email został wysłany!</p>}
//     </div>
//   );
// };

// export default PasswordResetRequest;
