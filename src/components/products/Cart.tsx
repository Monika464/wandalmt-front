// components/cart/Cart.tsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../../store";
import { fetchUserOrders } from "../../store/slices/orderSlice";
import {
  removeFromCart,
  clearCart,
  updateQuantity,
} from "../../store/slices/cartSlice";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../../hooks/useCurrency";

const Cart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedCurrency, getFormattedPrice } = useCurrency();
  const [showCurrencyWarning, setShowCurrencyWarning] = useState(false);
  const [currencyWarningConfirmed, setCurrencyWarningConfirmed] =
    useState(false);

  const items = useSelector((state: RootState) => state.cart.items);
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    userOrders,
    loading: ordersLoading,
    error: ordersError,
  } = useSelector((state: RootState) => state.orders);

  // Resetuj potwierdzenie gdy waluta się zmienia
  useEffect(() => {
    if (selectedCurrency !== "PLN") {
      setCurrencyWarningConfirmed(false);
    }
  }, [selectedCurrency]);

  // Ładuj zamówienia TYLKO jeśli użytkownik jest zalogowany
  useEffect(() => {
    if (user) {
      dispatch(fetchUserOrders());
    }
  }, [dispatch, user]);

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleClearCart = () => {
    if (window.confirm(t("cart.clearConfirm"))) {
      dispatch(clearCart());
    }
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
    }
  };

  const handleCheckout = () => {
    // Jeśli niezalogowany, przekieruj do logowania z powrotem do koszyka
    if (!user) {
      navigate("/login?redirect=/cart");
      return;
    }

    // Jeśli wybrano USD i nie potwierdzono ostrzeżenia, pokaż ostrzeżenie
    if (selectedCurrency !== "PLN" && !currencyWarningConfirmed) {
      setShowCurrencyWarning(true);
      return;
    }

    navigate("/cart/checkout");
  };

  // Sprawdź posiadane produkty TYLKO dla zalogowanych użytkowników
  const alreadyOwnedProducts = React.useMemo(() => {
    // Jeśli użytkownik niezalogowany, nie ma sensu sprawdzać
    if (!user || !Array.isArray(userOrders) || !Array.isArray(items)) {
      return [];
    }

    const paidOrders = userOrders.filter(
      (order) =>
        order.status === "paid" || order.status === "partially_refunded",
    );

    const orderedProductIds = paidOrders.flatMap((order) =>
      order.products
        .filter((p) => (p.refundQuantity || 0) < p.quantity)
        .map((p) => p.productId?.toString())
        .filter((id) => id != null),
    );

    return items.filter((item) => {
      if (!item || !item._id) return false;
      return orderedProductIds.includes(item._id.toString());
    });
  }, [userOrders, items, user]);

  // BŁĄD - pokazuj tylko jeśli użytkownik zalogowany i jest błąd
  if (user && ordersError) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            {t("common.error")}
          </h2>
          <p className="text-red-600 mb-6">
            {t("cart.ordersError")}: {ordersError}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => dispatch(fetchUserOrders())}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              {t("common.tryAgain")}
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              {t("common.goHome")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ładowanie - tylko dla zalogowanych
  if (user && ordersLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("cart.loadingOrders")}</p>
        </div>
      </div>
    );
  }

  // Ostrzeżenie o posiadanych produktach - tylko dla zalogowanych
  if (user && !ordersLoading && alreadyOwnedProducts.length > 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-yellow-800 mb-2">
            ⚠️ {t("cart.warning")}
          </h3>
          <p className="text-yellow-700">
            {t("cart.alreadyOwned", { count: alreadyOwnedProducts.length })}
          </p>
          <ul className="list-disc ml-5 mt-2">
            {alreadyOwnedProducts.map((item) => (
              <li key={item._id} className="text-yellow-600">
                {item.title}
              </li>
            ))}
          </ul>
          <p className="text-sm text-yellow-600 mt-2">
            {t("cart.alreadyOwnedMessage")}
          </p>
          <button
            onClick={() => navigate("/user/orders")}
            className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            {t("cart.viewOrders")}
          </button>
        </div>

        <CartContent
          items={items}
          handleRemoveItem={handleRemoveItem}
          handleClearCart={handleClearCart}
          handleQuantityChange={handleQuantityChange}
          handleCheckout={handleCheckout}
          navigate={navigate}
          user={user}
          showCurrencyWarning={showCurrencyWarning}
          setShowCurrencyWarning={setShowCurrencyWarning}
          currencyWarningConfirmed={currencyWarningConfirmed}
          setCurrencyWarningConfirmed={setCurrencyWarningConfirmed}
          getFormattedPrice={getFormattedPrice}
          selectedCurrency={selectedCurrency}
        />
      </div>
    );
  }

  // Normalny koszyk - działa dla wszystkich
  return (
    <CartContent
      items={items}
      handleRemoveItem={handleRemoveItem}
      handleClearCart={handleClearCart}
      handleQuantityChange={handleQuantityChange}
      handleCheckout={handleCheckout}
      navigate={navigate}
      user={user}
      showCurrencyWarning={showCurrencyWarning}
      setShowCurrencyWarning={setShowCurrencyWarning}
      currencyWarningConfirmed={currencyWarningConfirmed}
      setCurrencyWarningConfirmed={setCurrencyWarningConfirmed}
      getFormattedPrice={getFormattedPrice}
      selectedCurrency={selectedCurrency}
    />
  );
};

