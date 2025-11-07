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
      <h2 className="text-xl font-semibold mb-4">Twoje zakupione zasoby</h2>

      {userOrders.length === 0 ? (
        <p>Nie masz jeszcze żadnych zasobów.</p>
      ) : (
        userOrders.map((order) => (
          <div key={order._id} className="p-3 border-b border-gray-300">
            {/* <h3 className="font-bold mb-2">Zamówienie: {order._id}</h3> */}

            {/* 🔹 Wyświetlenie produktów tylko jeśli są zasoby */}
            {order.userResources &&
              order.userResources.length > 0 &&
              order.products.map((item, i) => (
                <div key={i} className="mb-4">
                  <p className="font-semibold">{item.product.title}</p>
                </div>
              ))}

            {/* 🔹 Wyświetlenie zasobów użytkownika */}
            {order.userResources && order.userResources.length > 0 ? (
              <div className="mt-3">
                <h4 className="font-semibold">Zasoby użytkownika:</h4>
                {order.userResources.map((resource) => (
                  <div key={resource._id} className="mt-2">
                    <p className="font-bold">{resource.title}</p>
                    <p>{resource.description}</p>

                    {resource.chapters?.length > 0 && (
                      <div className="mt-2">
                        <strong>Rozdziały:</strong>
                        {resource.chapters.map((chapter, idx) => (
                          <div key={idx} className="ml-4">
                            <p>- {chapter.title}</p>
                            {chapter.content && <p>{chapter.content}</p>}
                            {chapter.videoUrl && (
                              <a
                                href={chapter.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                              >
                                Zobacz wideo
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Brak zasobów przypisanych do konta.
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default UserResources;

// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchUserOrders } from "../../store/slices/orderSlice";
// import type { AppDispatch, RootState } from "../../store";
// import { fetchProductById } from "../../store/slices/productPublicSlice";
// import { fetchResourceByProductId } from "../../store/slices/resourcePublicSlice";

// const UserResources: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();

//   const { userOrders, loading: ordersLoading } = useSelector(
//     (state: RootState) => state.orders
//   );

//   const { resourcesByProductId, loading: resourcesLoading } = useSelector(
//     (state: RootState) => state.resources
//   );

//   useEffect(() => {
//     dispatch(fetchUserOrders());
//   }, [dispatch]);

//   useEffect(() => {
//     if (userOrders.length > 0) {
//       userOrders.forEach((order) => {
//         order.products.forEach((item) => {
//           dispatch(fetchResourceByProductId(item.product._id));
//         });
//       });
//     }
//   }, [dispatch, userOrders]);

//   if (ordersLoading || resourcesLoading) return <p>Ładowanie zasobów...</p>;

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Twoje zakupione zasoby</h2>

//       {userOrders.length === 0 ? (
//         <p>Nie masz jeszcze żadnych zasobów.</p>
//       ) : (
//         userOrders.map((order) =>
//           order.products.map((item, i) => {
//             const resource = resourcesByProductId[item.product._id];
//             //console.log("resource", resource);

//             return (
//               <div
//                 key={`${order._id}-${i}`}
//                 className="p-3 border-b border-gray-300"
//               >
//                 <h3 className="font-bold">{item.product.title}</h3>

//                 {resource ? (
//                   <div className="mt-2">
//                     <h3 className="font-bold">{resource.title}</h3>
//                     <p>
//                       <strong>Opis zasobu:</strong> {resource.description}
//                     </p>
//                     {resource.chapters && resource.chapters.length > 0 && (
//                       <div className="mt-2">
//                         <strong>Rozdziały:</strong>
//                         {resource.chapters.map((chapter, idx) => (
//                           <p key={idx}>
//                             {chapter.title}
//                             {chapter.content}
//                             {chapter.videoUrl}
//                           </p>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 italic">Ładowanie zasobu...</p>
//                 )}
//               </div>
//             );
//           })
//         )
//       )}
//     </div>
//   );
// };

// export default UserResources;
