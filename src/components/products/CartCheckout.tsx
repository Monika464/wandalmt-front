// components/cart/CartCheckout.tsx
import React, { useState, useEffect } from "react";
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
  const [invoiceDetails, setInvoiceDetails] = useState({
    show: false,
    requireInvoice: false,
    companyName: "",
    taxId: "",
    address: "",
  });

  // Oblicz sumę koszyka
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0
    );
  };

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
          headers: { Authorization: `Bearer ${token}` },
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

  const handleCheckout = async () => {
    if (!user || !token) {
      navigate(`/login?redirect=${encodeURIComponent("/cart/checkout")}`);
      return;
    }

    if (cartItems.length === 0) {
      alert("Koszyk jest pusty");
      return;
    }

    try {
      setLoading(true);

      // Przygotuj dane do wysłania
      const checkoutData: any = {
        items: cartItems.map((item) => ({
          _id: item._id,
          quantity: item.quantity || 1,
        })),
      };

      // Dodaj kupon jeśli został zastosowany
      if (appliedCoupon) {
        checkoutData.couponCode = appliedCoupon.id;
      }

      // Dodaj dane do faktury jeśli wymagane
      if (invoiceDetails.requireInvoice && invoiceDetails.companyName) {
        checkoutData.requireInvoice = true;
        checkoutData.invoiceData = {
          companyName: invoiceDetails.companyName,
          taxId: invoiceDetails.taxId,
          address: invoiceDetails.address,
        };
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
        }
      );
      console.log("✅ Response from backend:", response.data);
      if (response.data.url) {
        // Zapisz dane w localStorage
        localStorage.setItem(
          "cartCheckoutData",
          JSON.stringify({
            sessionId: response.data.sessionId,
            couponCode: appliedCoupon?.id,
            requireInvoice: invoiceDetails.requireInvoice,
            orderId: response.data.orderId,
          })
        );

        // Przekieruj do Stripe
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      alert(err.response?.data?.error || "Wystąpił błąd podczas płatności");
      if (err.response?.status === 401) {
        alert("Sesja wygasła. Zaloguj się ponownie.");
        navigate("/login");
      } else if (err.response?.status === 400) {
        alert(err.response.data.error || "Błąd w danych zamówienia");
      } else {
        alert(err.response?.data?.error || "Wystąpił błąd podczas płatności");
      }
    } finally {
      setLoading(false);
    }
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
                {couponError && (
                  <p className="text-red-500 text-sm">{couponError}</p>
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

      {/* Sekcja faktury */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Faktura VAT</h3>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={invoiceDetails.requireInvoice}
              onChange={handleInvoiceToggle}
              className="rounded"
            />
            <span>Chcę otrzymać fakturę</span>
          </label>
        </div>

        {invoiceDetails.show && (
          <div className="space-y-4 mt-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa firmy *
              </label>
              <input
                type="text"
                name="companyName"
                value={invoiceDetails.companyName}
                onChange={handleInvoiceInputChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="Nazwa Twojej firmy"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIP (opcjonalnie)
              </label>
              <input
                type="text"
                name="taxId"
                value={invoiceDetails.taxId}
                onChange={handleInvoiceInputChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="Numer NIP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adres do faktury (opcjonalnie)
              </label>
              <input
                type="text"
                name="address"
                value={invoiceDetails.address}
                onChange={handleInvoiceInputChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="Adres firmy"
              />
            </div>
          </div>
        )}
      </div>

      {/* Przycisk płatności */}
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={handleCheckout}
          disabled={
            loading ||
            (invoiceDetails.requireInvoice && !invoiceDetails.companyName)
          }
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-lg
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

        {invoiceDetails.requireInvoice && !invoiceDetails.companyName && (
          <p className="text-red-500 text-sm mt-2 text-center">
            Wprowadź nazwę firmy aby kontynuować
          </p>
        )}

        <div className="mt-4 text-center text-sm text-gray-600 space-y-1">
          <p>🔒 Bezpieczna płatność przez Stripe</p>
          <p>💳 Akceptujemy karty Visa, Mastercard, Apple Pay</p>
          <p>📧 Dostęp do kursów otrzymasz natychmiast po płatności</p>
        </div>
      </div>
    </div>
  );
};

export default CartCheckout;

// // components/cart/CartCheckout.tsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import type { RootState } from "../../store";
// import axios from "axios";

// interface Coupon {
//   id: string;
//   name: string;
//   percent_off?: number;
//   amount_off?: number;
//   duration: string;
// }

// const CartCheckout: React.FC = () => {
//   const navigate = useNavigate();
//   const { user, token } = useSelector((state: RootState) => state.auth);
//   const cartItems = useSelector((state: RootState) => state.cart.items);
//   console.log("cartItems in CartCheckout", cartItems);

//   const [loading, setLoading] = useState(false);
//   const [couponLoading, setCouponLoading] = useState(false);
//   const [showCouponInput, setShowCouponInput] = useState(false);
//   const [couponCode, setCouponCode] = useState("");
//   const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
//   const [couponError, setCouponError] = useState("");
//   const [invoiceDetails, setInvoiceDetails] = useState({
//     show: false,
//     requireInvoice: false,
//     companyName: "",
//     taxId: "",
//     address: "",
//   });

//   // Oblicz sumę koszyka
//   const calculateTotal = () => {
//     return cartItems.reduce(
//       (total, item) => total + item.price * (item.quantity || 1),
//       0
//     );
//   };

//   const handleCouponValidation = async () => {
//     if (!couponCode.trim()) {
//       setCouponError("Wprowadź kod kuponu");
//       return;
//     }

//     setCouponLoading(true);
//     setCouponError("");

//     try {
//       const response = await axios.post(
//         "http://localhost:3000/api/validate-coupon",
//         { couponCode },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.data.valid) {
//         setAppliedCoupon(response.data.coupon);
//         setCouponError("");
//         setShowCouponInput(false);
//       }
//     } catch (err: any) {
//       setCouponError(err.response?.data?.error || "Nieprawidłowy kupon");
//       setAppliedCoupon(null);
//     } finally {
//       setCouponLoading(false);
//     }
//   };

//   const removeCoupon = () => {
//     setAppliedCoupon(null);
//     setCouponCode("");
//   };

//   const handleInvoiceToggle = () => {
//     setInvoiceDetails({
//       ...invoiceDetails,
//       show: !invoiceDetails.show,
//       requireInvoice: !invoiceDetails.show,
//     });
//   };

//   const handleInvoiceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setInvoiceDetails({
//       ...invoiceDetails,
//       [name]: value,
//     });
//   };

//   const handleCheckout = async () => {
//     if (!user || !token) {
//       navigate(`/login?redirect=${encodeURIComponent("/cart")}`);
//       return;
//     }

//     if (cartItems.length === 0) {
//       alert("Koszyk jest pusty");
//       return;
//     }

//     try {
//       setLoading(true);

//       // Przygotuj dane do wysłania
//       const checkoutData: any = {
//         items: cartItems.map((item) => ({
//           _id: item._id,
//           quantity: item.quantity || 1,
//         })),
//       };

//       // console.log(
//       //   "checkoutData before adding coupon and invoice:",
//       //   checkoutData
//       // );

//       // Dodaj kupon jeśli został zastosowany
//       if (appliedCoupon) {
//         checkoutData.couponCode = appliedCoupon.id;
//       }

//       // Dodaj dane do faktury jeśli wymagane
//       if (invoiceDetails.requireInvoice && invoiceDetails.companyName) {
//         checkoutData.requireInvoice = true;
//         checkoutData.invoiceData = {
//           companyName: invoiceDetails.companyName,
//           taxId: invoiceDetails.taxId,
//           address: invoiceDetails.address,
//         };
//       }

//       const response = await axios.post(
//         "http://localhost:3000/api/cart-checkout-session",
//         checkoutData,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.data.url) {
//         // Zapisz dane w localStorage
//         localStorage.setItem(
//           "cartCheckoutData",
//           JSON.stringify({
//             sessionId: response.data.sessionId,
//             couponCode: appliedCoupon?.id,
//             requireInvoice: invoiceDetails.requireInvoice,
//           })
//         );

//         // Przekieruj do Stripe
//         window.location.href = response.data.url;
//       }
//     } catch (err: any) {
//       console.error("Checkout error:", err);
//       alert(err.response?.data?.error || "Wystąpił błąd podczas płatności");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Sprawdź status płatności po powrocie
//   const checkPaymentStatus = async () => {
//     const urlParams = new URLSearchParams(window.location.search);
//     const success = urlParams.get("success");
//     const sessionId = urlParams.get("session_id");

//     if (success === "true" && sessionId && token) {
//       try {
//         const response = await axios.get(
//           `http://localhost:3000/api/cart-session-status?session_id=${sessionId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         if (response.data.status === "complete") {
//           // Wyczyść localStorage
//           localStorage.removeItem("cartCheckoutData");

//           // Pokaż sukces
//           let successMessage = "✅ Płatność zakończona sukcesem!";

//           if (response.data.invoiceUrl) {
//             successMessage += "\nFaktura została wygenerowana.";
//           }

//           if (response.data.discountApplied) {
//             successMessage += `\nZniżka: ${response.data.discountAmount} PLN`;
//           }

//           alert(successMessage);

//           // Jeśli jest faktura, zapytaj czy otworzyć
//           if (
//             response.data.invoiceUrl &&
//             window.confirm("Czy chcesz otworzyć fakturę?")
//           ) {
//             window.open(response.data.invoiceUrl, "_blank");
//           }

//           // Wyczyść koszyk i przekieruj
//           // dispatch(clearCart()); // jeśli masz akcję Redux
//           navigate("/account?tab=purchases");
//         }
//       } catch (err) {
//         console.error("Error checking payment status:", err);
//       }
//     }
//   };

//   // Sprawdź status przy załadowaniu
//   React.useEffect(() => {
//     checkPaymentStatus();
//   }, [token]);

//   if (cartItems.length === 0) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-gray-600">Twój koszyk jest pusty</p>
//         <button
//           onClick={() => navigate("/products")}
//           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Przeglądaj produkty
//         </button>
//       </div>
//     );
//   }

//   const total = calculateTotal();
//   const discountAmount = appliedCoupon?.percent_off
//     ? (total * appliedCoupon.percent_off) / 100
//     : (appliedCoupon?.amount_off || 0) / 100;
//   const finalTotal = total - discountAmount;

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-6">Podsumowanie zamówienia</h2>

//       {/* Lista produktów */}
//       <div className="bg-white rounded-lg shadow p-4 mb-6">
//         <h3 className="font-semibold mb-4">
//           Produkty w koszyku ({cartItems.length})
//         </h3>
//         <div className="space-y-4">
//           {cartItems.map((item) => (
//             <div key={item._id} className="flex items-center border-b pb-4">
//               {item.imageUrl && (
//                 <img
//                   src={item.imageUrl}
//                   alt={item.title}
//                   className="w-16 h-16 object-cover rounded mr-4"
//                 />
//               )}
//               <div className="flex-1">
//                 <p className="font-medium">{item.title}</p>
//                 <p className="text-sm text-gray-600">
//                   Ilość: {item.quantity || 1}
//                 </p>
//               </div>
//               <p className="font-semibold">
//                 {item.price * (item.quantity || 1)} PLN
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* Podsumowanie cen */}
//         <div className="mt-6 pt-4 border-t">
//           <div className="flex justify-between mb-2">
//             <span>Suma częściowa:</span>
//             <span>{total.toFixed(2)} PLN</span>
//           </div>

//           {appliedCoupon && (
//             <div className="flex justify-between mb-2 text-green-600">
//               <span>Zniżka {appliedCoupon.name}:</span>
//               <span>-{discountAmount.toFixed(2)} PLN</span>
//             </div>
//           )}

//           <div className="flex justify-between text-lg font-bold pt-2 border-t">
//             <span>Do zapłaty:</span>
//             <span>{finalTotal.toFixed(2)} PLN</span>
//           </div>
//         </div>
//       </div>

//       {/* Sekcja kuponu */}
//       <div className="bg-white rounded-lg shadow p-4 mb-6">
//         <h3 className="font-semibold mb-4">Kod rabatowy</h3>

//         {!appliedCoupon ? (
//           <>
//             {!showCouponInput ? (
//               <button
//                 type="button"
//                 onClick={() => setShowCouponInput(true)}
//                 className="text-blue-600 hover:text-blue-800 flex items-center"
//               >
//                 <span className="mr-2">🎫</span>
//                 Mam kod rabatowy
//               </button>
//             ) : (
//               <div className="space-y-3">
//                 <div className="flex space-x-2">
//                   <input
//                     type="text"
//                     value={couponCode}
//                     onChange={(e) =>
//                       setCouponCode(e.target.value.toUpperCase())
//                     }
//                     placeholder="Wprowadź kod rabatowy"
//                     className="flex-1 px-3 py-2 border rounded"
//                     disabled={couponLoading}
//                   />
//                   <button
//                     onClick={handleCouponValidation}
//                     disabled={couponLoading || !couponCode.trim()}
//                     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
//                   >
//                     {couponLoading ? "..." : "Zastosuj"}
//                   </button>
//                   <button
//                     onClick={() => {
//                       setShowCouponInput(false);
//                       setCouponError("");
//                     }}
//                     className="px-4 py-2 border rounded hover:bg-gray-50"
//                   >
//                     Anuluj
//                   </button>
//                 </div>
//                 {couponError && (
//                   <p className="text-red-500 text-sm">{couponError}</p>
//                 )}
//               </div>
//             )}
//           </>
//         ) : (
//           <div className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-200">
//             <div>
//               <p className="font-medium text-green-700">
//                 ✅ Kupon zastosowany: {appliedCoupon.name}
//               </p>
//               {appliedCoupon.percent_off && (
//                 <p className="text-sm text-green-600">
//                   Zniżka: {appliedCoupon.percent_off}%
//                 </p>
//               )}
//               {appliedCoupon.amount_off && (
//                 <p className="text-sm text-green-600">
//                   Zniżka: {appliedCoupon.amount_off / 100} PLN
//                 </p>
//               )}
//             </div>
//             <button
//               onClick={removeCoupon}
//               className="text-red-500 hover:text-red-700"
//             >
//               Usuń
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Sekcja faktury */}
//       <div className="bg-white rounded-lg shadow p-4 mb-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="font-semibold">Faktura VAT</h3>
//           <label className="flex items-center space-x-2 cursor-pointer">
//             <input
//               type="checkbox"
//               checked={invoiceDetails.requireInvoice}
//               onChange={handleInvoiceToggle}
//               className="rounded"
//             />
//             <span>Chcę otrzymać fakturę</span>
//           </label>
//         </div>

//         {invoiceDetails.show && (
//           <div className="space-y-4 mt-4 animate-fadeIn">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Nazwa firmy *
//               </label>
//               <input
//                 type="text"
//                 name="companyName"
//                 value={invoiceDetails.companyName}
//                 onChange={handleInvoiceInputChange}
//                 className="w-full px-3 py-2 border rounded"
//                 placeholder="Nazwa Twojej firmy"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 NIP (opcjonalnie)
//               </label>
//               <input
//                 type="text"
//                 name="taxId"
//                 value={invoiceDetails.taxId}
//                 onChange={handleInvoiceInputChange}
//                 className="w-full px-3 py-2 border rounded"
//                 placeholder="Numer NIP"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Adres do faktury (opcjonalnie)
//               </label>
//               <input
//                 type="text"
//                 name="address"
//                 value={invoiceDetails.address}
//                 onChange={handleInvoiceInputChange}
//                 className="w-full px-3 py-2 border rounded"
//                 placeholder="Adres firmy"
//               />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Przycisk płatności */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <button
//           onClick={handleCheckout}
//           disabled={
//             loading ||
//             (invoiceDetails.requireInvoice && !invoiceDetails.companyName)
//           }
//           className={`
//             w-full py-3 px-4 rounded-lg font-medium text-lg
//             flex items-center justify-center space-x-2
//             ${
//               loading ||
//               (invoiceDetails.requireInvoice && !invoiceDetails.companyName)
//                 ? "bg-gray-300 cursor-not-allowed text-gray-500"
//                 : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
//             }
//           `}
//         >
//           {loading ? (
//             <>
//               <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></span>
//               <span>Przygotowanie płatności...</span>
//             </>
//           ) : (
//             <>
//               <span>💳</span>
//               <span>Przejdź do płatności</span>
//               <span className="ml-2">{finalTotal.toFixed(2)} PLN</span>
//             </>
//           )}
//         </button>

//         {invoiceDetails.requireInvoice && !invoiceDetails.companyName && (
//           <p className="text-red-500 text-sm mt-2 text-center">
//             Wprowadź nazwę firmy aby kontynuować
//           </p>
//         )}

//         <div className="mt-4 text-center text-sm text-gray-600 space-y-1">
//           <p>🔒 Bezpieczna płatność przez Stripe</p>
//           <p>💳 Akceptujemy karty Visa, Mastercard, Apple Pay</p>
//           <p>📧 Dostęp do kursów otrzymasz natychmiast po płatności</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CartCheckout;

//////////////////////////////

// import { useSelector, useDispatch } from "react-redux";
// import type { RootState, AppDispatch } from "../../store";
// import { removeFromCart, clearCart } from "../../store/slices/cartSlice";
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";

// const Cart: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const items = useSelector((state: RootState) => state.cart.items);
//   const total = items.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   const { user, token } = useSelector((state: RootState) => state.auth);
//   const [loading, setLoading] = useState(false);

//   const handleCheckout = async () => {
//     if (!user || !token) {
//       console.warn(
//         "Brak zalogowanego użytkownika – przekierowanie do logowania"
//       );
//       //navigate("/login");
//       navigate(`/login?redirect=${encodeURIComponent("/cart")}`);
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await fetch("http://localhost:3000/cart-checkout-session", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ items }),
//       });

//       const data = await res.json();
//       if (data.url) {
//         window.location.href = data.url; // klasyczny redirect Stripe
//       } else {
//         alert("Nie udało się rozpocząć płatności.");
//       }
//     } catch (err) {
//       console.error("Checkout error:", err);
//       alert("Wystąpił błąd podczas płatności.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (items.length === 0)
//     return <p className="text-gray-500 mt-4">Koszyk jest pusty</p>;

//   return (
//     <div className="mt-8 border-t pt-4">
//       <h2 className="text-xl font-bold mb-2">🧺 Twój koszyk</h2>
//       <ul className="space-y-2">
//         {items.map((item) => (
//           <li key={item._id} className="flex justify-between">
//             <span>
//               {item.title} × {item.quantity}
//             </span>
//             <span>{item.price * item.quantity} zł</span>
//             <button
//               className="ml-4 text-red-500"
//               onClick={() => dispatch(removeFromCart(item._id))}
//             >
//               ❌
//             </button>
//           </li>
//         ))}
//       </ul>

//       <p className="mt-4 font-semibold text-lg">
//         Suma: <span className="text-blue-600">{total} zł</span>
//       </p>

//       <div className="mt-4 flex gap-2">
//         <button
//           onClick={() => navigate("/products")}
//           className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
//         >
//           Kontynuuj zakupy
//         </button>

//         <button
//           onClick={handleCheckout}
//           disabled={loading}
//           className="bg-green-500 px-4 py-2 rounded text-white hover:bg-green-600"
//         >
//           {loading ? "Przekierowanie do płatności..." : "Zapłać za koszyk"}
//         </button>

//         <button
//           onClick={() => dispatch(clearCart())}
//           className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600"
//         >
//           Wyczyść koszyk
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Cart;
