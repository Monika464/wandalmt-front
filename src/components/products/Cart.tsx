// components/cart/Cart.tsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../../store";
import {
  removeFromCart,
  clearCart,
  updateQuantity,
} from "../../store/slices/cartSlice";

const Cart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const items = useSelector((state: RootState) => state.cart.items);

  // Oblicz sumę koszyka
  const calculateTotal = () => {
    return items.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0
    );
  };

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleClearCart = () => {
    if (window.confirm("Czy na pewno chcesz wyczyścić cały koszyk?")) {
      dispatch(clearCart());
    }
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
    }
  };

  const handleCheckout = () => {
    navigate("/cart/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Twój koszyk</h2>
        <p className="text-gray-600 mb-4">Twój koszyk jest pusty</p>
        <button
          onClick={() => navigate("/products")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Przeglądaj produkty
        </button>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Twój koszyk</h2>

      {/* Lista produktów */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center space-x-4">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-gray-600">{item.price} PLN</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Zmiana ilości */}
                <div className="flex items-center border rounded">
                  <button
                    onClick={() =>
                      handleQuantityChange(item._id, (item.quantity || 1) - 1)
                    }
                    className="px-3 py-1 hover:bg-gray-100"
                    disabled={(item.quantity || 1) <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 py-1">{item.quantity || 1}</span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item._id, (item.quantity || 1) + 1)
                    }
                    className="px-3 py-1 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                {/* Suma za produkt */}
                <div className="text-right min-w-[100px]">
                  <p className="font-semibold">
                    {item.price * (item.quantity || 1)} PLN
                  </p>
                </div>

                {/* Przycisk usuń */}
                <button
                  onClick={() => handleRemoveItem(item._id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Usuń produkt"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Podsumowanie */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between text-lg font-bold">
            <span>Razem:</span>
            <span>{total.toFixed(2)} PLN</span>
          </div>
        </div>
      </div>

      {/* Przyciski akcji */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/products")}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            ← Kontynuuj zakupy
          </button>

          <button
            onClick={handleClearCart}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🗑️ Wyczyść koszyk
          </button>
        </div>

        <button
          onClick={handleCheckout}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold flex items-center justify-center"
        >
          Przejdź do podsumowania zamówienia
          <svg
            className="ml-2 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>

      {/* Informacje */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Informacje</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • Możesz zmieniać ilość produktów korzystając z przycisków +/-
          </li>
          <li>• Aby usunąć pojedynczy produkt, użyj ikony kosza</li>
          <li>• Koszyk jest zapisywany automatycznie</li>
          <li>• Po przejściu do płatności możesz zastosować kupon rabatowy</li>
        </ul>
      </div>
    </div>
  );
};

export default Cart;
