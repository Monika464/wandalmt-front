import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

interface CheckoutButtonProps {
  productId: string;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ productId }) => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    //navigate("/checkout", { state: { productId } });
    if (!user || !token) {
      console.warn(
        "Brak zalogowanego użytkownika – przekierowanie do logowania"
      );
      //navigate("/login");
      //navigate(`/login?redirect=${encodeURIComponent("/products")}`);
      navigate(
        `/login?redirect=${encodeURIComponent(`/products/${productId}`)}`
      );
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, userId: user._id }),
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

  return (
    <>
      <button
        onClick={handleClick}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        💳 Kup teraz
      </button>
      {loading && <p>Przygotowanie płatności...</p>}
    </>
  );
};

export default CheckoutButton;
