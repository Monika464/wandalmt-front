import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../store/slices/orderSlice";
import type { AppDispatch, RootState } from "../../store";
import { useEffect } from "react";

const UserOrders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userOrders, loading } = useSelector(
    (state: RootState) => state.orders
  );

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const handleRefund = (orderId: string) => {
    console.log("Zwrot dla zamówienia:", orderId);
    // dispatch(refundOrder(orderId))
  };

  if (loading) return <p>Ładowanie zamówień...</p>;

  return (
    <div>
      <h2>Twoje zamówienia</h2>
      {userOrders.map((order) => (
        <div key={order._id} className="p-3 border rounded mb-2">
          <p>
            <strong>Data:</strong>{" "}
            {new Date(order.user.createdAt).toLocaleString()}
          </p>
          {order.products.map((item, i) => (
            <div key={i}>
              <p>Tytuł: {item.product.title}</p>
              <p>Wartość: {item.product.price} zł</p>
              <button onClick={() => handleRefund(order._id)}>Zwrot</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default UserOrders;
