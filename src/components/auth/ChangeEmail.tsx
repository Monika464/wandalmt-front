// components/user/ChangeEmail.tsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeEmail } from "../../store/slices/emailSlice";
import type { RootState, AppDispatch } from "../../store";
import { Mail, AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChangeEmailProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const ChangeEmail: React.FC<ChangeEmailProps> = ({
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const { loading, error, success } = useSelector(
    (state: RootState) => state.email,
  );

  const [newEmail, setNewEmail] = useState("");
  const [validationError, setValidationError] = useState("");

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChangeEmail = async () => {
    if (!newEmail) {
      setValidationError(t("email.validation.empty"));
      return;
    }
    if (!validateEmail(newEmail)) {
      setValidationError(t("email.validation.invalid"));
      return;
    }
    setValidationError("");

    const result = await dispatch(changeEmail(newEmail));
    //console.log("Change email result:", result); // Debug
    if (changeEmail.fulfilled.match(result) && onSuccess) {
      onSuccess();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(e.target.value);
    if (validationError) setValidationError("");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header with close option */}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Mail size={24} className="text-blue-500" />
          {t("email.title")}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t("common.close")}
          >
            <X size={20} className="text-gray-500" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Forms */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="newEmail"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("email.newEmailLabel")}
            </label>
            <input
              id="newEmail"
              type="email"
              placeholder={t("email.newEmailPlaceholder")}
              value={newEmail}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${
                validationError ? "border-red-300" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              disabled={loading}
            />
            {validationError && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {validationError}
              </p>
            )}
          </div>

          <button
            onClick={handleChangeEmail}
            disabled={loading}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {t("email.changing")}
              </>
            ) : (
              t("email.changeButton")
            )}
          </button>
        </div>

        {/* Status messages */}
        <div className="space-y-3">
          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-blue-500" />
              <p className="text-blue-700">{t("email.processing")}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="font-medium text-red-800">{t("email.error")}</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle
                size={20}
                className="text-green-500 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="font-medium text-green-800">
                  {t("email.success")}
                </p>
                <p className="text-sm text-green-600 mt-1">{success}</p>
                <p className="text-xs text-green-500 mt-2">
                  {t("email.confirmationSent")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Additional information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {t("email.info")}
          </h4>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>{t("email.info1")}</li>
            <li>{t("email.info2")}</li>
            <li>{t("email.info3")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