interface CartContentProps {
  items: any[];
  handleRemoveItem: (productId: string) => void;
  handleClearCart: () => void;
  handleQuantityChange: (productId: string, newQuantity: number) => void;
  handleCheckout: () => void;
  navigate: (path: string) => void;
  user: any | null;
  showCurrencyWarning: boolean;
  setShowCurrencyWarning: (show: boolean) => void;
  currencyWarningConfirmed: boolean;
  setCurrencyWarningConfirmed: (confirmed: boolean) => void;
  getFormattedPrice: (price: number) => string;
  selectedCurrency: string;
}

const CartContent: React.FC<CartContentProps> = ({
  items,
  handleRemoveItem,
  handleClearCart,
  handleQuantityChange,
  handleCheckout,
  navigate,
  user,
  showCurrencyWarning,
  setShowCurrencyWarning,
  currencyWarningConfirmed,
  setCurrencyWarningConfirmed,
  getFormattedPrice,
  selectedCurrency,
}) => {
  const { t } = useTranslation();
  const { availableCurrencies } = useCurrency();

  const calculateTotal = () => {
    return items.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0,
    );
  };

  const handleConfirmWarning = () => {
    setCurrencyWarningConfirmed(true);
    setShowCurrencyWarning(false);
  };

  const handleSwitchToPLN = () => {
    setCurrencyWarningConfirmed(false);
    setShowCurrencyWarning(false);
    // Tutaj możesz dodać logikę zmiany waluty na PLN
    // jeśli masz taką funkcję dostępną
  };

  // Znajdź aktualną walutę
  // const currentCurrency = availableCurrencies.find(
  //   (c) => c.code === selectedCurrency,
  // );

  const usdCurrency = availableCurrencies.find((c) => c.code === "USD");

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">{t("cart.yourCart")}</h2>
        <p className="text-gray-600 mb-4">{t("cart.empty")}</p>
        <button
          onClick={() => navigate("/products")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t("cart.browseProducts")}
        </button>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Informacje o walucie - zawsze widoczne u góry */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-700">
        <p className="flex items-center">
          <span className="font-semibold mr-2">
            ℹ️ {t("cart.currencyInfo1")}
          </span>
          <span className="text-blue-600">{t("cart.currencyInfo2")}</span>
        </p>
      </div>

      {/* Ostrzeżenie walutowe - tylko gdy wybrano USD i nie potwierdzono */}
      {selectedCurrency !== "PLN" && !currencyWarningConfirmed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">⚠️</span>
            {t("cart.currencyWarning.title")}
          </h3>

          <p className="text-yellow-700 mb-4">
            {t("cart.currencyWarning.message", { currency: selectedCurrency })}
          </p>

          <div className="bg-white rounded p-3 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {t("cart.currencyWarning.amountIn", {
                  currency: selectedCurrency,
                })}
                :
              </span>
              <span className="font-medium">{getFormattedPrice(total)}</span>
            </div>
            {usdCurrency && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {t("cart.currencyWarning.exchangeRate", {
                    currency: selectedCurrency,
                  })}
                  :
                </span>
                <span className="font-medium">
                  1 {selectedCurrency} = {usdCurrency.rate.toFixed(4)} PLN
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-yellow-200">
              <span className="text-gray-600 font-medium">
                {t("cart.currencyWarning.toPay")}:
              </span>
              <span className="font-bold text-yellow-800">
                {total.toFixed(2)} PLN
              </span>
            </div>
          </div>

          <p className="text-xs text-yellow-600 mb-4">
            {t("cart.currencyWarning.disclaimer")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConfirmWarning}
              className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium transition-colors"
            >
              {t("cart.currencyWarning.understand")}
            </button>
            <button
              onClick={handleSwitchToPLN}
              className="flex-1 px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-100 font-medium transition-colors"
            >
              {t("cart.currencyWarning.showInPLN")}
            </button>
          </div>
        </div>
      )}

      {/* Dodatkowe ostrzeżenie jeśli kliknięto checkout bez potwierdzenia */}
      {showCurrencyWarning &&
        selectedCurrency !== "PLN" &&
        !currencyWarningConfirmed && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
            <p className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {t("cart.confirmWarningFirst")}
            </p>
          </div>
        )}

      <h2 className="text-2xl font-bold mb-6">{t("cart.yourCart")}</h2>

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
                  <p className="text-gray-600">
                    {getFormattedPrice(item.price)}{" "}
                    {/* 👈 Użyj formatowania walutowego */}
                  </p>
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

                {/* Suma za produkt - wyświetlana w wybranej walucie */}
                <div className="text-right min-w-[100px]">
                  <p className="font-semibold">
                    {getFormattedPrice(item.price * (item.quantity || 1))}
                  </p>
                  {/* Mała informacja o cenie w PLN dla USD */}
                  {selectedCurrency !== "PLN" && (
                    <p className="text-xs text-gray-400">
                      {(item.price * (item.quantity || 1)).toFixed(2)} PLN
                    </p>
                  )}
                </div>

                {/* Przycisk usuń */}
                <button
                  onClick={() => handleRemoveItem(item._id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title={t("cart.remove")}
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
            <span>{t("cart.total")}:</span>
            <div className="text-right">
              <span>{getFormattedPrice(total)}</span>
              {selectedCurrency !== "PLN" && (
                <p className="text-sm font-normal text-gray-400">
                  {total.toFixed(2)} PLN
                </p>
              )}
            </div>
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
            ← {t("cart.continueShopping")}
          </button>

          <button
            onClick={handleClearCart}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🗑️ {t("cart.clearCart")}
          </button>
        </div>

        <button
          onClick={handleCheckout}
          disabled={selectedCurrency !== "PLN" && !currencyWarningConfirmed}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-colors ${
            selectedCurrency !== "PLN" && !currencyWarningConfirmed
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {user ? t("cart.checkout") : t("cart.loginAndCheckout")}
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
        <h3 className="font-semibold text-blue-800 mb-2">{t("cart.info")}</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• {t("cart.info1")}</li>
          <li>• {t("cart.info2")}</li>
          <li>• {t("cart.info3")}</li>
          {!user && (
            <li className="font-semibold text-blue-800">• {t("cart.info4")}</li>
          )}
          <li>• {t("cart.info5")}</li>
          <li>• {t("cart.info6")}</li>
        </ul>
      </div>
    </div>
  );
};

export default Cart;
///////////////////////////////////////////////////////////////////////////////
// // components/cart/Cart.tsx
// import React, { useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import type { RootState, AppDispatch } from "../../store";
// import { fetchUserOrders } from "../../store/slices/orderSlice";
// import {
//   removeFromCart,
//   clearCart,
//   updateQuantity,
// } from "../../store/slices/cartSlice";
// import { useTranslation } from "react-i18next"; // 👈 Dodaj import

// const Cart: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const { t } = useTranslation(); // 👈 Inicjalizacja
//   const items = useSelector((state: RootState) => state.cart.items);
//   const { user } = useSelector((state: RootState) => state.auth);
//   const {
//     userOrders,
//     loading: ordersLoading,
//     error: ordersError,
//   } = useSelector((state: RootState) => state.orders);

//   // Ładuj zamówienia TYLKO jeśli użytkownik jest zalogowany
//   useEffect(() => {
//     if (user) {
//       dispatch(fetchUserOrders());
//     }
//   }, [dispatch, user]);

//   const handleRemoveItem = (productId: string) => {
//     dispatch(removeFromCart(productId));
//   };

//   const handleClearCart = () => {
//     if (window.confirm(t("cart.clearConfirm"))) {
//       dispatch(clearCart());
//     }
//   };

//   const handleQuantityChange = (productId: string, newQuantity: number) => {
//     if (newQuantity >= 1) {
//       dispatch(updateQuantity({ productId, quantity: newQuantity }));
//     }
//   };

//   const handleCheckout = () => {
//     // Jeśli niezalogowany, przekieruj do logowania z powrotem do koszyka
//     if (!user) {
//       navigate("/login?redirect=/cart");
//       return;
//     }
//     navigate("/cart/checkout");
//   };

//   // Sprawdź posiadane produkty TYLKO dla zalogowanych użytkowników
//   const alreadyOwnedProducts = React.useMemo(() => {
//     // Jeśli użytkownik niezalogowany, nie ma sensu sprawdzać
//     if (!user || !Array.isArray(userOrders) || !Array.isArray(items)) {
//       return [];
//     }

//     const paidOrders = userOrders.filter(
//       (order) =>
//         order.status === "paid" || order.status === "partially_refunded",
//     );

//     const orderedProductIds = paidOrders.flatMap((order) =>
//       order.products
//         .filter((p) => (p.refundQuantity || 0) < p.quantity)
//         .map((p) => p.productId?.toString())
//         .filter((id) => id != null),
//     );

//     return items.filter((item) => {
//       if (!item || !item._id) return false;
//       return orderedProductIds.includes(item._id.toString());
//     });
//   }, [userOrders, items, user]);

//   // BŁĄD - pokazuj tylko jeśli użytkownik zalogowany i jest błąd
//   if (user && ordersError) {
//     return (
//       <div className="max-w-4xl mx-auto p-4">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//           <div className="text-red-500 text-5xl mb-4">⚠️</div>
//           <h2 className="text-2xl font-bold text-red-700 mb-4">
//             {t("common.error")}
//           </h2>
//           <p className="text-red-600 mb-6">
//             {t("cart.ordersError")}: {ordersError}
//           </p>
//           <div className="space-x-4">
//             <button
//               onClick={() => dispatch(fetchUserOrders())}
//               className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//             >
//               {t("common.tryAgain")}
//             </button>
//             <button
//               onClick={() => navigate("/")}
//               className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//             >
//               {t("common.goHome")}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Ładowanie - tylko dla zalogowanych
//   if (user && ordersLoading) {
//     return (
//       <div className="max-w-4xl mx-auto p-4">
//         <div className="text-center py-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">{t("cart.loadingOrders")}</p>
//         </div>
//       </div>
//     );
//   }

//   // Ostrzeżenie o posiadanych produktach - tylko dla zalogowanych
//   if (user && !ordersLoading && alreadyOwnedProducts.length > 0) {
//     return (
//       <div className="max-w-4xl mx-auto p-4">
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//           <h3 className="font-bold text-yellow-800 mb-2">
//             ⚠️ {t("cart.warning")}
//           </h3>
//           <p className="text-yellow-700">
//             {t("cart.alreadyOwned", { count: alreadyOwnedProducts.length })}
//           </p>
//           <ul className="list-disc ml-5 mt-2">
//             {alreadyOwnedProducts.map((item) => (
//               <li key={item._id} className="text-yellow-600">
//                 {item.title}
//               </li>
//             ))}
//           </ul>
//           <p className="text-sm text-yellow-600 mt-2">
//             {t("cart.alreadyOwnedMessage")}
//           </p>
//           <button
//             onClick={() => navigate("/user/orders")}
//             className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
//           >
//             {t("cart.viewOrders")}
//           </button>
//         </div>

//         <CartContent
//           items={items}
//           handleRemoveItem={handleRemoveItem}
//           handleClearCart={handleClearCart}
//           handleQuantityChange={handleQuantityChange}
//           handleCheckout={handleCheckout}
//           navigate={navigate}
//           user={user}
//         />
//       </div>
//     );
//   }

//   // Normalny koszyk - działa dla wszystkich
//   return (
//     <CartContent
//       items={items}
//       handleRemoveItem={handleRemoveItem}
//       handleClearCart={handleClearCart}
//       handleQuantityChange={handleQuantityChange}
//       handleCheckout={handleCheckout}
//       navigate={navigate}
//       user={user}
//     />
//   );
// };

// interface CartContentProps {
//   items: any[];
//   handleRemoveItem: (productId: string) => void;
//   handleClearCart: () => void;
//   handleQuantityChange: (productId: string, newQuantity: number) => void;
//   handleCheckout: () => void;
//   navigate: (path: string) => void;
//   user: any | null;
// }

// const CartContent: React.FC<CartContentProps> = ({
//   items,
//   handleRemoveItem,
//   handleClearCart,
//   handleQuantityChange,
//   handleCheckout,
//   navigate,
//   user,
// }) => {
//   const { t } = useTranslation(); // 👈 Dodaj useTranslation

//   const calculateTotal = () => {
//     return items.reduce(
//       (total, item) => total + item.price * (item.quantity || 1),
//       0,
//     );
//   };

//   if (items.length === 0) {
//     return (
//       <div className="text-center py-8">
//         <h2 className="text-2xl font-bold mb-4">{t("cart.yourCart")}</h2>
//         <p className="text-gray-600 mb-4">{t("cart.empty")}</p>
//         <button
//           onClick={() => navigate("/products")}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           {t("cart.browseProducts")}
//         </button>
//       </div>
//     );
//   }

//   const total = calculateTotal();

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-6">{t("cart.yourCart")}</h2>

//       {/* Lista produktów */}
//       <div className="bg-white rounded-lg shadow p-4 mb-6">
//         <div className="space-y-4">
//           {items.map((item) => (
//             <div
//               key={item._id}
//               className="flex items-center justify-between border-b pb-4"
//             >
//               <div className="flex items-center space-x-4">
//                 {item.imageUrl && (
//                   <img
//                     src={item.imageUrl}
//                     alt={item.title}
//                     className="w-20 h-20 object-cover rounded"
//                   />
//                 )}
//                 <div>
//                   <h3 className="font-semibold">{item.title}</h3>
//                   <p className="text-gray-600">
//                     {item.price} {t("cart.currency")}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-4">
//                 {/* Zmiana ilości */}
//                 <div className="flex items-center border rounded">
//                   <button
//                     onClick={() =>
//                       handleQuantityChange(item._id, (item.quantity || 1) - 1)
//                     }
//                     className="px-3 py-1 hover:bg-gray-100"
//                     disabled={(item.quantity || 1) <= 1}
//                   >
//                     -
//                   </button>
//                   <span className="px-3 py-1">{item.quantity || 1}</span>
//                   <button
//                     onClick={() =>
//                       handleQuantityChange(item._id, (item.quantity || 1) + 1)
//                     }
//                     className="px-3 py-1 hover:bg-gray-100"
//                   >
//                     +
//                   </button>
//                 </div>

//                 {/* Suma za produkt */}
//                 <div className="text-right min-w-[100px]">
//                   <p className="font-semibold">
//                     {item.price * (item.quantity || 1)} {t("cart.currency")}
//                   </p>
//                 </div>

//                 {/* Przycisk usuń */}
//                 <button
//                   onClick={() => handleRemoveItem(item._id)}
//                   className="text-red-500 hover:text-red-700 p-2"
//                   title={t("cart.remove")}
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                     />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Podsumowanie */}
//         <div className="mt-6 pt-4 border-t">
//           <div className="flex justify-between text-lg font-bold">
//             <span>{t("cart.total")}:</span>
//             <span>
//               {total.toFixed(2)} {t("cart.currency")}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Przyciski akcji */}
//       <div className="flex flex-col sm:flex-row gap-4 justify-between">
//         <div className="flex gap-4">
//           <button
//             onClick={() => navigate("/products")}
//             className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
//           >
//             ← {t("cart.continueShopping")}
//           </button>

