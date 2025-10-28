import React, { useEffect, useState } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useSelector } from "react-redux";
import { useLocation, Navigate } from "react-router-dom";
import type { RootState } from "../store";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const CartCheckoutPage: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  console.log("Stripe key:", import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  const location = useLocation();
  const { cart } = location.state as { cart: any[] };
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!cart?.length || !user?._id) return;

    // console.log("User:", user);
    // console.log("Token:", token);

    fetch("http://localhost:3000/cart-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items: cart, userId: user._id }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🛒 Cart checkout session:", data);
        setClientSecret(data.client_secret);
      })
      .catch((err) => console.error("Error creating cart session:", err));
  }, [cart, user, token]);

  if (!user) return <Navigate to="/login" replace />;
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

export default CartCheckoutPage;
