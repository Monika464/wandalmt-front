// components/cart/CartCheckout.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface Coupon {
  id: string;
  name: string;
  percent_off?: number;
  amount_off?: number;
  duration: string;
}

const CartCheckout: React.FC = () => {
  const navigate = useNavigate();

  const { t, i18n } = useTranslation();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [requireInvoice, setRequireInvoice] = useState(false);

  // Helper function to get common headers with language
  const getHeaders = (includeAuth: boolean = true) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept-Language": i18n.language,
    };

    if (includeAuth && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  };

  // Calculate your cart total
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0,
    );
  };

  // ========== 1. PUBLIC VALIDATION (no login required) ==========
  const validateCouponPublic = async (code: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/discounts/validate-public`,
        {
          couponCode: code,
          totalAmount: calculateTotal(),
        },
        {
          headers: getHeaders(false), // 👈 Pass language without auth
        },
      );

      return response.data;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || t("checkout.couponValidationError"),
      );
    }
  };

  // ========== 2. PROTECTED VALIDATION ==========
  const validateCouponProtected = async (code: string) => {
    if (!token) {
      throw new Error(t("checkout.loginRequired"));
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/discounts/validate`,
        {
          couponCode: code,
          cartItems,
          totalAmount: calculateTotal(),
        },
        {
          headers: getHeaders(true), // 👈 Pass language with auth
        },
      );

      return response.data;
    } catch (err: any) {
      if (err.response?.status === 401) {
        throw new Error(t("checkout.sessionExpired"));
      }
      throw new Error(
        err.response?.data?.error || t("checkout.couponValidationError"),
      );
    }
  };

  // ========== 3. MAIN FUNCTION OF COUPON VALIDATION ==========
  const handleCouponValidation = async () => {
    if (!couponCode.trim()) {
      setCouponError(t("checkout.enterCouponCode"));
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      if (user && token) {
        const result = await validateCouponProtected(couponCode);

        if (result.valid) {
          applyCouponToState(result);
        } else {
          setCouponError(result.error || t("checkout.invalidCoupon"));
        }
      } else {
        const result = await validateCouponPublic(couponCode);

        if (result.valid) {
          if (result.requiresLogin) {
            setCouponError(result.message || t("checkout.couponRequiresLogin"));
            if (window.confirm(t("checkout.couponRequiresLoginConfirm"))) {
              navigate(
                `/login?redirect=${encodeURIComponent("/cart/checkout")}&coupon=${couponCode}`,
              );
            }
            return;
          } else {
            applyCouponToState(result);
          }
        } else {
          setCouponError(result.error || t("checkout.invalidCoupon"));
        }
      }
    } catch (err: any) {
      setCouponError(err.message || t("checkout.invalidCoupon"));
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  //========== 4. FUNCTION FOR APPLYING COUPON TO STATE ==========
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

  // ========== 5. COUPON CHECK FUNCTION AT PAYMENT ==========
  const verifyCouponAtCheckout = async (code: string) => {
    if (!token) {
      throw new Error(t("checkout.loginRequired"));
    }

    const result = await validateCouponProtected(code);

    if (!result.valid) {
      throw new Error(result.error || t("checkout.couponCannotBeApplied"));
    }

    return result;
  };

  // ========== 6. PAYMENT HANDLER ==========
  const handleCheckout = async () => {
    if (!user || !token) {
      navigate(
        `/login?redirect=${encodeURIComponent("/cart/checkout")}&coupon=${couponCode}`,
      );
      return;
    }

    if (cartItems.length === 0) {
      alert(t("checkout.cartEmpty"));
      return;
    }

    try {
      setLoading(true);

      const finalCouponCode = couponCode;
      if (couponCode && appliedCoupon) {
        try {
          await verifyCouponAtCheckout(couponCode);
        } catch (couponErr: any) {
          setAppliedCoupon(null);
          setCouponError(couponErr.message);
          setCouponCode("");
          alert(`${t("checkout.couponCannotBeApplied")}: ${couponErr.message}`);
          return;
        }
      }

      const checkoutData: any = {
        items: cartItems.map((item) => ({
          _id: item._id,
          quantity: item.quantity || 1,
        })),
        locale: i18n.language,
      };

      if (finalCouponCode && appliedCoupon) {
        checkoutData.couponCode = finalCouponCode;
      }

      if (requireInvoice) {
        checkoutData.requireInvoice = true;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/cart-checkout-session`,
        checkoutData,
        {
          headers: getHeaders(true),
        },
      );

      if (response.data.url) {
        localStorage.setItem(
          "cartCheckoutData",
          JSON.stringify({
            sessionId: response.data.sessionId,
            couponCode: finalCouponCode,
            requireInvoice: requireInvoice,
            orderId: response.data.orderId,
          }),
        );

        window.location.href = response.data.url;
      }
    } catch (err: any) {
      console.error("Checkout error:", err);

      if (err.response?.status === 401) {
        alert(t("checkout.sessionExpired"));
        navigate("/login");
      } else if (err.response?.status === 400) {
        alert(err.response.data.error || t("checkout.orderDataError"));
      } else if (err.response?.status === 403) {
        setAppliedCoupon(null);
        setCouponError(err.response.data.error);
        alert(err.response.data.error);
      } else {
        alert(err.response?.data?.error || t("checkout.paymentError"));
      }
    } finally {
      setLoading(false);
    }
  };

  // ========== 7. REMOVING A COUPON ==========
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">{t("cart.empty")}</p>
        <button
          onClick={() => navigate("/products")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t("cart.browseProducts")}
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
          {t("checkout.backToCart")}
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-6">{t("checkout.orderSummary")}</h2>

      {/* Product List */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-4">
          {t("checkout.productsInCart")} ({cartItems.length})
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
                  {t("checkout.quantity")}: {item.quantity || 1}
                </p>
              </div>
              <p className="font-semibold">
                {item.price * (item.quantity || 1)} {t("cart.currency")}
              </p>
            </div>
          ))}
        </div>

        {/* Price Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between mb-2">
            <span>{t("checkout.subtotal")}:</span>
            <span>
              {total.toFixed(2)} {t("cart.currency")}
            </span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between mb-2 text-green-600">
              <span>
                {t("checkout.discount")} {appliedCoupon.name}:
              </span>
              <span>
                -{discountAmount.toFixed(2)} {t("cart.currency")}
              </span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>{t("checkout.total")}:</span>
            <span>
              {finalTotal.toFixed(2)} {t("cart.currency")}
            </span>
          </div>
        </div>
      </div>

      {/* Coupon Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-4">{t("checkout.couponCode")}</h3>

        {!appliedCoupon ? (
          <>
            {!showCouponInput ? (
              <button
                type="button"
                onClick={() => setShowCouponInput(true)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span className="mr-2">🎫</span>
                {t("checkout.haveCoupon")}
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
                    placeholder={t("checkout.enterCouponPlaceholder")}
                    className="flex-1 px-3 py-2 border rounded"
                    disabled={couponLoading}
                  />
                  <button
                    onClick={handleCouponValidation}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    {couponLoading ? "..." : t("checkout.apply")}
                  </button>
                  <button
                    onClick={() => {
                      setShowCouponInput(false);
                      setCouponError("");
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    {t("common.cancel")}
                  </button>
                </div>

                {/* Login status information */}
                {!user && (
                  <p className="text-sm text-gray-600">
                    💡 {t("checkout.notLoggedInInfo")}
                  </p>
                )}

                {couponError && (
                  <div
                    className={`p-3 rounded ${couponError.includes(t("checkout.couponRequiresLogin").substring(0, 10)) ? "bg-yellow-50 border border-yellow-200" : "bg-red-50 border border-red-200"}`}
                  >
                    <p
                      className={`text-sm ${couponError.includes(t("checkout.couponRequiresLogin").substring(0, 10)) ? "text-yellow-700" : "text-red-500"}`}
                    >
                      {couponError}
                    </p>
                    {couponError.includes(
                      t("checkout.couponRequiresLogin").substring(0, 10),
                    ) && (
                      <button
                        onClick={() =>
                          navigate(
                            `/login?redirect=${encodeURIComponent("/cart/checkout")}&coupon=${couponCode}`,
                          )
                        }
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {t("checkout.goToLogin")}
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
                ✅ {t("checkout.couponApplied")}: {appliedCoupon.name}
              </p>
              {appliedCoupon.percent_off && (
                <p className="text-sm text-green-600">
                  {t("checkout.discount")}: {appliedCoupon.percent_off}%
                </p>
              )}
              {appliedCoupon.amount_off && (
                <p className="text-sm text-green-600">
                  {t("checkout.discount")}: {appliedCoupon.amount_off / 100}{" "}
                  {t("cart.currency")}
                </p>
              )}
              {!user && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ {t("checkout.loginToConfirmCoupon")}
                </p>
              )}
            </div>
            <button
              onClick={removeCoupon}
              className="text-red-500 hover:text-red-700"
            >
              {t("checkout.remove")}
            </button>
          </div>
        )}
      </div>

      {/* Invoice Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{t("checkout.invoice")}</h3>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={requireInvoice}
              onChange={(e) => setRequireInvoice(e.target.checked)}
              className="rounded"
            />
            <span>{t("checkout.wantInvoice")}</span>
          </label>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {requireInvoice
            ? t("checkout.invoiceInfoWhenChecked")
            : t("checkout.invoiceInfoWhenUnchecked")}
        </p>
      </div>

      {/* Payment Button */}
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
              <span>{t("checkout.preparingPayment")}</span>
            </>
          ) : (
            <>
              <span>💳</span>
              <span>{t("checkout.proceedToPayment")}</span>
              <span className="ml-2">
                {finalTotal.toFixed(2)} {t("cart.currency")}
              </span>
            </>
          )}
        </button>

        <div className="mt-4 text-center text-sm text-gray-600 space-y-1">
          <p>🔒 {t("checkout.securePayment")}</p>
          <p>💳 {t("checkout.acceptedCards")}</p>
          <p>📧 {t("checkout.immediateAccess")}</p>
          {requireInvoice && (
            <p className="text-blue-600">
              🧾 {t("checkout.invoiceAfterPayment")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartCheckout;