//           <button
//             onClick={handleClearCart}
//             className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//           >
//             🗑️ {t("cart.clearCart")}
//           </button>
//         </div>

//         <button
//           onClick={handleCheckout}
//           className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold flex items-center justify-center"
//         >
//           {user ? t("cart.checkout") : t("cart.loginAndCheckout")}
//           <svg
//             className="ml-2 w-5 h-5"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M14 5l7 7m0 0l-7 7m7-7H3"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Informacje */}
//       <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-4">
//         <h3 className="font-semibold text-blue-800 mb-2">{t("cart.info")}</h3>
//         <ul className="text-sm text-blue-700 space-y-1">
//           <li>• {t("cart.info1")}</li>
//           <li>• {t("cart.info2")}</li>
//           <li>• {t("cart.info3")}</li>
//           {!user && (
//             <li className="font-semibold text-blue-800">• {t("cart.info4")}</li>
//           )}
//           <li>• {t("cart.info5")}</li>
//           <li>• {t("cart.info6")}</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Cart;
/////////////////////////////////////////////////////

// // components/cart/Cart.tsx
// import React, { useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import type { RootState, AppDispatch } from "../../store";
// import { fetchUserOrders } from "../../store/slices/orderSlice";
// import {
//   removeFromCart,
//   clearCart,
//   updateQuantity,
// } from "../../store/slices/cartSlice";

