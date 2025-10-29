import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../store/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../store";

interface PurchaseItem {
  productName: string;
  amount: number;
}

const CartReturnPage: React.FC = () => {
  console.log("Rendering CartReturnPage");
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
