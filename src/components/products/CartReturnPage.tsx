// // src/components/products/CartReturnPage.tsx
// import { useEffect, useState } from "react";
// import axios from "axios";

// interface Order {
//   _id: string;
//   user: {
//     email: string;
//   };
//   products: {
//     product: {
//       title: string;
//       price: number;
//     };
//     quantity: number;
//   }[];
// }

// export default function CartReturnPage() {
//   const [loading, setLoading] = useState(true);
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const verifyAndFetchOrders = async () => {
//       const urlParams = new URLSearchParams(window.location.search);
//       const session_id = urlParams.get("session_id");
//       const token = localStorage.getItem("token");

//       if (!session_id || !token) {
//         setMessage("Brak session_id lub tokena");
//         setLoading(false);
//         return;
//       }

//       try {
//         // ✅ najpierw sprawdzamy status płatności
//         await axios.get(
//           `http://localhost:3000/cart-session-status?session_id=${session_id}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         // ✅ następnie pobieramy zamówienia użytkownika
//         const { data } = await axios.get(
//           `http://localhost:3000/api/my-orders`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         setOrders(data);
//         setMessage("✅ Płatność zakończona sukcesem!");
//       } catch (err: any) {
//         console.error("Błąd:", err.response?.data || err.message);
//         setMessage(
//           "❌ Błąd podczas sprawdzania płatności lub pobierania zamówień"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     verifyAndFetchOrders();
//   }, []);

//   if (loading) return <p>⏳ Trwa weryfikacja płatności...</p>;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-semibold mb-4">{message}</h1>

//       {orders.length > 0 ? (
//         <div className="space-y-4">
//           {orders.map((order) => (
//             <div
//               key={order._id}
//               className="border p-4 rounded-lg shadow-md bg-white"
//             >
//               <p className="text-gray-600">Zamówienie #{order._id}</p>
//               <p className="text-sm text-gray-500">
//                 E-mail: {order.user.email}
//               </p>
//               <ul className="mt-2">
//                 {order.products.map((item, index) => (
//                   <li key={index} className="flex justify-between">
//                     <span>
//                       {item.product.title} × {item.quantity}
//                     </span>
//                     <span>{item.product.price.toFixed(2)} PLN</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p>Nie znaleziono zamówień.</p>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../../store/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../../store";

interface PurchaseItem {
  productName: string;
  amount: number;
}

const CartReturnPage: React.FC = () => {
  const [message, setMessage] = useState(
    "Trwa sprawdzanie statusu płatności..."
  );
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setMessage("Brak session_id w adresie URL");
      return;
    }

    const verifyPayment = async () => {
      try {
        const statusRes = await fetch(
          `http://localhost:3000/cart-session-status?session_id=${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!statusRes.ok)
          throw new Error("Błąd podczas sprawdzania płatności");

        const statusData = await statusRes.json();

        if (statusData.status === "complete") {
          setMessage("✅ Płatność zakończona sukcesem front!");

          // 🔹 Przykładowe dane — możesz je rozbudować, jeśli chcesz pokazać więcej szczegółów
          setPurchases([
            {
              productName: "Zamówienie zrealizowane",
              amount: 0,
            },
          ]);

          dispatch(clearCart());
        } else if (statusData.status === "pending") {
          setMessage("⏳ Płatność w trakcie przetwarzania...");
        } else {
          setMessage("❌ Płatność nie powiodła się lub została anulowana.");
        }
      } catch (err) {
        console.error(err);
        setMessage("❌ Wystąpił błąd podczas sprawdzania płatności.");
      }
    };

    verifyPayment();
  }, [dispatch, token]);

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">{message}</h2>

      {purchases.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Szczegóły zamówienia:</h3>
          <ul className="list-disc pl-6 inline-block text-left">
            {purchases.map((item, index) => (
              <li key={index}>
                {item.productName}
                {item.amount > 0 && ` — ${(item.amount / 100).toFixed(2)} PLN`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => navigate("/products")}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Kontynuuj zakupy
      </button>
    </div>
  );
};

export default CartReturnPage;
