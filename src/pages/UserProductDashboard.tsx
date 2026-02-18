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

  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const purchasedProducts = React.useMemo(() => {
    if (!userOrders || userOrders.length === 0) return [];

    const activeOrders = userOrders.filter(
      (order) =>
        order.status === "paid" || order.status === "partially_refunded",
    );

    const allProducts: any[] = [];
    const productIds = new Set();

    activeOrders.forEach((order) => {
      if (order.products && Array.isArray(order.products)) {
        order.products.forEach((item) => {
          const refundQuantity = item.refundQuantity || 0;
          const isFullyRefunded = refundQuantity >= item.quantity;

          if (isFullyRefunded) return;

          // 🔥 POPRAWA: item jest już produktem, nie ma pola product!
          const productId = item.productId?.toString();

          if (productId && !productIds.has(productId)) {
            productIds.add(productId);
            allProducts.push({
              id: productId,
              title: item.title,
              imageUrl: item.imageUrl || "/placeholder-product.png",
              description: item.description || "",
              purchasedDate: order.createdAt,
              chapters: [], // chapters będą dostępne w osobnym zapytaniu
              isPartiallyRefunded:
                refundQuantity > 0 && refundQuantity < item.quantity,
              refundedQuantity: refundQuantity,
              originalQuantity: item.quantity,
            });
          }
        });
      }
    });

    return allProducts;
  }, [userOrders]);

  const handleProductClick = (productId: string) => {
    navigate(`/user/products/${productId}`);
  };

  // 🔥 1. Sprawdź czy użytkownik jest zalogowany
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
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Zaloguj się
          </button>
        </div>
      </div>
    );
  }

  // 🔥 2. Stan ładowania
  if (ordersLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 text-lg">Ładowanie Twoich produktów...</p>
          <p className="text-gray-400 text-sm mt-2">To może chwilę potrwać</p>
        </div>
      </div>
    );
  }

  // 🔥 3. Błąd
  if (ordersError) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            Wystąpił błąd
          </h2>
          <p className="text-red-600 mb-6">{ordersError}</p>
          <div className="space-x-4">
            <button
              onClick={() => dispatch(fetchUserOrders())}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Spróbuj ponownie
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Wróć na stronę główną
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 4. Brak produktów
  if (purchasedProducts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-white rounded-lg">
          <div className="text-blue-500 text-6xl mb-4">🛍️</div>
          <h2 className="text-2xl font-bold mb-4">
            Nie masz jeszcze żadnych produktów
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Przeglądaj naszą ofertę i znajdź coś dla siebie. Po zakupie produkty
            pojawią się tutaj.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
          >
            Przeglądaj produkty
          </button>
        </div>
      </div>
    );
  }

  // 🔥 5. Główny widok z produktami
  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Nagłówek z przyciskiem odświeżania */}
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Moje produkty</h1>
          <p className="text-gray-600">
            Kliknij na produkt, aby przejść do materiałów
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchUserOrders())}
          className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
          title="Odśwież"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </header>

      {/* Grid produktów */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {purchasedProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product.id)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:-translate-y-1"
          >
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
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow">
                  {product.chapters.length} rozdziałów
                </div>
              )}
              {product.isPartiallyRefunded && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow">
                  ⚠️ Zwrócono {product.refundedQuantity}/
                  {product.originalQuantity}
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {product.title}
              </h3>

              {product.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {product.description}
                </p>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100">
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(product.purchasedDate).toLocaleDateString("pl-PL")}
                </span>
                <span className="text-blue-500 font-medium flex items-center">
                  Otwórz
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statystyki */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Statystyki</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-blue-600">
              {purchasedProducts.length}
            </div>
            <div className="text-gray-600">Zakupione produkty</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-green-600">
              {purchasedProducts.reduce(
                (total, product) => total + (product.chapters?.length || 0),
                0,
              )}
            </div>
            <div className="text-gray-600">Łącznie rozdziałów</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
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

// // // components/dashboard/UserProductsDashboard.tsx

// // components/dashboard/UserProductsDashboard.tsx
// import React, { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import type { AppDispatch, RootState } from "../store";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchUserOrders } from "../store/slices/orderSlice";

// const UserProductsDashboard: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const {
//     userOrders,
//     loading: ordersLoading,
//     error: ordersError,
//   } = useSelector((state: RootState) => state.orders);

//   useEffect(() => {
//     dispatch(fetchUserOrders());
//   }, [dispatch]);

//   const navigate = useNavigate();
//   const { user } = useSelector((state: RootState) => state.auth);

//   const purchasedProducts = React.useMemo(() => {
//     if (!userOrders || userOrders.length === 0) return [];

//     const activeOrders = userOrders.filter(
//       (order) =>
//         order.status === "paid" || order.status === "partially_refunded",
//     );

//     const allProducts: any[] = [];
//     const productIds = new Set();

//     activeOrders.forEach((order) => {
//       if (order.products && Array.isArray(order.products)) {
//         order.products.forEach((item) => {
//           const refundQuantity = item.refundQuantity || 0;
//           const isFullyRefunded = refundQuantity >= item.quantity;

//           if (isFullyRefunded) return;

//           const product = item.product || item;
//           const productId = product.productId || product._id;

//           if (productId && !productIds.has(productId.toString())) {
//             productIds.add(productId.toString());
//             allProducts.push({
//               id: productId,
//               title: product.title,
//               imageUrl:
//                 product.imageUrl ||
//                 product.thumbnail ||
//                 "/placeholder-product.png",
//               description: product.description,
//               purchasedDate: order.createdAt,
//               chapters: product.chapters || [],
//               isPartiallyRefunded:
//                 refundQuantity > 0 && refundQuantity < item.quantity,
//               refundedQuantity: refundQuantity,
//               originalQuantity: item.quantity,
//             });
//           }
//         });
//       }
//     });

//     return allProducts;
//   }, [userOrders]);

//   const handleProductClick = (productId: string) => {
//     navigate(`/user/products/${productId}`);
//   };

//   // 🔥 1. Sprawdź czy użytkownik jest zalogowany
//   if (!user) {
//     return (
//       <div className="max-w-6xl mx-auto p-4">
//         <div className="text-center py-12">
//           <h2 className="text-2xl font-bold mb-4">Dostęp wymaga zalogowania</h2>
//           <p className="text-gray-600 mb-6">
//             Zaloguj się, aby zobaczyć zakupione produkty
//           </p>
//           <button
//             onClick={() => navigate("/login")}
//             className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//           >
//             Zaloguj się
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // 🔥 2. Stan ładowania
//   if (ordersLoading) {
//     return (
//       <div className="max-w-6xl mx-auto p-4">
//         <div className="flex flex-col items-center justify-center py-16">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
//           <p className="text-gray-600 text-lg">Ładowanie Twoich produktów...</p>
//           <p className="text-gray-400 text-sm mt-2">To może chwilę potrwać</p>
//         </div>
//       </div>
//     );
//   }

//   // 🔥 3. Błąd
//   if (ordersError) {
//     return (
//       <div className="max-w-6xl mx-auto p-4">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
//           <div className="text-red-500 text-5xl mb-4">⚠️</div>
//           <h2 className="text-2xl font-bold text-red-700 mb-4">
//             Wystąpił błąd
//           </h2>
//           <p className="text-red-600 mb-6">{ordersError}</p>
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

//   // 🔥 4. Brak produktów
//   if (purchasedProducts.length === 0) {
//     return (
//       <div className="max-w-6xl mx-auto p-4">
//         <div className="text-center py-16 bg-gradient-to-b from-blue-50 to-white rounded-lg">
//           <div className="text-blue-500 text-6xl mb-4">🛍️</div>
//           <h2 className="text-2xl font-bold mb-4">
//             Nie masz jeszcze żadnych produktów
//           </h2>
//           <p className="text-gray-600 mb-8 max-w-md mx-auto">
//             Przeglądaj naszą ofertę i znajdź coś dla siebie. Po zakupie produkty
//             pojawią się tutaj.
//           </p>
//           <button
//             onClick={() => navigate("/products")}
//             className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
//           >
//             Przeglądaj produkty
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // 🔥 5. Główny widok z produktami
//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       {/* Nagłówek z przyciskiem odświeżania */}
//       <header className="mb-8 flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Moje produkty</h1>
//           <p className="text-gray-600">
//             Kliknij na produkt, aby przejść do materiałów
//           </p>
//         </div>
//         <button
//           onClick={() => dispatch(fetchUserOrders())}
//           className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
//           title="Odśwież"
//         >
//           <svg
//             className="w-6 h-6"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
//             />
//           </svg>
//         </button>
//       </header>

//       {/* Grid produktów */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {purchasedProducts.map((product) => (
//           <div
//             key={product.id}
//             onClick={() => handleProductClick(product.id)}
//             className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:-translate-y-1"
//           >
//             <div className="relative h-48 bg-gray-100">
//               <img
//                 src={product.imageUrl}
//                 alt={product.title}
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   e.currentTarget.src = "/placeholder-product.png";
//                 }}
//               />
//               {product.chapters && product.chapters.length > 0 && (
//                 <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow">
//                   {product.chapters.length} rozdziałów
//                 </div>
//               )}
//               {product.isPartiallyRefunded && (
//                 <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full shadow">
//                   ⚠️ Zwrócono {product.refundedQuantity}/
//                   {product.originalQuantity}
//                 </div>
//               )}
//             </div>

//             <div className="p-4">
//               <h3 className="font-semibold text-lg mb-2 line-clamp-2">
//                 {product.title}
//               </h3>

//               {product.description && (
//                 <p className="text-gray-600 text-sm mb-3 line-clamp-3">
//                   {product.description}
//                 </p>
//               )}

//               <div className="flex justify-between items-center text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100">
//                 <span className="flex items-center">
//                   <svg
//                     className="w-4 h-4 mr-1"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//                     />
//                   </svg>
//                   {new Date(product.purchasedDate).toLocaleDateString("pl-PL")}
//                 </span>
//                 <span className="text-blue-500 font-medium flex items-center">
//                   Otwórz
//                   <svg
//                     className="w-4 h-4 ml-1"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 5l7 7-7 7"
//                     />
//                   </svg>
//                 </span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Statystyki */}
//       <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
//         <h2 className="text-xl font-semibold mb-4">Statystyki</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
//             <div className="text-3xl font-bold text-blue-600">
//               {purchasedProducts.length}
//             </div>
//             <div className="text-gray-600">Zakupione produkty</div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
//             <div className="text-3xl font-bold text-green-600">
//               {purchasedProducts.reduce(
//                 (total, product) => total + (product.chapters?.length || 0),
//                 0,
//               )}
//             </div>
//             <div className="text-gray-600">Łącznie rozdziałów</div>
//           </div>
//           <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
//             <div className="text-3xl font-bold text-purple-600">
//               {userOrders?.length || 0}
//             </div>
//             <div className="text-gray-600">Złożone zamówienia</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProductsDashboard;
