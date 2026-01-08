import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "../../store/slices/orderSlice";
import { useEffect } from "react";
import type { AppDispatch, RootState } from "../../store";
import type { Order } from "../../store/slices/orderSlice";

const AdminFinancials: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allOrders, loading, error } = useSelector(
    (state: RootState) => state.orders
  );

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  if (loading)
    return <p className="text-center py-4">Ładowanie danych finansowych...</p>;
  if (error)
    return <p className="text-red-500 text-center py-4">Błąd: {error}</p>;
  if (!allOrders || allOrders.length === 0)
    return <p className="text-center py-4">Brak zamówień</p>;

  // Funkcja pomocnicza do uzyskania ceny produktu
  const getProductPrice = (productItem: any): number => {
    if (productItem.product && typeof productItem.product === "object") {
      // Stara struktura
      return productItem.product.price || 0;
    } else {
      // Nowa struktura
      return productItem.price || 0;
    }
  };

  // Funkcja pomocnicza do uzyskania tytułu produktu
  const getProductTitle = (productItem: any): string => {
    if (productItem.product && productItem.product.title) {
      return productItem.product.title;
    } else if (productItem.title) {
      return productItem.title;
    }
    return "Unknown Product";
  };

  // 🔹 Oblicz przychody z uwzględnieniem refundów całkowitych i częściowych
  const calculateOrderValue = (order: Order): number => {
    return order.products.reduce((sum, item) => {
      const price = getProductPrice(item);
      const quantity = item.quantity || 1;
      const refundQuantity = item.refundQuantity || 0;

      // Oblicz wartość niezwróconych sztuk
      const nonRefundedQuantity = Math.max(0, quantity - refundQuantity);
      return sum + price * nonRefundedQuantity;
    }, 0);
  };

  const calculateOriginalOrderValue = (order: Order): number => {
    return order.products.reduce((sum, item) => {
      const price = getProductPrice(item);
      const quantity = item.quantity || 1;
      return sum + price * quantity;
    }, 0);
  };

  // Oblicz wszystkie przychody
  const totalRevenue = allOrders.reduce((sum, order) => {
    return sum + calculateOrderValue(order);
  }, 0);

  const originalRevenue = allOrders.reduce((sum, order) => {
    return sum + calculateOriginalOrderValue(order);
  }, 0);

  const totalRefunds = originalRevenue - totalRevenue;

  // 🔹 Statystyki zamówień
  const ordersByStatus = {
    paid: allOrders.filter((o) => o.status === "paid" && !o.refundedAt).length,
    pending: allOrders.filter((o) => o.status === "pending").length,
    refunded: allOrders.filter((o) => o.status === "refunded" || o.refundedAt)
      .length,
    partially_refunded: allOrders.filter(
      (o) => o.status === "partially_refunded"
    ).length,
    failed: allOrders.filter((o) => o.status === "failed").length,
    canceled: allOrders.filter((o) => o.status === "canceled").length,
  };

  // 🔹 Przychody miesięczne
  const monthlyRevenue: Record<string, number> = {};
  allOrders.forEach((order) => {
    const date = new Date(order.paidAt || order.createdAt);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    monthlyRevenue[monthKey] =
      (monthlyRevenue[monthKey] || 0) + calculateOrderValue(order);
  });

  // Posortuj miesiące
  const sortedMonths = Object.keys(monthlyRevenue).sort().reverse().slice(0, 6); // Ostatnie 6 miesięcy

  // 🔹 Top produkty
  const productSales: Record<
    string,
    { title: string; revenue: number; sales: number; refunds: number }
  > = {};
  allOrders.forEach((order) => {
    order.products.forEach((item) => {
      const title = getProductTitle(item);
      const price = getProductPrice(item);
      const quantity = item.quantity || 1;
      const refundQuantity = item.refundQuantity || 0;
      const soldQuantity = quantity - refundQuantity;

      if (!productSales[title]) {
        productSales[title] = { title, revenue: 0, sales: 0, refunds: 0 };
      }

      productSales[title].revenue += price * soldQuantity;
      productSales[title].sales += soldQuantity;
      productSales[title].refunds += refundQuantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📊 Panel finansowy
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <h3 className="text-lg font-semibold text-green-700">
            Aktualne przychody
          </h3>
          <p className="text-3xl font-bold text-green-800">
            {totalRevenue.toFixed(2)} zł
          </p>
          <p className="text-sm text-green-600 mt-1">
            Po odjęciu zwrotów ({totalRefunds.toFixed(2)} zł)
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-700">
            Łączna sprzedaż
          </h3>
          <p className="text-3xl font-bold text-blue-800">
            {originalRevenue.toFixed(2)} zł
          </p>
          <p className="text-sm text-blue-600 mt-1">Przed odjęciem zwrotów</p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <h3 className="text-lg font-semibold text-red-700">Łączne zwroty</h3>
          <p className="text-3xl font-bold text-red-800">
            {totalRefunds.toFixed(2)} zł
          </p>
          <p className="text-sm text-red-600 mt-1">Całkowite i częściowe</p>
        </div>
      </div>

      {/* Statusy zamówień */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">
          Statusy zamówień
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>
              Opłacone: <strong>{ordersByStatus.paid}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>
              Oczekujące: <strong>{ordersByStatus.pending}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>
              Zwroty: <strong>{ordersByStatus.refunded}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>
              Częściowe zwroty:{" "}
              <strong>{ordersByStatus.partially_refunded}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>
              Anulowane: <strong>{ordersByStatus.canceled}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <span>
              Nieudane: <strong>{ordersByStatus.failed}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Top produkty */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">
          🏆 Top 5 produktów
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Produkt
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Przychód
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Sprzedaż
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Zwroty
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProducts.map((product, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {product.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-semibold">
                    {product.revenue.toFixed(2)} zł
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {product.sales} szt.
                  </td>
                  <td className="px-4 py-3 text-sm text-red-600">
                    {product.refunds} szt.
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Przychody miesięczne */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">
          📈 Przychody miesięczne
        </h3>
        <div className="space-y-3">
          {sortedMonths.map((month) => {
            const [year, monthNum] = month.split("-");
            const monthNames = [
              "Sty",
              "Lut",
              "Mar",
              "Kwi",
              "Maj",
              "Cze",
              "Lip",
              "Sie",
              "Wrz",
              "Paź",
              "Lis",
              "Gru",
            ];
            const monthName = monthNames[parseInt(monthNum) - 1];

            return (
              <div key={month} className="flex items-center justify-between">
                <span className="text-gray-700">
                  {monthName} {year}
                </span>
                <span className="font-semibold text-green-600">
                  {monthlyRevenue[month].toFixed(2)} zł
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista wszystkich zamówień */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">
          📋 Wszystkie zamówienia ({allOrders.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Data
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Klient
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Produkty
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Wartość
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allOrders.map((order) => {
                const orderValue = calculateOrderValue(order);
                const originalValue = calculateOriginalOrderValue(order);
                const refundAmount = originalValue - orderValue;

                return (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(
                        order.paidAt || order.createdAt
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {order.user?.email || "Brak email"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {order.products.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="truncate max-w-xs">
                          {getProductTitle(item)} × {item.quantity || 1}
                          {item.refundQuantity && item.refundQuantity > 0 && (
                            <span className="text-red-500 text-xs ml-1">
                              (zwrócono {item.refundQuantity})
                            </span>
                          )}
                        </div>
                      ))}
                      {order.products.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{order.products.length - 2} więcej
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-semibold text-gray-900">
                        {orderValue.toFixed(2)} zł
                      </div>
                      {refundAmount > 0 && (
                        <div className="text-xs text-red-500">
                          -{refundAmount.toFixed(2)} zł zwrot
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          order.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                        ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : ""
                        }
                        ${
                          order.status === "refunded"
                            ? "bg-red-100 text-red-800"
                            : ""
                        }
                        ${
                          order.status === "partially_refunded"
                            ? "bg-orange-100 text-orange-800"
                            : ""
                        }
                        ${
                          order.status === "failed"
                            ? "bg-gray-100 text-gray-800"
                            : ""
                        }
                        ${
                          order.status === "canceled"
                            ? "bg-gray-100 text-gray-800"
                            : ""
                        }
                      `}
                      >
                        {order.status === "paid" && "Opłacone"}
                        {order.status === "pending" && "Oczekujące"}
                        {order.status === "refunded" && "Zwrócone"}
                        {order.status === "partially_refunded" &&
                          "Częściowo zwrócone"}
                        {order.status === "failed" && "Nieudane"}
                        {order.status === "canceled" && "Anulowane"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFinancials;

// import { useDispatch, useSelector } from "react-redux";
// import { fetchAllOrders } from "../../store/slices/orderSlice";
// import { useEffect } from "react";
// import type { AppDispatch, RootState } from "../../store";

// const AdminFinancials: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { allOrders, loading } = useSelector(
//     (state: RootState) => state.orders
//   );

//   useEffect(() => {
//     dispatch(fetchAllOrders());
//   }, [dispatch]);

//   if (loading) return <p>Ładowanie danych finansowych...</p>;

//   // 🔹 Oblicz przychody z uwzględnieniem refundów
//   const totalRevenue = allOrders.reduce((sum, order) => {
//     //console.log("Calculating order:", order, "sum", sum);
//     const orderValue = order.products.reduce((s, p) => {
//       //console.log("s", s, "p", p);
//       return s + p.product.price * (p.quantity || 1);
//     }, 0);
//     // jeśli zamówienie zostało zrefundowane, odejmij jego wartość
//     return sum + (order.refundedAt ? -orderValue : orderValue);
//   }, 0);

//   // 🔹 Liczba zwróconych i aktywnych zamówień
//   const refundedCount = allOrders.filter((o) => o.refundedAt).length;
//   const activeCount = allOrders.length - refundedCount;

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-4 text-indigo-700">
//         💰 Zestawienie finansowe
//       </h2>

//       <div className="mb-6">
//         <p className="text-lg font-semibold">
//           Łączny przychód:{" "}
//           <span
//             className={`${
//               totalRevenue >= 0 ? "text-green-600" : "text-red-600"
//             }`}
//           >
//             {totalRevenue.toFixed(2)} zł
//           </span>
//         </p>
//         <p className="text-gray-600">
//           Aktywne zamówienia: <strong>{activeCount}</strong> | Zwroty:{" "}
//           <strong>{refundedCount}</strong>
//         </p>
//       </div>

//       <ul className="space-y-3">
//         {allOrders.map((order) => {
//           const orderValue = order.products.reduce(
//             (s, p) => s + p.product.price * (p.quantity || 1),
//             0
//           );

//           return (
//             <li
//               key={order._id}
//               className={`p-4 border rounded-md ${
//                 order.refundedAt
//                   ? "bg-red-50 border-red-200 text-red-700"
//                   : "bg-green-50 border-green-200 text-gray-800"
//               }`}
//             >
//               <div className="flex justify-between">
//                 <span>
//                   📅 {new Date(order.createdAt).toLocaleDateString()} —{" "}
//                   {order.products
//                     .map((p) => `${p.product.title} (${p.product.price} zł)`)
//                     .join(", ")}
//                 </span>
//                 <span className="font-semibold">
//                   {order.refundedAt ? "-" : "+"}
//                   {orderValue.toFixed(2)} zł
//                 </span>
//               </div>

//               {order.refundedAt && (
//                 <p className="text-sm mt-1">
//                   💸 Zwrot z dnia{" "}
//                   {new Date(order.refundedAt).toLocaleDateString()}
//                 </p>
//               )}
//             </li>
//           );
//         })}
//       </ul>
//     </div>
//   );
// };

// export default AdminFinancials;
