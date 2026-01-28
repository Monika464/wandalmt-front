// components/dashboard/UserProductsDashboard.tsx
import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../store/slices/orderSlice";

const UserProductsDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    userOrders,
    loading: ordersLoading,
    error: ordersError,
  } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  // console.log("📦 UserOrders state:", {
  //   userOrders,
  //   ordersLoading,
  //   ordersError,
  // });

  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);
  //console.log("UserProductsDashboard - userOrders:", userOrders);

  const usetActiveOrders = userOrders?.filter(
    (order) => order.status === "paid",
  );

  //console.log("UserProductsDashboard - active orders:", usetActiveOrders);

  // Zbierz wszystkie unikalne produkty z zamówień
  const purchasedProducts = React.useMemo(() => {
    if (!usetActiveOrders || usetActiveOrders.length === 0) return [];

    const allProducts: any[] = [];
    const productIds = new Set(); // Aby uniknąć duplikatów

    usetActiveOrders.forEach((order) => {
      if (order.products && Array.isArray(order.products)) {
        order.products.forEach((item) => {
          const product = item.product || item;
          if (product && product._id && !productIds.has(product._id)) {
            productIds.add(product._id);
            allProducts.push({
              id: product.productId,
              title: product.title,
              imageUrl:
                product.imageUrl ||
                product.thumbnail ||
                "/placeholder-product.png",
              description: product.description,
              purchasedDate: order.createdAt,
              chapters: product.chapters || [],
            });
          }
        });
      }
    });

    return allProducts;
  }, [userOrders]);

  const handleProductClick = (productId: string) => {
    console.log("Navigating to product:", productId);
    navigate(`/user/products/${productId}`);
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Dostęp wymaga zalogowania</h2>
          <p className="text-gray-600 mb-6">
            Zaloguj się, aby zobaczyć zakupione produkty
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Zaloguj się
          </button>
        </div>
      </div>
    );
  }

  if (purchasedProducts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Twoje zakupione produkty</h2>
          <p className="text-gray-600 mb-6">
            Nie masz jeszcze żadnych zakupionych produktów
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Przeglądaj produkty
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Moje produkty</h1>
        <p className="text-gray-600">
          Kliknij na produkt, aby przejść do materiałów
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {purchasedProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product.id)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-200"
          >
            {/* Miniaturka produktu */}
            <div className="relative h-48 bg-gray-100">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-product.png";
                }}
              />
              {product.chapters && product.chapters.length > 0 && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  {product.chapters.length} rozdziałów
                </div>
              )}
            </div>

            {/* Informacje o produkcie */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {product.title}
              </h3>

              {product.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {product.description}
                </p>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  Zakupiono:{" "}
                  {new Date(product.purchasedDate).toLocaleDateString("pl-PL")}
                </span>
                <span className="text-blue-500 font-medium">Otwórz →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statystyki */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Statystyki</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-3xl font-bold text-blue-600">
              {purchasedProducts.length}
            </div>
            <div className="text-gray-600">Zakupione produkty</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-3xl font-bold text-green-600">
              {purchasedProducts.reduce(
                (total, product) => total + (product.chapters?.length || 0),
                0,
              )}
            </div>
            <div className="text-gray-600">Łącznie rozdziałów</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-3xl font-bold text-purple-600">
              {userOrders?.length || 0}
            </div>
            <div className="text-gray-600">Złożone zamówienia</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProductsDashboard;
