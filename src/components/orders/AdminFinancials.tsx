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

  const total = allOrders.reduce(
    (sum, order) =>
      sum +
      order.products.reduce((s, p) => s + p.product.price * p.quantity, 0),
    0
  );
  allOrders.map((order) =>
    console.log("order products in financials", order.user.createdAt)
  );

  return (
    <div>
      <h2>Zestawienie finansowe</h2>
      <p>Łączna kwota zakupów: {total.toFixed(2)} zł</p>
      <ul>
        {allOrders.map((order) => (
          <li key={order._id}>
            {new Date(order.createdAt).toLocaleDateString()} –{" "}
            {order.products
              .map((p) => `${p.product.title} (${p.product.price} zł)`)
              .join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminFinancials;
