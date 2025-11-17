import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "../../store/slices/orderSlice";
import { useEffect } from "react";
import type { AppDispatch, RootState } from "../../store";

const AdminFinancials: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allOrders, loading } = useSelector(
    (state: RootState) => state.orders
  );

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  if (loading) return <p>Ładowanie danych finansowych...</p>;

  // 🔹 Oblicz przychody z uwzględnieniem refundów
  const totalRevenue = allOrders.reduce((sum, order) => {
    //console.log("Calculating order:", order, "sum", sum);
    const orderValue = order.products.reduce((s, p) => {
      //console.log("s", s, "p", p);
      return s + p.product.price * (p.quantity || 1);
    }, 0);
    // jeśli zamówienie zostało zrefundowane, odejmij jego wartość
    return sum + (order.refundedAt ? -orderValue : orderValue);
  }, 0);

  // 🔹 Liczba zwróconych i aktywnych zamówień
  const refundedCount = allOrders.filter((o) => o.refundedAt).length;
  const activeCount = allOrders.length - refundedCount;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-indigo-700">
        💰 Zestawienie finansowe
      </h2>

      <div className="mb-6">
        <p className="text-lg font-semibold">
          Łączny przychód:{" "}
          <span
            className={`${
              totalRevenue >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {totalRevenue.toFixed(2)} zł
          </span>
        </p>
        <p className="text-gray-600">
          Aktywne zamówienia: <strong>{activeCount}</strong> | Zwroty:{" "}
          <strong>{refundedCount}</strong>
        </p>
      </div>

      <ul className="space-y-3">
        {allOrders.map((order) => {
          const orderValue = order.products.reduce(
            (s, p) => s + p.product.price * (p.quantity || 1),
            0
          );

          return (
            <li
              key={order._id}
              className={`p-4 border rounded-md ${
                order.refundedAt
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-green-50 border-green-200 text-gray-800"
              }`}
            >
              <div className="flex justify-between">
                <span>
                  📅 {new Date(order.createdAt).toLocaleDateString()} —{" "}
                  {order.products
                    .map((p) => `${p.product.title} (${p.product.price} zł)`)
                    .join(", ")}
                </span>
                <span className="font-semibold">
                  {order.refundedAt ? "-" : "+"}
                  {orderValue.toFixed(2)} zł
                </span>
              </div>

              {order.refundedAt && (
                <p className="text-sm mt-1">
                  💸 Zwrot z dnia{" "}
                  {new Date(order.refundedAt).toLocaleDateString()}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AdminFinancials;
