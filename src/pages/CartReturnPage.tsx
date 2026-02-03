// pages/CartReturnPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import axios from "axios";
import { clearCart } from "../store/slices/cartSlice";

const CartReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { token } = useSelector((state: RootState) => state.auth);
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "pending"
  >("loading");
  const [message, setMessage] = useState("");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const sessionId = searchParams.get("session_id");
      const success = searchParams.get("success");
      const canceled = searchParams.get("canceled");
      const orderId = searchParams.get("orderId");

      // console.log("CartReturnPage - params:", {
      //   sessionId,
      //   success,
      //   orderId,
      //   canceled,
      // });

      if (canceled === "true") {
        setStatus("error");
        setMessage("Płatność została anulowana");
        return;
      }

      if (success !== "true" || !sessionId || !token) {
        setStatus("error");
        setMessage("Brak sesji płatności");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/api/cart-session-status?session_id=${sessionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.status === "complete") {
          setStatus("success");
          setMessage(response.data.message || "Płatność zakończona sukcesem!");
          setOrderDetails(response.data);

          if (response.data.invoiceUrl) {
            setInvoiceUrl(response.data.invoiceUrl);
          }

          console.log("Discount applied:", response.data);

          if (response.data.discountApplied) {
            setDiscountAmount(response.data.discountAmount);
          }

          // Wyczyść localStorage
          localStorage.removeItem("cartCheckoutData");

          // Możesz też wyczyścić koszyk tutaj
          dispatch(clearCart());
        } else if (response.data.status === "pending") {
          setStatus("pending");
          setMessage(
            response.data.message || "Płatność w trakcie przetwarzania...",
          );
        } else {
          setStatus("error");
          setMessage(response.data.message || "Płatność nie powiodła się.");
        }
      } catch (err: any) {
        console.error("Payment status error:", err);
        setStatus("error");
        setMessage(
          err.response?.data?.error || "Błąd podczas sprawdzania płatności",
        );

        if (orderId) {
          dispatch(clearCart());
          localStorage.removeItem("cart");
        }
      }
    };

    checkPaymentStatus();
  }, [searchParams, token, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold mb-4">
              Sprawdzanie płatności...
            </h2>
            <p className="text-gray-600">Proszę czekać</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Sukces!</h2>
            <p className="text-gray-700 mb-6">{message}</p>

            {/* Szczegóły zamówienia */}
            {orderDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold mb-2">Szczegóły zamówienia:</h3>
                <p className="text-sm">
                  <span className="font-medium">Numer zamówienia:</span>{" "}
                  {orderDetails.orderId || "Brak"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Kwota:</span>{" "}
                  {orderDetails.totalAmount
                    ? `${orderDetails.totalAmount.toFixed(2)} PLN`
                    : "Brak"}
                </p>
                {discountAmount && (
                  <p className="text-sm text-green-600">
                    <span className="font-medium">Zniżka:</span>{" "}
                    {discountAmount.toFixed(2)} PLN
                  </p>
                )}
                <p className="text-sm mt-2">
                  Potwierdzenie zostało wysłane na email.
                </p>
              </div>
            )}

            {discountAmount && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-700">
                  Zniżka:{" "}
                  <span className="font-bold">
                    {discountAmount.toFixed(2)} PLN
                  </span>
                </p>
              </div>
            )}

            {invoiceUrl && (
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Faktura została wygenerowana
                </p>
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  📄 Pobierz fakturę
                </a>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => navigate("/account?tab=purchases")}
                className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Przejdź do moich zakupów
              </button>
              <button
                onClick={() => navigate("/products")}
                className="w-full py-3 border border-blue-500 text-blue-500 rounded hover:bg-blue-50"
              >
                Kontynuuj zakupy
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Strona główna
              </button>
            </div>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="text-4xl mb-6">⏳</div>
            <h2 className="text-xl font-bold text-yellow-600 mb-4">
              Płatność w trakcie przetwarzania
            </h2>
            <p className="text-gray-700 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-6">
              Może to potrwać kilka minut. Odśwież stronę za chwilę.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Odśwież stronę
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Coś poszło nie tak
            </h2>
            <p className="text-gray-700 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/cart")}
                className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Wróć do koszyka
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Wróć do strony głównej
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartReturnPage;

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { clearCart } from "../store/slices/cartSlice";
// import { useNavigate } from "react-router-dom";
// import type { RootState, AppDispatch } from "../store";

// interface PurchaseItem {
//   productName: string;
//   amount: number;
// }

// const CartReturnPage: React.FC = () => {
//   console.log("Rendering CartReturnPage");
//   const [message, setMessage] = useState(
//     "Trwa sprawdzanie statusu płatności..."
//   );
//   const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();

//   const { token } = useSelector((state: RootState) => state.auth);

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const sessionId = params.get("session_id");

//     if (!sessionId) {
//       setMessage("Brak session_id w adresie URL");
//       return;
//     }

//     const verifyPayment = async () => {
//       try {
//         const statusRes = await fetch(
//           `http://localhost:3000/api/cart-session-status?session_id=${sessionId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         if (!statusRes.ok)
//           throw new Error("Błąd podczas sprawdzania płatności");

//         const statusData = await statusRes.json();

//         if (statusData.status === "complete") {
//           setMessage("✅ Płatność zakończona sukcesem front!");

//           // 🔹 Przykładowe dane — możesz je rozbudować, jeśli chcesz pokazać więcej szczegółów
//           setPurchases([
//             {
//               productName: "Zamówienie zrealizowane",
//               amount: 0,
//             },
//           ]);

//           dispatch(clearCart());
//         } else if (statusData.status === "pending") {
//           setMessage("⏳ Płatność w trakcie przetwarzania...");
//         } else {
//           setMessage("❌ Płatność nie powiodła się lub została anulowana.");
//         }
//       } catch (err) {
//         console.error(err);
//         setMessage("❌ Wystąpił błąd podczas sprawdzania płatności.");
//       }
//     };

//     verifyPayment();
//   }, [dispatch, token]);

//   return (
//     <div className="p-6 text-center">
//       <h2 className="text-2xl font-bold mb-4">{message}</h2>

//       {purchases.length > 0 && (
//         <div>
//           <h3 className="text-xl font-semibold mb-2">Szczegóły zamówienia:</h3>
//           <ul className="list-disc pl-6 inline-block text-left">
//             {purchases.map((item, index) => (
//               <li key={index}>
//                 {item.productName}
//                 {item.amount > 0 && ` — ${(item.amount / 100).toFixed(2)} PLN`}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <button
//         onClick={() => navigate("/products")}
//         className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//       >
//         Kontynuuj zakupy
//       </button>
//     </div>
//   );
// };

// export default CartReturnPage;
