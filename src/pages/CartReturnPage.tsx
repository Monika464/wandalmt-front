// pages/CartReturnPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import axios from "axios";
import { clearCart } from "../store/slices/cartSlice";
import { useTranslation } from "react-i18next";

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
  const [refreshTimer, setRefreshTimer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(4);

  // Timer do automatycznego odświeżenia
  useEffect(() => {
    if (status === "success" && !invoiceUrl && refreshTimer === null) {
      const timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setRefreshTimer(timer);

      return () => {
        if (timer) clearInterval(timer);
      };
    }

    if (invoiceUrl && refreshTimer) {
      clearInterval(refreshTimer);
      setRefreshTimer(null);
    }
  }, [status, invoiceUrl, refreshTimer]);

  useEffect(() => {
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [refreshTimer]);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const sessionId = searchParams.get("session_id");
      const success = searchParams.get("success");
      const canceled = searchParams.get("canceled");
      const orderId = searchParams.get("orderId");

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
        const response = await axios.get(
          `http://localhost:3000/api/cart-session-status?session_id=${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Accept-Language": i18n.language,
            },
          },
        );

        if (response.data.status === "complete") {
          setStatus("success");
          setMessage(response.data.message || t("return.paymentSuccess"));
          setOrderDetails(response.data);

          if (response.data.invoiceUrl) {
            setInvoiceUrl(response.data.invoiceUrl);
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
  }, [searchParams, token, dispatch, t]);
  ////

  const [refreshSite, setRefreshSite] = useState<number | null>(null);

  setTimeout(() => {
    setRefreshSite(null);
  }, 20000);

  console.log("Refresh timer set:", refreshSite);
  ////
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

            {/* Szczegóły zamówienia */}
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
// // pages/CartReturnPage.tsx
// import React, { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import type { RootState } from "../store";
// import axios from "axios";
// import { clearCart } from "../store/slices/cartSlice";

// const CartReturnPage: React.FC = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [searchParams] = useSearchParams();
//   const { token } = useSelector((state: RootState) => state.auth);
//   const [status, setStatus] = useState<
//     "loading" | "success" | "error" | "pending"
//   >("loading");
//   const [message, setMessage] = useState("");
//   const [orderDetails, setOrderDetails] = useState<any>(null);
//   const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
//   const [discountAmount, setDiscountAmount] = useState<number | null>(null);
//   const [refreshTimer, setRefreshTimer] = useState<number | null>(null);
//   const [timeLeft, setTimeLeft] = useState<number>(4);

//   // Timer do automatycznego odświeżenia
//   useEffect(() => {
//     // Jeśli status to success i nie ma invoiceUrl, uruchamiamy timer
//     if (status === "success" && !invoiceUrl && refreshTimer === null) {
//       const timer = window.setInterval(() => {
//         setTimeLeft((prev) => {
//           if (prev <= 1) {
//             window.location.reload(); // Odśwież stronę
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);

//       setRefreshTimer(timer);

//       // Cleanup
//       return () => {
//         if (timer) clearInterval(timer);
//       };
//     }

//     // Jeśli pojawi się invoiceUrl, zatrzymujemy timer
//     if (invoiceUrl && refreshTimer) {
//       clearInterval(refreshTimer);
//       setRefreshTimer(null);
//     }
//   }, [status, invoiceUrl, refreshTimer]);

//   // Dodatkowo: zatrzymaj timer przy odmontowaniu komponentu
//   useEffect(() => {
//     return () => {
//       if (refreshTimer) {
//         clearInterval(refreshTimer);
//       }
//     };
//   }, [refreshTimer]);

//   useEffect(() => {
//     const checkPaymentStatus = async () => {
//       const sessionId = searchParams.get("session_id");
//       const success = searchParams.get("success");
//       const canceled = searchParams.get("canceled");
//       const orderId = searchParams.get("orderId");

//       if (canceled === "true") {
//         setStatus("error");
//         setMessage("Płatność została anulowana");
//         return;
//       }

//       if (success !== "true" || !sessionId || !token) {
//         setStatus("error");
//         setMessage("Brak sesji płatności");
//         return;
//       }

//       try {
//         const response = await axios.get(
//           `http://localhost:3000/api/cart-session-status?session_id=${sessionId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );

//         if (response.data.status === "complete") {
//           setStatus("success");
//           setMessage(response.data.message || "Płatność zakończona sukcesem!");
//           setOrderDetails(response.data);

//           if (response.data.invoiceUrl) {
//             setInvoiceUrl(response.data.invoiceUrl);
//           }

//           //console.log("Discount applied:", response.data);

//           if (response.data.discountApplied) {
//             setDiscountAmount(response.data.discountAmount);
//           }

//           // Wyczyść localStorage
//           localStorage.removeItem("cartCheckoutData");

//           // Wyczyść koszyk
//           dispatch(clearCart());
//         } else if (response.data.status === "pending") {
//           setStatus("pending");
//           setMessage(
//             response.data.message || "Płatność w trakcie przetwarzania...",
//           );
//         } else {
//           setStatus("error");
//           setMessage(response.data.message || "Płatność nie powiodła się.");
//         }
//       } catch (err: any) {
//         console.error("Payment status error:", err);
//         setStatus("error");
//         setMessage(
//           err.response?.data?.error || "Błąd podczas sprawdzania płatności",
//         );

//         if (orderId) {
//           dispatch(clearCart());
//           localStorage.removeItem("cart");
//         }
//       }
//     };

//     checkPaymentStatus();
//   }, [searchParams, token, dispatch]);

//   // Funkcja do ręcznego odświeżenia
//   // const handleManualRefresh = () => {
//   //   window.location.reload();
//   // };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
//         {status === "loading" && (
//           <>
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
//             <h2 className="text-2xl font-bold mb-4">
//               Sprawdzanie płatności...
//             </h2>
//             <p className="text-gray-600">Proszę czekać</p>
//           </>
//         )}

//         {status === "success" && (
//           <>
//             <div className="text-6xl mb-6">🎉</div>
//             <h2 className="text-2xl font-bold text-green-600 mb-4">Sukces!</h2>
//             <p className="text-gray-700 mb-6">{message}</p>

//             {/* Timer informacyjny */}
//             {/* {!invoiceUrl && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//                 <p className="text-yellow-700 mb-2">
//                   <span className="font-bold">Trwa generowanie faktury...</span>
//                 </p>
//                 <p className="text-sm text-yellow-600 mb-3">
//                   Strona odświeży się automatycznie za:{" "}
//                   <span className="font-bold">{timeLeft} sekund</span>
//                 </p>
//                 <button
//                   onClick={handleManualRefresh}
//                   className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
//                 >
//                   Odśwież teraz
//                 </button>
//               </div>
//             )} */}

//             {/* Szczegóły zamówienia */}
//             {orderDetails && (
//               <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
//                 <h3 className="font-semibold mb-2">Szczegóły zamówienia:</h3>
//                 <p className="text-sm">
//                   <span className="font-medium">Numer zamówienia:</span>{" "}
//                   {orderDetails.orderId || "Brak"}
//                 </p>
//                 <p className="text-sm">
//                   <span className="font-medium">Kwota:</span>{" "}
//                   {orderDetails.totalAmount
//                     ? `${orderDetails.totalAmount.toFixed(2)} PLN`
//                     : "Brak"}
//                 </p>
//                 {discountAmount && (
//                   <p className="text-sm text-green-600">
//                     <span className="font-medium">Zniżka:</span>{" "}
//                     {discountAmount.toFixed(2)} PLN
//                   </p>
//                 )}
//                 <p className="text-sm mt-2">
//                   Potwierdzenie zostanie wysłane na email.
//                 </p>
//               </div>
//             )}

//             {discountAmount && (
//               <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
//                 <p className="text-green-700">
//                   Zniżka:{" "}
//                   <span className="font-bold">
//                     {discountAmount.toFixed(2)} PLN
//                   </span>
//                 </p>
//               </div>
//             )}

//             {invoiceUrl && (
//               <div className="mb-6">
//                 <p className="text-gray-600 mb-2">
//                   Faktura została wygenerowana
//                 </p>
//                 <a
//                   href={invoiceUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                 >
//                   📄 Pobierz fakturę
//                 </a>
//               </div>
//             )}

//             <div className="space-y-3">
//               <button
//                 onClick={() => navigate("/user/products")}
//                 className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
//               >
//                 Przejdź do moich zakupów
//               </button>
//               <button
//                 onClick={() => navigate("/products")}
//                 className="w-full py-3 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
//               >
//                 Kontynuuj zakupy
//               </button>
//               <button
//                 onClick={() => navigate("/")}
//                 className="w-full py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
//               >
//                 Strona główna
//               </button>
//             </div>
//           </>
//         )}

//         {status === "pending" && (
//           <>
//             <div className="text-4xl mb-6">⏳</div>
//             <h2 className="text-xl font-bold text-yellow-600 mb-4">
//               Płatność w trakcie przetwarzania
//             </h2>
//             <p className="text-gray-700 mb-6">{message}</p>
//             <p className="text-sm text-gray-500 mb-6">
//               Może to potrwać kilka minut. Odśwież stronę za chwilę.
//             </p>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//             >
//               Odśwież stronę
//             </button>
//           </>
//         )}

//         {status === "error" && (
//           <>
//             <div className="text-6xl mb-6">❌</div>
//             <h2 className="text-2xl font-bold text-red-600 mb-4">
//               Coś poszło nie tak
//             </h2>
//             <p className="text-gray-700 mb-6">{message}</p>
//             <div className="space-y-3">
//               <button
//                 onClick={() => navigate("/cart")}
//                 className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
//               >
//                 Wróć do koszyka
//               </button>
//               <button
//                 onClick={() => navigate("/")}
//                 className="w-full py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
//               >
//                 Wróć do strony głównej
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CartReturnPage;
