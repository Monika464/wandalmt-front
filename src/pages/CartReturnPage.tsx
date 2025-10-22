import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart } from "../store/slices/cartSlice";

const CartReturnPage: React.FC = () => {
  const [message, setMessage] = useState("Sprawdzanie statusu płatności...");
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setMessage("❌ Brak identyfikatora sesji płatności");
      return;
    }

    fetch(`http://localhost:3000/cart-purchase?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Cart return data:", data);
        if (data.status === "complete") {
          setMessage("✅ Płatność za koszyk zakończona sukcesem! 🎉");
          dispatch(clearCart());
        } else {
          setMessage("❌ Płatność nie została ukończona lub jest w toku.");
        }
      })
      .catch(() =>
        setMessage("Wystąpił błąd podczas sprawdzania statusu płatności.")
      );
  }, [dispatch, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">Status płatności koszyka</h1>
      <p>{message}</p>
      <a
        href="/products"
        className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Powrót do sklepu
      </a>
    </div>
  );
};

export default CartReturnPage;
