// pages/ContactPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800"
        >
          ← {t("contact.backButton")}
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {t("contact.title")}
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">{t("contact.description")}</p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700">
                📧 {t("contact.email")}
              </h3>
              <p className="text-gray-600">contact@boxingonline.eu</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">
                🕒 {t("contact.hours")}
              </h3>
              <p className="text-gray-600">{t("contact.workingHours")}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">
                📱 {t("contact.paymentHelp")}
              </h3>
              <p className="text-gray-600">
                {t("contact.orderNumber")}{" "}
                <span className="font-medium">#...</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