// const Cart: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const items = useSelector((state: RootState) => state.cart.items);
//   const { user } = useSelector((state: RootState) => state.auth); // 👈 Pobierz użytkownika
//   const {
//     userOrders,
//     loading: ordersLoading,
//     error: ordersError,
//   } = useSelector((state: RootState) => state.orders);

//   // 👇 Ładuj zamówienia TYLKO jeśli użytkownik jest zalogowany
//   useEffect(() => {
//     if (user) {
//       dispatch(fetchUserOrders());
//     }
//   }, [dispatch, user]);

//   const handleRemoveItem = (productId: string) => {
//     dispatch(removeFromCart(productId));
//   };

//   const handleClearCart = () => {
//     if (window.confirm("Czy na pewno chcesz wyczyścić cały koszyk?")) {
//       dispatch(clearCart());
//     }
//   };

//   const handleQuantityChange = (productId: string, newQuantity: number) => {
//     if (newQuantity >= 1) {
//       dispatch(updateQuantity({ productId, quantity: newQuantity }));
//     }
//   };

//   const handleCheckout = () => {
//     // 👇 Jeśli niezalogowany, przekieruj do logowania z powrotem do koszyka
//     if (!user) {
//       navigate("/login?redirect=/cart");
//       return;
//     }
//     navigate("/cart/checkout");
//   };

