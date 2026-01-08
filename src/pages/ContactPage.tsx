// pages/ContactPage.tsx (opcjonalnie)
import React from "react";
import { useNavigate } from "react-router-dom";

const ContactPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800"
        >
          ← Wróć
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Kontakt z supportem
        </h1>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">
            Masz problem z płatnością lub pytanie dotyczące zamówienia?
            Skontaktuj się z nami:
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700">📧 Email</h3>
              <p className="text-gray-600">support@twojastrona.pl</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">🕒 Godziny pracy</h3>
              <p className="text-gray-600">Pon-Pt: 9:00-17:00</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700">
                📱 Pomoc przy płatnościach
              </h3>
              <p className="text-gray-600">
                Przygotuj numer zamówienia:{" "}
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
