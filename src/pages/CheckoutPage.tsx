import React, { useEffect, useState } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const CheckoutPage: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  console.log("CheckoutPage rendered");

  useEffect(() => {
    fetch("http://localhost:3000/create-checkout-session", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data);
        console.log("Received client secret:", data.client_secret);
        setClientSecret(data.client_secret);
      });
  }, []);

  if (!clientSecret) return <p>Ładowanie płatności...</p>;

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