//   // 👇 Sprawdź posiadane produkty TYLKO dla zalogowanych użytkowników
//   const alreadyOwnedProducts = React.useMemo(() => {
//     // Jeśli użytkownik niezalogowany, nie ma sensu sprawdzać
//     if (!user || !Array.isArray(userOrders) || !Array.isArray(items)) {
//       return [];
//     }

//     const paidOrders = userOrders.filter(
//       (order) =>
//         order.status === "paid" || order.status === "partially_refunded",
//     );

//     const orderedProductIds = paidOrders.flatMap((order) =>
//       order.products
//         .filter((p) => (p.refundQuantity || 0) < p.quantity)
//         .map((p) => p.productId?.toString())
//         .filter((id) => id != null),
//     );

//     return items.filter((item) => {
//       if (!item || !item._id) return false;
//       return orderedProductIds.includes(item._id.toString());
//     });
//   }, [userOrders, items, user]); // 👈 Dodaj user do zależności

//   // 🔥 BŁĄD - pokazuj tylko jeśli użytkownik zalogowany i jest błąd
//   if (user && ordersError) {
//     return (
//       <div className="max-w-4xl mx-auto p-4">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//           <div className="text-red-500 text-5xl mb-4">⚠️</div>
//           <h2 className="text-2xl font-bold text-red-700 mb-4">
//             Wystąpił błąd
//           </h2>
//           <p className="text-red-600 mb-6">
//             Błąd podczas ładowania zamówień: {ordersError}
//           </p>
//           <div className="space-x-4">
//             <button
//               onClick={() => dispatch(fetchUserOrders())}
//               className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//             >
//               Spróbuj ponownie
//             </button>
//             <button
//               onClick={() => navigate("/")}
//               className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//             >
//               Wróć na stronę główną
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // 👇 Ładowanie - tylko dla zalogowanych
//   if (user && ordersLoading) {
//     return (
//       <div className="max-w-4xl mx-auto p-4">
//         <div className="text-center py-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">
//             Ładowanie informacji o zamówieniach...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // 👇 Ostrzeżenie o posiadanych produktach - tylko dla zalogowanych
//   if (user && !ordersLoading && alreadyOwnedProducts.length > 0) {
//     return (
//       <div className="max-w-4xl mx-auto p-4">
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//           <h3 className="font-bold text-yellow-800 mb-2">⚠️ Uwaga</h3>
//           <p className="text-yellow-700">
//             Masz już dostęp do {alreadyOwnedProducts.length} produktów w
//             koszyku:
//           </p>
//           <ul className="list-disc ml-5 mt-2">
//             {alreadyOwnedProducts.map((item) => (
//               <li key={item._id} className="text-yellow-600">
//                 {item.title}
//               </li>
//             ))}
//           </ul>
//           <p className="text-sm text-yellow-600 mt-2">
//             Możesz kontynuować, ale zostaną one ponownie dodane do Twojego
//             konta.
//           </p>
//           <button
//             onClick={() => navigate("/user/orders")}
//             className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
//           >
//             Zobacz moje zamówienia
//           </button>
//         </div>

