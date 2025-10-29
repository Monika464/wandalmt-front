import React, { useEffect, useState } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { Navigate } from "react-router-dom";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const CheckoutPage: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const location = useLocation();
  const { productId } = location.state as { productId: string };
  //console.log("Wybrany produkt:", productId);

  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!productId || !user?._id) return;

    fetch("http://localhost:3000/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      //body: JSON.stringify({ productId }),
      body: JSON.stringify({
        productId,
        userId: user._id, // przekazujemy userId do backendu
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        //console.log("Received session data:", data);
        setClientSecret(data.client_secret);
      })
      .catch((err) => console.error("Error fetching session:", err));
  }, [productId, user, token]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!clientSecret) {
    return <p>Ładowanie płatności...</p>;
  }
  // Brak zalogowanego użytkownika → przekierowanie na /homepage

  return (
    <div className="checkout-container">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

export default CheckoutPage;
