import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import axios from "axios";

interface CheckoutButtonProps {
  productId: string;
}

interface Coupon {
  id: string;
  name: string;
  percent_off?: number;
  amount_off?: number;
  duration: string;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ productId }) => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [invoiceDetails, setInvoiceDetails] = useState<{
    show: boolean;
    requireInvoice: boolean;
    companyName: string;
    taxId: string;
    address: string;
  }>({
    show: false,
    requireInvoice: false,
    companyName: "",
    taxId: "",
    address: "",
  });

  const handleCouponValidation = async () => {
    if (!couponCode.trim()) {
      setCouponError("Wprowadź kod kuponu");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/validate-coupon",
        { couponCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.valid) {
        setAppliedCoupon(response.data.coupon);
        setCouponError("");
        setShowCouponInput(false);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.error || "Nieprawidłowy kupon");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleInvoiceToggle = () => {
    setInvoiceDetails({
      ...invoiceDetails,
      show: !invoiceDetails.show,
      requireInvoice: !invoiceDetails.show,
    });
  };

  const handleInvoiceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceDetails({
      ...invoiceDetails,
      [name]: value,
    });
  };

  const handleClick = async () => {
    if (!user || !token) {
      console.warn(
        "Brak zalogowanego użytkownika – przekierowanie do logowania"
      );
      navigate(
        `/login?redirect=${encodeURIComponent(`/products/${productId}`)}`
      );
      return;
    }

    try {
      setLoading(true);

      // Przygotuj dane do wysłania
      const checkoutData: any = {
        productId,
        userId: user._id,
      };

      // Dodaj kupon jeśli został zastosowany
      if (appliedCoupon) {
        checkoutData.couponCode = appliedCoupon.id;
      }

      // Dodaj dane do faktury jeśli wymagane
      if (invoiceDetails.requireInvoice && invoiceDetails.companyName) {
        checkoutData.invoiceData = {
          companyName: invoiceDetails.companyName,
          taxId: invoiceDetails.taxId,
          address: invoiceDetails.address,
        };
      }

      const res = await fetch("http://localhost:3000/api/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await res.json();
      if (data.url) {
        // Zapisz dane w localStorage aby odzyskać po powrocie
        localStorage.setItem(
          "lastCheckoutData",
          JSON.stringify({
            productId,
            couponCode: appliedCoupon?.id,
            sessionId: data.sessionId,
          })
        );

        window.location.href = data.url;
      } else {
        alert("Nie udało się rozpocząć płatności.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Wystąpił błąd podczas płatności.");
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do sprawdzania statusu po powrocie z Stripe
  const checkPaymentStatus = async () => {
    const lastCheckout = localStorage.getItem("lastCheckoutData");
    if (!lastCheckout) return;

    const { sessionId } = JSON.parse(lastCheckout);

    try {
      const response = await axios.get(
        `http://localhost:3000/api/session-status?session_id=${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "complete") {
        // Wyczyść localStorage
        localStorage.removeItem("lastCheckoutData");

        // Pokaż sukces z dodatkowymi informacjami
        const successMessage = `✅ Płatność zakończona sukcesem!${
          response.data.invoiceUrl ? "\nFaktura została wygenerowana." : ""
        }${
          response.data.discountApplied
            ? `\nZniżka: ${response.data.discountAmount} PLN`
            : ""
        }`;

        alert(successMessage);

        // Jeśli jest faktura, pokaż link
        if (response.data.invoiceUrl) {
          if (window.confirm("Czy chcesz otworzyć fakturę?")) {
            window.open(response.data.invoiceUrl, "_blank");
          }
        }

        // Odśwież stronę lub przekieruj
        window.location.reload();
      }
    } catch (err) {
      console.error("Error checking payment status:", err);
    }
  };

  // Sprawdź status płatności przy załadowaniu komponentu
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const sessionId = urlParams.get("session_id");

    if (success === "true" && sessionId && token) {
      checkPaymentStatus();
    }
  }, [token]);

  return (
    <div className="space-y-4">
      {/* Sekcja kuponu */}
      <div className="border rounded-lg p-4 bg-gray-50">
        {!appliedCoupon ? (
          <>
            {!showCouponInput ? (
              <button
                type="button"
                onClick={() => setShowCouponInput(true)}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <span className="mr-1">🎫</span>
                Masz kod rabatowy?
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    placeholder="Wprowadź kod rabatowy"
                    className="flex-1 px-3 py-2 border rounded text-sm"
                    disabled={couponLoading}
                  />
                  <button
                    onClick={handleCouponValidation}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    {couponLoading ? "..." : "Zastosuj"}
                  </button>
                  <button
                    onClick={() => {
                      setShowCouponInput(false);
                      setCouponError("");
                    }}
                    className="px-3 py-2 border text-sm rounded hover:bg-gray-100"
                  >
                    Anuluj
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-500 text-sm">{couponError}</p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-200">
            <div>
              <p className="text-green-700 font-medium">
                ✅ Kupon zastosowany: {appliedCoupon.name}
              </p>
              {appliedCoupon.percent_off && (
                <p className="text-green-600 text-sm">
                  Zniżka: {appliedCoupon.percent_off}%
                </p>
              )}
              {appliedCoupon.amount_off && (
                <p className="text-green-600 text-sm">
                  Zniżka: {appliedCoupon.amount_off / 100} PLN
                </p>
              )}
            </div>
            <button
              onClick={removeCoupon}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Usuń
            </button>
          </div>
        )}
      </div>

      {/* Sekcja faktury */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={invoiceDetails.requireInvoice}
              onChange={handleInvoiceToggle}
              className="rounded"
            />
            <span className="text-sm">Chcę otrzymać fakturę VAT</span>
          </label>
        </div>

        {invoiceDetails.show && (
          <div className="space-y-3 mt-3 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa firmy *
              </label>
              <input
                type="text"
                name="companyName"
                value={invoiceDetails.companyName}
                onChange={handleInvoiceInputChange}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Nazwa Twojej firmy"
                required={invoiceDetails.requireInvoice}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIP
              </label>
              <input
                type="text"
                name="taxId"
                value={invoiceDetails.taxId}
                onChange={handleInvoiceInputChange}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Numer NIP (opcjonalnie)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adres do faktury
              </label>
              <input
                type="text"
                name="address"
                value={invoiceDetails.address}
                onChange={handleInvoiceInputChange}
                className="w-full px-3 py-2 border rounded text-sm"
                placeholder="Adres firmy (opcjonalnie)"
              />
            </div>
            <p className="text-xs text-gray-500">
              * Pola wymagane do wystawienia faktury
            </p>
          </div>
        )}
      </div>

      {/* Przycisk zakupu */}
      <div className="pt-4 border-t">
        <button
          onClick={handleClick}
          disabled={
            loading ||
            (invoiceDetails.requireInvoice && !invoiceDetails.companyName)
          }
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
            flex items-center justify-center space-x-2
            ${
              loading ||
              (invoiceDetails.requireInvoice && !invoiceDetails.companyName)
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
            }
          `}
        >
          {loading ? (
            <>
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              <span>Przygotowanie płatności...</span>
            </>
          ) : (
            <>
              <span>💳</span>
              <span>Kup teraz</span>
              {appliedCoupon && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                  Z kuponem
                </span>
              )}
            </>
          )}
        </button>

        {invoiceDetails.requireInvoice && !invoiceDetails.companyName && (
          <p className="text-red-500 text-sm mt-2 text-center">
            Wprowadź nazwę firmy aby kontynuować
          </p>
        )}
      </div>

      {/* Informacje o bezpieczeństwie */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>🔒 Bezpieczna płatność przez Stripe</p>
        <p>💳 Akceptujemy karty Visa, Mastercard, Apple Pay</p>
        <p>📧 Dostęp do kursu otrzymasz natychmiast po płatności</p>
      </div>
    </div>
  );
};

// Dodaj styl dla animacji
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);

export default CheckoutButton;
