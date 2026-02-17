// components/cart/CartCheckout.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import axios from "axios";

interface Coupon {
  id: string;
  name: string;
  percent_off?: number;
  amount_off?: number;
  duration: string;
}

const CartCheckout: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [requireInvoice, setRequireInvoice] = useState(false); // Tylko checkbox

  // Oblicz sumę koszyka
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0,
    );
  };
  // ========== 1. PUBLICZNA WALIDACJA (bez logowania) ==========
  const validateCouponPublic = async (code: string) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/discounts/validate-public",
        {
          couponCode: code,
          totalAmount: calculateTotal(),
        },
        // BEZ headers!
      );

      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || "Błąd walidacji kuponu");
    }
  };

  // ========== 2. CHRONIONA WALIDACJA (z logowaniem) ==========
  const validateCouponProtected = async (code: string) => {
    if (!token) {
      throw new Error("Wymagane zalogowanie");
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/discounts/validate", // INNY endpoint!
        {
          couponCode: code,
          cartItems,
          totalAmount: calculateTotal(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data;
    } catch (err: any) {
      if (err.response?.status === 401) {
        throw new Error("Sesja wygasła. Zaloguj się ponownie.");
      }
      throw new Error(err.response?.data?.error || "Błąd walidacji kuponu");
    }
  };

  // ========== 3. GŁÓWNA FUNKCJA WALIDACJI KUPONU ==========
  const handleCouponValidation = async () => {
    if (!couponCode.trim()) {
      setCouponError("Wprowadź kod kuponu");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      // SPRAWDŹ CZY UŻYTKOWNIK JEST ZALOGOWANY
      if (user && token) {
        // UŻYJ CHRONIONEGO ENDPOINTU
        const result = await validateCouponProtected(couponCode);

        if (result.valid) {
          applyCouponToState(result);
        } else {
          setCouponError(result.error || "Nieprawidłowy kupon");
        }
      } else {
        // UŻYJ PUBLICZNEGO ENDPOINTU
        const result = await validateCouponPublic(couponCode);

        if (result.valid) {
          if (result.requiresLogin) {
            // Kupon wymaga logowania
            setCouponError(result.message || "Ten kupon wymaga zalogowania");
            // Zaproponuj logowanie
            if (
              window.confirm(
                "Ten kupon wymaga zalogowania. Przejść do logowania?",
              )
            ) {
              navigate(
                `/login?redirect=${encodeURIComponent("/cart/checkout")}&coupon=${couponCode}`,
              );
            }
            return;
          } else {
            // Kupon publiczny - zastosuj
            applyCouponToState(result);
          }
        } else {
          setCouponError(result.error || "Nieprawidłowy kupon");
        }
      }
    } catch (err: any) {
      setCouponError(err.message || "Nieprawidłowy kupon");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // ========== 4. FUNKCJA APLIKUJĄCA KUPON DO STANU ==========
  const applyCouponToState = (result: any) => {
    setAppliedCoupon({
      id: result.discount.id,
      name: result.discount.name || result.discount.code,
      ...(result.discount.type === "percentage"
        ? { percent_off: result.discount.value }
        : { amount_off: result.discount.value * 100 }),
      duration: "once",
    });
    setCouponError("");
    setShowCouponInput(false);
  };

  // ========== 5. FUNKCJA SPRAWDZAJĄCA KUPON PRZY PŁATNOŚCI ==========
  const verifyCouponAtCheckout = async (code: string) => {
    if (!token) {
      throw new Error("Wymagane zalogowanie");
    }

    // Ostateczna weryfikacja przed płatnością
    const result = await validateCouponProtected(code);

    if (!result.valid) {
      throw new Error(result.error || "Kupon nie może być zastosowany");
    }

    return result;
  };

  // ========== 6. HANDLER PŁATNOŚCI ==========
  const handleCheckout = async () => {
    if (!user || !token) {
      navigate(
        `/login?redirect=${encodeURIComponent("/cart/checkout")}&coupon=${couponCode}`,
      );
      return;
    }

    if (cartItems.length === 0) {
      alert("Koszyk jest pusty");
      return;
    }

    try {
      setLoading(true);

      // OSTATECZNA WERYFIKACJA KUPONU (jeśli jest zastosowany)
      let finalCouponCode = couponCode;
      if (couponCode && appliedCoupon) {
        try {
          await verifyCouponAtCheckout(couponCode);
          // Jeśli tu nie ma błędu, kupon jest poprawny
        } catch (couponErr: any) {
          // Kupon nie przeszedł finalnej walidacji
          setAppliedCoupon(null);
          setCouponError(couponErr.message);
          setCouponCode("");
          alert(`Kupon nie może być zastosowany: ${couponErr.message}`);
          return;
        }
      }

      // Przygotuj dane do wysłania
      const checkoutData: any = {
        items: cartItems.map((item) => ({
          _id: item._id,
          quantity: item.quantity || 1,
        })),
      };

      // Dodaj kupon jeśli został pomyślnie zweryfikowany
      if (finalCouponCode && appliedCoupon) {
        checkoutData.couponCode = finalCouponCode;
      }

      // Dodaj informację o wymaganej fakturze
      if (requireInvoice) {
        checkoutData.requireInvoice = true;
      }

      console.log("📦 Sending checkout data:", checkoutData);

      const response = await axios.post(
        "http://localhost:3000/api/cart-checkout-session",
        checkoutData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.url) {
        // Zapisz dane w localStorage
        localStorage.setItem(
          "cartCheckoutData",
          JSON.stringify({
            sessionId: response.data.sessionId,
            couponCode: finalCouponCode,
            requireInvoice: requireInvoice,
            orderId: response.data.orderId,
          }),
        );

        // Przekieruj do Stripe
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      console.error("Checkout error:", err);

      if (err.response?.status === 401) {
        alert("Sesja wygasła. Zaloguj się ponownie.");
        navigate("/login");
      } else if (err.response?.status === 400) {
        alert(err.response.data.error || "Błąd w danych zamówienia");
      } else if (err.response?.status === 403) {
        // Kupon nie dostępny dla tego użytkownika
        setAppliedCoupon(null);
        setCouponError(err.response.data.error);
        alert(err.response.data.error);
      } else {
        alert(err.response?.data?.error || "Wystąpił błąd podczas płatności");
      }
    } finally {
      setLoading(false);
    }
  };

  // ========== 7. USUWANIE KUPONU ==========
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Twój koszyk jest pusty</p>
        <button
          onClick={() => navigate("/products")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Przeglądaj produkty
        </button>
      </div>
    );
  }

  const total = calculateTotal();
  const discountAmount = appliedCoupon?.percent_off
    ? (total * appliedCoupon.percent_off) / 100
    : (appliedCoupon?.amount_off || 0) / 100;
  const finalTotal = total - discountAmount;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Wróć do koszyka
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6">Podsumowanie zamówienia</h2>

      {/* Lista produktów */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-4">
          Produkty w koszyku ({cartItems.length})
        </h3>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="flex items-center border-b pb-4">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded mr-4"
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-600">
                  Ilość: {item.quantity || 1}
                </p>
              </div>
              <p className="font-semibold">
                {item.price * (item.quantity || 1)} PLN
              </p>
            </div>
          ))}
        </div>

        {/* Podsumowanie cen */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between mb-2">
            <span>Suma częściowa:</span>
            <span>{total.toFixed(2)} PLN</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between mb-2 text-green-600">
              <span>Zniżka {appliedCoupon.name}:</span>
              <span>-{discountAmount.toFixed(2)} PLN</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Do zapłaty:</span>
            <span>{finalTotal.toFixed(2)} PLN</span>
          </div>
        </div>
      </div>

      {/* Sekcja kuponu */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-4">Kod rabatowy</h3>

        {!appliedCoupon ? (
          <>
            {!showCouponInput ? (
              <button
                type="button"
                onClick={() => setShowCouponInput(true)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span className="mr-2">🎫</span>
                Mam kod rabatowy
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    placeholder="Wprowadź kod rabatowy"
                    className="flex-1 px-3 py-2 border rounded"
                    disabled={couponLoading}
                  />
                  <button
                    onClick={handleCouponValidation}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    {couponLoading ? "..." : "Zastosuj"}
                  </button>
                  <button
                    onClick={() => {
                      setShowCouponInput(false);
                      setCouponError("");
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Anuluj
                  </button>
                </div>

                {/* Informacja o statusie logowania */}
                {!user && (
                  <p className="text-sm text-gray-600">
                    💡 Nie jesteś zalogowany. Publiczne kupony będą działać od
                    razu.
                  </p>
                )}

                {couponError && (
                  <div
                    className={`p-3 rounded ${couponError.includes("wymaga zalogowania") ? "bg-yellow-50 border border-yellow-200" : "bg-red-50 border border-red-200"}`}
                  >
                    <p
                      className={`text-sm ${couponError.includes("wymaga zalogowania") ? "text-yellow-700" : "text-red-500"}`}
                    >
                      {couponError}
                    </p>
                    {couponError.includes("wymaga zalogowania") && (
                      <button
                        onClick={() =>
                          navigate(
                            `/login?redirect=${encodeURIComponent("/cart/checkout")}&coupon=${couponCode}`,
                          )
                        }
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Przejdź do logowania
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-200">
            <div>
              <p className="font-medium text-green-700">
                ✅ Kupon zastosowany: {appliedCoupon.name}
              </p>
              {appliedCoupon.percent_off && (
                <p className="text-sm text-green-600">
                  Zniżka: {appliedCoupon.percent_off}%
                </p>
              )}
              {appliedCoupon.amount_off && (
                <p className="text-sm text-green-600">
                  Zniżka: {appliedCoupon.amount_off / 100} PLN
                </p>
              )}
              {!user && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ Zaloguj się przed płatnością, aby potwierdzić kupon
                </p>
              )}
            </div>
            <button
              onClick={removeCoupon}
              className="text-red-500 hover:text-red-700"
            >
              Usuń
            </button>
          </div>
        )}
      </div>

      {/* Sekcja faktury - TYLKO CHECKBOX */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Faktura</h3>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={requireInvoice}
              onChange={(e) => setRequireInvoice(e.target.checked)}
              className="rounded"
            />
            <span>Chcę otrzymać fakturę</span>
          </label>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {requireInvoice
            ? "Dane do faktury zostaną zebrane na stronie płatności Stripe"
            : "Możesz zamówić fakturę - dane zostaną zebrane na stronie płatności"}
        </p>
      </div>

      {/* Przycisk płatności */}
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-lg
            flex items-center justify-center space-x-2
            ${
              loading
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
            }
          `}
        >
          {loading ? (
            <>
              <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
              <span>Przygotowanie płatności...</span>
            </>
          ) : (
            <>
              <span>💳</span>
              <span>Przejdź do płatności</span>
              <span className="ml-2">{finalTotal.toFixed(2)} PLN</span>
            </>
          )}
        </button>

        <div className="mt-4 text-center text-sm text-gray-600 space-y-1">
          <p>🔒 Bezpieczna płatność przez Stripe</p>
          <p>💳 Akceptujemy karty Visa, Mastercard, Apple Pay</p>
          <p>📧 Dostęp do kursów otrzymasz natychmiast po płatności</p>
          {requireInvoice && (
            <p className="text-blue-600">
              🧾 Faktura zostanie wystawiona po płatności
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartCheckout;
