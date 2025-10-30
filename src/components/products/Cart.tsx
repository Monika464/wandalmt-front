import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { removeFromCart, clearCart } from "../../store/slices/cartSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Cart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const items = useSelector((state: RootState) => state.cart.items);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const { user, token } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user || !token) {
      console.warn(
        "Brak zalogowanego użytkownika – przekierowanie do logowania"
      );
      //navigate("/login");
      navigate(`/login?redirect=${encodeURIComponent("/cart")}`);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/cart-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // klasyczny redirect Stripe
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

  if (items.length === 0)
    return <p className="text-gray-500 mt-4">Koszyk jest pusty</p>;

  return (
    <div className="mt-8 border-t pt-4">
      <h2 className="text-xl font-bold mb-2">🧺 Twój koszyk</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item._id} className="flex justify-between">
            <span>
              {item.title} × {item.quantity}
            </span>
            <span>{item.price * item.quantity} zł</span>
            <button
              className="ml-4 text-red-500"
              onClick={() => dispatch(removeFromCart(item._id))}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 font-semibold text-lg">
        Suma: <span className="text-blue-600">{total} zł</span>
      </p>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => navigate("/products")}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
        >
          Kontynuuj zakupy
        </button>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="bg-green-500 px-4 py-2 rounded text-white hover:bg-green-600"
        >
          {loading ? "Przekierowanie do płatności..." : "Zapłać za koszyk"}
        </button>

        <button
          onClick={() => dispatch(clearCart())}
          className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600"
        >
          Wyczyść koszyk
        </button>
      </div>
    </div>
  );
};

export default Cart;