//         <CartContent
//           items={items}
//           handleRemoveItem={handleRemoveItem}
//           handleClearCart={handleClearCart}
//           handleQuantityChange={handleQuantityChange}
//           handleCheckout={handleCheckout}
//           navigate={navigate}
//           user={user} // 👈 Przekaż użytkownika
//         />
//       </div>
//     );
//   }

//   // Normalny koszyk - działa dla wszystkich
//   return (
//     <CartContent
//       items={items}
//       handleRemoveItem={handleRemoveItem}
//       handleClearCart={handleClearCart}
//       handleQuantityChange={handleQuantityChange}
//       handleCheckout={handleCheckout}
//       navigate={navigate}
//       user={user} // 👈 Przekaż użytkownika
//     />
//   );
// };

// interface CartContentProps {
//   items: any[];
//   handleRemoveItem: (productId: string) => void;
//   handleClearCart: () => void;
//   handleQuantityChange: (productId: string, newQuantity: number) => void;
//   handleCheckout: () => void;
//   navigate: (path: string) => void;
//   user: any | null; // 👈 Dodaj user do props
// }

// const CartContent: React.FC<CartContentProps> = ({
//   items,
//   handleRemoveItem,
//   handleClearCart,
//   handleQuantityChange,
//   handleCheckout,
//   navigate,
//   user, // 👈 Odbierz user
// }) => {
//   const calculateTotal = () => {
//     return items.reduce(
//       (total, item) => total + item.price * (item.quantity || 1),
//       0,
//     );
//   };

