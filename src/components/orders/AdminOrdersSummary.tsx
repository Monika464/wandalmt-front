import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "../../store/slices/orderSlice";
import type { AppDispatch, RootState } from "../../store";
import type { Order } from "../../store/slices/orderSlice";

const AdminOrdersSummary: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allOrders, loading, error } = useSelector(
    (state: RootState) => state.orders
  );

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  if (loading) return <p className="text-center py-4">Ładowanie zamówień...</p>;

  if (error)
    return <p className="text-red-500 text-center py-4">Błąd: {error}</p>;

  if (!allOrders || allOrders.length === 0) {
    return <p className="text-center py-4">Brak zamówień</p>;
  }

  console.log("All orders data:", allOrders); // Debug

  // 🔹 Grupowanie po produkcie z obsługą obu struktur
  const productMap = new Map<
    string,
    {
      title: string;
      buyers: {
        email: string;
        orderId: string;
        refunded: boolean;
        refundedAt?: string;
        refundQuantity?: number;
        quantity: number;
        purchasedAt: string;
      }[];
    }
  >();

  allOrders.forEach((order: Order) => {
    console.log(`Order ${order._id}:`, order.products); // Debug

    order.products.forEach((item: any) => {
      // Obsługa obu struktur danych
      let productTitle: string;
      let productId: string;

      if (item.product && typeof item.product === "object") {
        // Stara struktura: item.product.title
        productTitle = item.product.title || "Unknown Product";
        productId = item.product._id || "unknown";
      } else if (item.title) {
        // Nowa struktura: item.title
        productTitle = item.title || "Unknown Product";
        productId = item.productId || "unknown";
      } else {
        // Fallback
        productTitle = "Unknown Product";
        productId = "unknown";
        console.warn("Unknown product structure:", item);
      }

      const key = `${productId}_${productTitle}`; // Unikalny klucz
      const entry = productMap.get(key) || {
        title: productTitle,
        buyers: [],
      };

      // Sprawdź czy produkt jest częściowo zwrócony
      const refundQuantity = item.refundQuantity || 0;
      const isFullyRefunded = refundQuantity === item.quantity;
      const isPartiallyRefunded =
        refundQuantity > 0 && refundQuantity < item.quantity;

      entry.buyers.push({
        email: order.user?.email || "No email",
        orderId: order._id,
        refunded: !!order.refundedAt || isFullyRefunded,
        refundedAt: order.refundedAt
          ? new Date(order.refundedAt).toLocaleDateString()
          : isPartiallyRefunded
          ? `Częściowo zwrócono (${refundQuantity}/${item.quantity})`
          : undefined,
        refundQuantity: item.refundQuantity || 0,
        quantity: item.quantity || 1,
        purchasedAt: order.paidAt
          ? new Date(order.paidAt).toLocaleDateString()
          : new Date(order.createdAt).toLocaleDateString(),
      });

      productMap.set(key, entry);
    });
  });

  // Sortowanie produktów po liczbie kupujących
  const sortedProducts = [...productMap.values()].sort(
    (a, b) => b.buyers.length - a.buyers.length
  );

  // Statystyki
  const totalProducts = sortedProducts.length;
  const totalBuyers = sortedProducts.reduce(
    (sum, item) => sum + item.buyers.length,
    0
  );
  const refundedCount = sortedProducts.reduce(
    (sum, item) => sum + item.buyers.filter((b) => b.refunded).length,
    0
  );

  return (
    <div className="p-4">
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          📊 Podsumowanie sprzedaży
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-700">Produkty</h3>
            <p className="text-3xl font-bold text-blue-800">{totalProducts}</p>
            <p className="text-sm text-blue-600">różnych produktów</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700">Zakupy</h3>
            <p className="text-3xl font-bold text-green-800">{totalBuyers}</p>
            <p className="text-sm text-green-600">łącznych zakupów</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-700">Zwroty</h3>
            <p className="text-3xl font-bold text-red-800">{refundedCount}</p>
            <p className="text-sm text-red-600">zwróconych zakupów</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          📋 Zestawienie produktów i kupujących
        </h2>

        {sortedProducts.map((item, index) => {
          const uniqueBuyers = new Set(item.buyers.map((b) => b.email));
          const refundedBuyers = item.buyers.filter((b) => b.refunded).length;

          return (
            <div
              key={`${item.title}_${index}`}
              className="border border-gray-200 p-5 mb-5 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-xl text-gray-800">
                  {item.title}
                </h3>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{item.buyers.length}</span>{" "}
                  zakupów
                  {refundedBuyers > 0 && (
                    <span className="ml-2 text-red-600">
                      ({refundedBuyers} zwróconych)
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-3 text-sm text-gray-600">
                <span className="font-medium">Unikalnych kupujących:</span>{" "}
                {uniqueBuyers.size}
              </div>

              <ul className="space-y-3">
                {item.buyers.map((buyer, i) => (
                  <li
                    key={`${buyer.email}_${i}_${buyer.orderId}`}
                    className={`
                      p-3 rounded-lg border
                      ${
                        buyer.refunded
                          ? "bg-red-50 border-red-200 text-red-800"
                          : "bg-green-50 border-green-200 text-gray-800"
                      }
                    `}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="mb-2 sm:mb-0">
                        <div className="font-medium">{buyer.email}</div>
                        <div className="text-sm opacity-75">
                          Zamówienie: {buyer.orderId.substring(0, 8)}... |
                          Zakupiono: {buyer.purchasedAt} | Ilość:{" "}
                          {buyer.quantity} szt.
                        </div>
                      </div>

                      {buyer.refunded && (
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            💸 Zwrócono
                          </span>
                          {buyer.refundedAt && (
                            <span className="text-sm">{buyer.refundedAt}</span>
                          )}
                          {buyer.refundQuantity &&
                            buyer.refundQuantity < buyer.quantity && (
                              <span className="text-sm font-medium">
                                ({buyer.refundQuantity}/{buyer.quantity} szt.)
                              </span>
                            )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Informacja debugowa */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-medium">Informacje:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Zielone tło: zakupione produkty</li>
          <li>Czerwone tło: zwrócone produkty</li>
          <li>Każdy produkt może mieć wielu kupujących</li>
          <li>Możliwe częściowe zwroty (np. 1 z 2 sztuk)</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminOrdersSummary;

// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchAllOrders } from "../../store/slices/orderSlice";
// import type { AppDispatch, RootState } from "../../store";

// const AdminOrdersSummary: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { allOrders, loading } = useSelector(
//     (state: RootState) => state.orders
//   );

//   useEffect(() => {
//     dispatch(fetchAllOrders());
//   }, [dispatch]);

//   if (loading) return <p>Ładowanie zamówień...</p>;

//   // 🔹 Grupowanie po produkcie
//   const productMap = new Map<
//     string,
//     {
//       title: string;
//       buyers: { email: string; refunded: boolean; refundedAt?: string }[];
//     }
//   >();

//   allOrders.forEach((order) => {
//     order.products.forEach((item) => {
//       const key = item.product.title;
//       const entry = productMap.get(key) || { title: key, buyers: [] };

//       entry.buyers.push({
//         email: order.user.email,
//         refunded: !!order.refundedAt,
//         refundedAt: order.refundedAt
//           ? new Date(order.refundedAt).toLocaleDateString()
//           : undefined,
//       });

//       productMap.set(key, entry);
//     });
//   });

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">
//         📊 Zestawienie produktów i kupujących
//       </h2>
//       {[...productMap.values()].map((item) => (
//         <div
//           key={item.title}
//           className="border p-4 mb-4 rounded-lg shadow-sm bg-white"
//         >
//           <h3 className="font-semibold text-lg mb-2 text-indigo-700">
//             {item.title}
//           </h3>
//           <ul className="space-y-2">
//             {item.buyers.map((buyer, i) => (
//               <li
//                 key={i}
//                 className={`p-2 rounded ${
//                   buyer.refunded
//                     ? "bg-red-100 text-red-700 font-semibold flex items-center justify-between"
//                     : "bg-green-50 text-gray-800"
//                 }`}
//               >
//                 <span>{buyer.email}</span>
//                 {buyer.refunded && (
//                   <span className="text-sm flex items-center">
//                     💸 Zwrot: {buyer.refundedAt}
//                   </span>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default AdminOrdersSummary;

// // import { useEffect } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { fetchAllOrders } from "../../store/slices/orderSlice";
// // import type { AppDispatch, RootState } from "../../store";

// // const AdminOrdersSummary: React.FC = () => {
// //   const dispatch = useDispatch<AppDispatch>();
// //   const { allOrders, loading } = useSelector(
// //     (state: RootState) => state.orders
// //   );

// //   useEffect(() => {
// //     dispatch(fetchAllOrders());
// //   }, [dispatch]);

// //   if (loading) return <p>Ładowanie zamówień...</p>;

// //   // grupowanie po produkcie
// //   const productMap = new Map<string, { title: string; buyers: string[] }>();
// //   //console.log("allOrders", allOrders);
// //   allOrders.forEach((order) => {
// //     order.products.forEach((item) => {
// //       const key = item.product.title;
// //       const entry = productMap.get(key) || { title: key, buyers: [] };
// //       entry.buyers.push(order.user.email);
// //       productMap.set(key, entry);
// //     });
// //   });

// //   return (
// //     <div>
// //       <h2>Zestawienie produktów i kupujących</h2>
// //       {[...productMap.values()].map((item) => (
// //         <div key={item.title} className="border p-3 mb-2">
// //           <h3>{item.title}</h3>
// //           <ul>
// //             {item.buyers.map((buyer, i) => (
// //               <li key={i}>{buyer}</li>
// //             ))}
// //           </ul>
// //         </div>
// //       ))}
// //     </div>
// //   );
// // };

// // export default AdminOrdersSummary;
