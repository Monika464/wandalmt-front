import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../store/slices/orderSlice";
import { fetchResourceByProductId } from "../../store/slices/resourceSlice";
import type { AppDispatch, RootState } from "../../store";
import { useEffect } from "react";

const UserOrders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const {
    userOrders,
    loading: ordersLoading,
    error: ordersError,
  } = useSelector((state: RootState) => state.orders);

  const { byProductId, loading: resourcesLoading } = useSelector(
    (state: RootState) => state.resources
  );

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  useEffect(() => {
    // Po pobraniu zamówień — pobierz zasoby do każdego produktu
    if (userOrders.length > 0) {
      userOrders.forEach((order) => {
        order.products.forEach((item) => {
          dispatch(fetchResourceByProductId(item.product._id));
        });
      });
    }
  }, [dispatch, userOrders]);

  if (ordersLoading || resourcesLoading) return <p>⏳ Ładowanie danych...</p>;
  if (ordersError) return <p>❌ Błąd: {ordersError}</p>;

  const handleRefund = (orderId: string) => {
    console.log("Zwrot dla zamówienia:", orderId);
    // dispatch(refundOrder(orderId))
  };

  if (ordersLoading) return <p>Ładowanie zamówień...</p>;
  if (ordersError) return <p>Błąd: {ordersError}</p>;

  return (
    // <div>
    //   <h2>Twoje zamówienia i zasoby</h2>
    //   {userOrders.map((order) => (
    //     <div key={order._id} className="p-3 border rounded mb-4 shadow-sm">
    //       <p className="text-gray-700">
    //         <strong>Data:</strong> {new Date(order.createdAt).toLocaleString()}
    //       </p>

    //       {order.products.map((item) => {
    //         const resources = byProductId[item.product._id] || [];

    //         return (
    //           <div
    //             key={item.product._id}
    //             className="mt-3 p-3 border-t border-gray-300 bg-gray-50 rounded"
    //           >
    //             <p>
    //               <strong>{item.product.title}</strong> — {item.product.price}{" "}
    //               zł
    //             </p>

    //             <h4 className="mt-2 text-sm text-gray-600">Zasoby:</h4>
    //             {resources.length > 0 ? (
    //               <ul className="list-disc pl-5">
    //                 {resources.map((res) => (
    //                   <li key={res._id}>{res.title}</li>
    //                 ))}
    //               </ul>
    //             ) : (
    //               <p className="text-gray-500">Brak przypisanych zasobów.</p>
    //             )}
    //           </div>
    //         );
    //       })}
    //     </div>
    //   ))}
    // </div>
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

              <button onClick={() => handleRefund(order._id)}>Zwrot</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default UserOrders;