//   if (items.length === 0) {
//     return (
//       <div className="text-center py-8">
//         <h2 className="text-2xl font-bold mb-4">Twój koszyk</h2>
//         <p className="text-gray-600 mb-4">Twój koszyk jest pusty</p>
//         <button
//           onClick={() => navigate("/products")}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Przeglądaj produkty
//         </button>
//       </div>
//     );
//   }

//   const total = calculateTotal();

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-6">Twój koszyk</h2>

//       {/* Lista produktów */}
//       <div className="bg-white rounded-lg shadow p-4 mb-6">
//         <div className="space-y-4">
//           {items.map((item) => (
//             <div
//               key={item._id}
//               className="flex items-center justify-between border-b pb-4"
//             >
//               <div className="flex items-center space-x-4">
//                 {item.imageUrl && (
//                   <img
//                     src={item.imageUrl}
//                     alt={item.title}
//                     className="w-20 h-20 object-cover rounded"
//                   />
//                 )}
//                 <div>
//                   <h3 className="font-semibold">{item.title}</h3>
//                   <p className="text-gray-600">{item.price} PLN</p>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-4">
//                 {/* Zmiana ilości */}
//                 <div className="flex items-center border rounded">
//                   <button
//                     onClick={() =>
//                       handleQuantityChange(item._id, (item.quantity || 1) - 1)
//                     }
//                     className="px-3 py-1 hover:bg-gray-100"
//                     disabled={(item.quantity || 1) <= 1}
//                   >
//                     -
//                   </button>
//                   <span className="px-3 py-1">{item.quantity || 1}</span>
//                   <button
//                     onClick={() =>
//                       handleQuantityChange(item._id, (item.quantity || 1) + 1)
//                     }
//                     className="px-3 py-1 hover:bg-gray-100"
//                   >
//                     +
//                   </button>
//                 </div>

