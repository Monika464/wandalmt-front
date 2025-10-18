import React, { useEffect, useState } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useLocation } from "react-router-dom";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const CheckoutPage: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const location = useLocation();
  const { productId } = location.state as { productId: string };
  console.log("Wybrany produkt:", productId);

  useEffect(() => {
    if (!productId) return;
    fetch("http://localhost:3000/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Received session data:", data);
        setClientSecret(data.client_secret);
      })
      .catch((err) => console.error("Error fetching session:", err));
  }, [productId]);

  if (!clientSecret) {
    return <p>Ładowanie płatności...</p>;
  }

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
