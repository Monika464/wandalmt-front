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

  // 🔹 Grupowanie po produkcie
  const productMap = new Map<
    string,
    {
      title: string;
      buyers: { email: string; refunded: boolean; refundedAt?: string }[];
    }
  >();

  allOrders.forEach((order) => {
    order.products.forEach((item) => {
      const key = item.product.title;
      const entry = productMap.get(key) || { title: key, buyers: [] };

      entry.buyers.push({
        email: order.user.email,
        refunded: !!order.refundedAt,
        refundedAt: order.refundedAt
          ? new Date(order.refundedAt).toLocaleDateString()
          : undefined,
      });

      productMap.set(key, entry);
    });
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        📊 Zestawienie produktów i kupujących
      </h2>
      {[...productMap.values()].map((item) => (
        <div
          key={item.title}
          className="border p-4 mb-4 rounded-lg shadow-sm bg-white"
        >
          <h3 className="font-semibold text-lg mb-2 text-indigo-700">
            {item.title}
          </h3>
          <ul className="space-y-2">
            {item.buyers.map((buyer, i) => (
              <li
                key={i}
                className={`p-2 rounded ${
                  buyer.refunded
                    ? "bg-red-100 text-red-700 font-semibold flex items-center justify-between"
                    : "bg-green-50 text-gray-800"
                }`}
              >
                <span>{buyer.email}</span>
                {buyer.refunded && (
                  <span className="text-sm flex items-center">
                    💸 Zwrot: {buyer.refundedAt}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
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

//   // grupowanie po produkcie
//   const productMap = new Map<string, { title: string; buyers: string[] }>();
//   //console.log("allOrders", allOrders);
//   allOrders.forEach((order) => {
//     order.products.forEach((item) => {
//       const key = item.product.title;
//       const entry = productMap.get(key) || { title: key, buyers: [] };
//       entry.buyers.push(order.user.email);
//       productMap.set(key, entry);
//     });
//   });

//   return (
//     <div>
//       <h2>Zestawienie produktów i kupujących</h2>
//       {[...productMap.values()].map((item) => (
//         <div key={item.title} className="border p-3 mb-2">
//           <h3>{item.title}</h3>
//           <ul>
//             {item.buyers.map((buyer, i) => (
//               <li key={i}>{buyer}</li>
//             ))}
//           </ul>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default AdminOrdersSummary;
