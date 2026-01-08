// pages/CartCancelPage.tsx - rozbudowana wersja
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../store/slices/cartSlice";
import type { RootState } from "../store";
import axios from "axios";

const CartCancelPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get("orderId");
  const canceled = searchParams.get("canceled");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderId && token) {
        try {
          setLoading(true);
          const response = await axios.get(
            `http://localhost:3000/api/orders/${orderId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setOrderDetails(response.data);
        } catch (err) {
          console.error("Error fetching order details:", err);
          setError("Nie udało się pobrać szczegółów zamówienia");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrderDetails();
  }, [orderId, token]);

  const handleRetryPayment = async () => {
    if (!orderId || !token) {
      navigate("/cart/checkout");
      return;
    }

    try {
      setLoading(true);

      // Możesz tu dodać logikę ponownego tworzenia sesji płatności
      // lub po prostu przekierować do checkoutu

      navigate("/cart/checkout");
    } catch (err) {
      console.error("Error retrying payment:", err);
      setError("Błąd podczas ponawiania płatności");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCartAndContinue = () => {
    // Wyczyść koszyk i wróć do produktów
    dispatch(clearCart());
    navigate("/products");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-xl p-8 text-center">
        {/* Ikona */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-5xl">😔</span>
          </div>
        </div>

        {/* Nagłówek */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Płatność anulowana
        </h1>

        <p className="text-gray-600 mb-6">
          Anulowałeś proces płatności. Twoje zamówienie nie zostało
          zrealizowane.
        </p>

        {/* Informacje o anulowaniu */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Co się stało?
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Nie obciążono Twojej karty płatniczej</li>
                  <li>Produkty nadal są w Twoim koszyku</li>
                  <li>Możesz spróbować ponownie w dowolnym momencie</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Szczegóły zamówienia */}
        {loading ? (
          <div className="flex justify-center my-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : orderDetails ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">
              Szczegóły anulowanego zamówienia
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>
                Numer: <span className="font-medium">{orderId}</span>
              </p>
              <p>
                Data:{" "}
                <span className="font-medium">
                  {new Date(orderDetails.createdAt).toLocaleDateString()}
                </span>
              </p>
              <p>
                Produkty:{" "}
                <span className="font-medium">
                  {orderDetails.products?.length || 0}
                </span>
              </p>
            </div>
          </div>
        ) : null}

        {/* Przyczyny anulowania - opcjonalnie */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Najczęstsze przyczyny anulowania:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-gray-500">💳</span>
              <p className="text-gray-600">Problem z kartą płatniczą</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-gray-500">⏰</span>
              <p className="text-gray-600">Brak czasu na dokończenie</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-gray-500">🤔</span>
              <p className="text-gray-600">Chęć zmiany zamówienia</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-gray-500">📱</span>
              <p className="text-gray-600">Problem techniczny</p>
            </div>
          </div>
        </div>

        {/* Błąd jeśli wystąpił */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Przyciski akcji */}
        <div className="space-y-3">
          <button
            onClick={handleRetryPayment}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Przetwarzanie...
              </>
            ) : (
              <>
                <span className="mr-2">🔄</span>
                Spróbuj ponownie zapłacić
              </>
            )}
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <span className="mr-2">🛒</span>
            Wróć do koszyka
          </button>

          <button
            onClick={handleClearCartAndContinue}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="mr-2">✨</span>
            Wyczyść koszyk i kontynuuj zakupy
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="mr-2">🏠</span>
            Wróć do strony głównej
          </button>
        </div>

        {/* Support */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Masz pytania lub potrzebujesz pomocy?
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => navigate("/contact")}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              📞 Kontakt z supportem
            </button>
            <button
              onClick={() => navigate("/faq")}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              ❓ Częste pytania
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCancelPage;
