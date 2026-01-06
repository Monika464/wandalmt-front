import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../store/slices/orderSlice";
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

  if (!userOrders || userOrders.length === 0)
    return <p>Nie masz jeszcze żadnych zamówień.</p>;

  console.log("userOrders in UserOrders", userOrders);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Twoje zamówienia</h2>

      {userOrders.map((order) => (
        <div key={order._id} className="p-4 border rounded mb-6 shadow-sm">
          <p className="text-gray-700 mb-2">
            <strong>Data zamówienia:</strong>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>

          {order.products && order.products.length > 0 ? (
            order.products.map((item, i) => (
              <div
                key={i}
                className="mt-3 p-3 border-t border-gray-300 bg-gray-50 rounded"
              >
                <p className="font-semibold">{item.product.title}</p>
                <p>Cena: {item.product.price} zł</p>

                {/* ✅ Pokazuje informację o zwrocie lub przycisk */}
                {order.refundedAt ? (
                  <p className="text-red-600 font-semibold mt-2">
                    💸 Zwrot dokonany dnia:{" "}
                    {new Date(order.refundedAt).toLocaleDateString()}
                  </p>
                ) : (
                  <RefundButton orderId={order._id} />
                )}
              </div>
            ))
          ) : (
            <p className="italic text-gray-500 mt-2">
              Brak produktów w tym zamówieniu.
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserOrders;

// import { useDispatch, useSelector } from "react-redux";
// import { fetchUserOrders } from "../../store/slices/orderSlice";
// //import { fetchResourceByProductId } from "../../store/slices/resourceSlice";
// import type { AppDispatch, RootState } from "../../store";
// import { useEffect } from "react";
// import RefundButton from "./RefundButton";

// const UserOrders: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();

//   const {
//     userOrders,
//     loading: ordersLoading,
//     error: ordersError,
//   } = useSelector((state: RootState) => state.orders);

//   console.log("userOrders in UserOrders", userOrders[0].refundedAt);

//   useEffect(() => {
//     dispatch(fetchUserOrders());
//   }, [dispatch]);

//   if (ordersLoading) return <p>⏳ Ładowanie danych...</p>;
//   if (ordersError) return <p>❌ Błąd: {ordersError}</p>;

//   // const handleRefund = (orderId: string) => {
//   //   console.log("Zwrot dla zamówienia:", orderId);
//   //   // dispatch(refundOrder(orderId))
//   // };

//   if (ordersLoading) return <p>Ładowanie zamówień...</p>;
//   if (ordersError) return <p>Błąd: {ordersError}</p>;

//   return (
//     <div>
//       <h2>Twoje zamówienia</h2>
//       {userOrders.map((order) => (
//         <div key={order._id} className="p-3 border rounded mb-4 shadow-sm">
//           <p className="text-gray-700">
//             <strong>Data:</strong> {new Date(order.createdAt).toLocaleString()}
//           </p>

//           {order.products.map((item, i) => (
//             <div
//               key={i}
//               className="mt-3 p-3 border-t border-gray-300 bg-gray-50 rounded"
//             >
//               <p>Tytuł: {item.product.title}</p>
//               <p>Wartość: {item.product.price} zł</p>
//               {order.refundedAt ? (
//                 <p className="text-red-600 font-semibold">
//                   Zwrot dokonany dnia:{" "}
//                   {new Date(order.refundedAt).toLocaleDateString()}
//                 </p>
//               ) : (
//                 <RefundButton orderId={order._id} />
//               )}

//               {/* <button onClick={() => handleRefund(order._id)}>Zwrot</button> */}
//             </div>
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default UserOrders;
