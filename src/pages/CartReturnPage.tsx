// pages/CartReturnPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import axios from "axios";
import { clearCart } from "../store/slices/cartSlice";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const CartReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const { token } = useSelector((state: RootState) => state.auth);
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "pending"
  >("loading");
  const [message, setMessage] = useState("");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);

  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkPaymentStatus = async () => {
      const sessionId = searchParams.get("session_id");
      const success = searchParams.get("success");
      const canceled = searchParams.get("canceled");
      const orderId = searchParams.get("orderId");

      //console.log("Payment params:", { sessionId, success, canceled, orderId }); // Debug

      if (canceled === "true") {
        setStatus("error");
        setMessage(t("return.paymentCancelled"));
        return;
      }

      if (success !== "true" || !sessionId || !token) {
        setStatus("error");
        setMessage(t("return.noSession"));
        return;
      }

      try {
        //console.log("Calling API with session_id:", sessionId); // Debug

        const response = await axios.get(
          `${API_BASE_URL}/api/cart-session-status?session_id=${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Accept-Language": i18n.language,
            },
          },
        );

        //console.log("API Response:", response.data); // Debug - sprawdź czy invoiceUrl jest w odpowiedzi

        if (response.data.status === "complete") {
          setStatus("success");
          setMessage(response.data.message || t("return.paymentSuccess"));
          setOrderDetails(response.data);

          if (response.data.invoiceUrl) {
            //console.log("Invoice URL found:", response.data.invoiceUrl); // Debug
            setInvoiceUrl(response.data.invoiceUrl);
          } else {
            console.log("No invoiceUrl in response");
          }

          if (response.data.discountApplied) {
            setDiscountAmount(response.data.discountAmount);
          }

          localStorage.removeItem("cartCheckoutData");
          dispatch(clearCart());
        } else if (response.data.status === "pending") {
          setStatus("pending");
          setMessage(response.data.message || t("return.paymentPending"));
        } else {
          setStatus("error");
          setMessage(response.data.message || t("return.paymentFailed"));
        }
      } catch (err: any) {
        console.error("Payment status error:", err);
        setStatus("error");
        setMessage(err.response?.data?.error || t("return.checkError"));

        if (orderId) {
          dispatch(clearCart());
          localStorage.removeItem("cart");
        }
      }
    };

    checkPaymentStatus();
  }, [searchParams, token, dispatch, t, i18n.language]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold mb-4">{t("return.checking")}</h2>
            <p className="text-gray-600">{t("return.pleaseWait")}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              {t("return.success")}
            </h2>
            <p className="text-gray-700 mb-6">{message}</p>

            {orderDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold mb-2">
                  {t("return.orderDetails")}:
                </h3>
                <p className="text-sm">
                  <span className="font-medium">
                    {t("return.orderNumber")}:
                  </span>{" "}
                  {orderDetails.orderId || t("return.none")}
                </p>
                <p className="text-sm">
                  <span className="font-medium">{t("return.amount")}:</span>{" "}
                  {orderDetails.totalAmount
                    ? `${orderDetails.totalAmount.toFixed(2)} ${t("return.currency")}`
                    : t("return.none")}
                </p>
                {discountAmount && (
                  <p className="text-sm text-green-600">
                    <span className="font-medium">{t("return.discount")}:</span>{" "}
                    {discountAmount.toFixed(2)} {t("return.currency")}
                  </p>
                )}
                <p className="text-sm mt-2">{t("return.confirmationEmail")}</p>
              </div>
            )}

            {discountAmount && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-700">
                  {t("return.discount")}:{" "}
                  <span className="font-bold">
                    {discountAmount.toFixed(2)} {t("return.currency")}
                  </span>
                </p>
              </div>
            )}

            {invoiceUrl && (
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  {t("return.invoiceGenerated")}
                </p>
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  📄 {t("return.downloadInvoice")}
                </a>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => navigate("/user/products")}
                className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {t("return.goToMyPurchases")}
              </button>
              <button
                onClick={() => navigate("/products")}
                className="w-full py-3 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
              >
                {t("return.continueShopping")}
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                {t("return.goHome")}
              </button>
            </div>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="text-4xl mb-6">⏳</div>
            <h2 className="text-xl font-bold text-yellow-600 mb-4">
              {t("return.paymentProcessing")}
            </h2>
            <p className="text-gray-700 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-6">
              {t("return.processingMessage")}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {t("return.refreshPage")}
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              {t("return.somethingWentWrong")}
            </h2>
            <p className="text-gray-700 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/cart")}
                className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {t("return.backToCart")}
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                {t("return.backToHome")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartReturnPage;
