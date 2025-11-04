import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "../../store/slices/orderSlice";
import type { AppDispatch, RootState } from "../../store";

const AdminOrdersSummary: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allOrders, loading } = useSelector(
    (state: RootState) => state.orders
  );

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  if (loading) return <p>Ładowanie zamówień...</p>;

  // grupowanie po produkcie
  const productMap = new Map<string, { title: string; buyers: string[] }>();
  console.log("allOrders", allOrders);
  allOrders.forEach((order) => {
    order.products.forEach((item) => {
      const key = item.product.title;
      const entry = productMap.get(key) || { title: key, buyers: [] };
      entry.buyers.push(order.user.email);
      productMap.set(key, entry);
    });
  });

  return (
    <div>
      <h2>Zestawienie produktów i kupujących</h2>
      {[...productMap.values()].map((item) => (
        <div key={item.title} className="border p-3 mb-2">
          <h3>{item.title}</h3>
          <ul>
            {item.buyers.map((buyer, i) => (
              <li key={i}>{buyer}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default AdminOrdersSummary;