//                 {/* Suma za produkt */}
//                 <div className="text-right min-w-[100px]">
//                   <p className="font-semibold">
//                     {item.price * (item.quantity || 1)} PLN
//                   </p>
//                 </div>

//                 {/* Przycisk usuń */}
//                 <button
//                   onClick={() => handleRemoveItem(item._id)}
//                   className="text-red-500 hover:text-red-700 p-2"
//                   title="Usuń produkt"
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                     />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Podsumowanie */}
//         <div className="mt-6 pt-4 border-t">
//           <div className="flex justify-between text-lg font-bold">
//             <span>Razem:</span>
//             <span>{total.toFixed(2)} PLN</span>
//           </div>
//         </div>
//       </div>

//       {/* Przyciski akcji */}
//       <div className="flex flex-col sm:flex-row gap-4 justify-between">
//         <div className="flex gap-4">
//           <button
//             onClick={() => navigate("/products")}
//             className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
//           >
//             ← Kontynuuj zakupy
//           </button>

//           <button
//             onClick={handleClearCart}
//             className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//           >
//             🗑️ Wyczyść koszyk
//           </button>
//         </div>

//         <button
//           onClick={handleCheckout}
//           className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold flex items-center justify-center"
//         >
//           {user
//             ? "Przejdź do podsumowania zamówienia"
//             : "Zaloguj się i kontynuuj"}
//           <svg
//             className="ml-2 w-5 h-5"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M14 5l7 7m0 0l-7 7m7-7H3"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Informacje - pokaż inną wiadomość dla niezalogowanych */}
//       <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-4">
//         <h3 className="font-semibold text-blue-800 mb-2">Informacje</h3>
//         <ul className="text-sm text-blue-700 space-y-1">
//           <li>
//             • Możesz zmieniać ilość produktów korzystając z przycisków +/-
//           </li>
//           <li>• Aby usunąć pojedynczy produkt, użyj ikony kosza</li>
//           <li>• Koszyk jest zapisywany lokalnie - działa bez logowania</li>
//           {!user && (
//             <li className="font-semibold text-blue-800">
//               • Aby sfinalizować zakup, musisz się zalogować lub zarejestrować
//             </li>
//           )}
//           <li>• Po zalogowaniu koszyk zostanie powiązany z Twoim kontem</li>
//           <li>• Po przejściu do płatności możesz zastosować kupon rabatowy</li>
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default Cart;
