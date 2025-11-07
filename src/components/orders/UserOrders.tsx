import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../store/slices/orderSlice";
//import { fetchResourceByProductId } from "../../store/slices/resourceSlice";
import type { AppDispatch, RootState } from "../../store";
import { useEffect } from "react";
import RefundButton from "./RefundButton";

const UserOrders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    userOrders,
    loading: ordersLoading,
    error: ordersError,
  } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  if (ordersLoading) return <p>⏳ Ładowanie danych...</p>;
  if (ordersError) return <p>❌ Błąd: {ordersError}</p>;

  // const handleRefund = (orderId: string) => {
  //   console.log("Zwrot dla zamówienia:", orderId);
  //   // dispatch(refundOrder(orderId))
  // };

  if (ordersLoading) return <p>Ładowanie zamówień...</p>;
  if (ordersError) return <p>Błąd: {ordersError}</p>;

  return (
    <div>
      <h2>Twoje zamówienia</h2>
      {userOrders.map((order) => (
        <div key={order._id} className="p-3 border rounded mb-4 shadow-sm">
          <p className="text-gray-700">
            <strong>Data:</strong> {new Date(order.createdAt).toLocaleString()}
          </p>

          {order.products.map((item, i) => (
            <div
              key={i}
              className="mt-3 p-3 border-t border-gray-300 bg-gray-50 rounded"
            >
              <p>Tytuł: {item.product.title}</p>
              <p>Wartość: {item.product.price} zł</p>
              <RefundButton orderId={order._id} />
              {/* <button onClick={() => handleRefund(order._id)}>Zwrot</button> */}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default UserOrders;
