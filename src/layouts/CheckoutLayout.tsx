// layouts/CheckoutLayout.tsx
import { Outlet } from "react-router-dom";
import CartCheckoutPage from "../pages/CartCheckoutPage";

const CheckoutLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <CartCheckoutPage />
        <Outlet />
      </main>
    </div>
  );
};

export default CheckoutLayout;
