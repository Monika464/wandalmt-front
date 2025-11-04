import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../store/slices/orderSlice";
import type { AppDispatch, RootState } from "../../store";

const UserResources: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userOrders, loading } = useSelector(
    (state: RootState) => state.orders
  );

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  if (loading) return <p>Ładowanie zasobów...</p>;

  return (
    <div>
      <h2>Twoje zakupione zasoby</h2>
      {userOrders.map((order) =>
        order.products.map((item, i) => (
          <div key={`${order._id}-${i}`} className="p-3 border-b">
            <h3>{item.product.title}</h3>
            <p>Data zakupu: {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default UserResources;
