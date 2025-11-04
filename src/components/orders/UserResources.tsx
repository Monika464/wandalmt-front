import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../store/slices/orderSlice";
import type { AppDispatch, RootState } from "../../store";
import { fetchProductById } from "../../store/slices/productPublicSlice";
import { fetchResourceByProductId } from "../../store/slices/resourcePublicSlice";

const UserResources: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { userOrders, loading: ordersLoading } = useSelector(
    (state: RootState) => state.orders
  );

  const { resourcesByProductId, loading: resourcesLoading } = useSelector(
    (state: RootState) => state.resources
  );

  // userOrders.forEach((order) => {
  //   console.log("Zamówienie ID:", order._id);
  //   order.products.forEach((item) => {
  //     console.log(" - Produkt:", item.product._id);

  //     dispatch(fetchResourceByProductId(item.product._id));
  //   });
  // });

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  useEffect(() => {
    if (userOrders.length > 0) {
      userOrders.forEach((order) => {
        order.products.forEach((item) => {
          dispatch(fetchResourceByProductId(item.product._id));
        });
      });
    }
  }, [dispatch, userOrders]);

  if (ordersLoading || resourcesLoading) return <p>Ładowanie zasobów...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Twoje zakupione zasoby</h2>

      {userOrders.length === 0 ? (
        <p>Nie masz jeszcze żadnych zasobów.</p>
      ) : (
        userOrders.map((order) =>
          order.products.map((item, i) => {
            const resource = resourcesByProductId[item.product._id];
            //console.log("resource", resource);

            return (
              <div
                key={`${order._id}-${i}`}
                className="p-3 border-b border-gray-300"
              >
                <h3 className="font-bold">{item.product.title}</h3>

                {resource ? (
                  <div className="mt-2">
                    <h3 className="font-bold">{resource.title}</h3>
                    <p>
                      <strong>Opis zasobu:</strong> {resource.description}
                    </p>
                    {resource.chapters && resource.chapters.length > 0 && (
                      <div className="mt-2">
                        <strong>Rozdziały:</strong>
                        {resource.chapters.map((chapter, idx) => (
                          <p key={idx}>
                            {chapter.title}
                            {chapter.content}
                            {chapter.videoUrl}
                          </p>
                        ))}
                        {/* <ul className="list-disc list-inside">
                          {resource.chapters.map((chapter, idx) => (
                            <li key={idx}>{chapter}</li>
                          ))}
                        </ul> */}
                      </div>
                    )}
                    {/* {resource.fileUrl && (
                      <a
                        href={resource.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        Pobierz zasób
                      </a>
                    )} */}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Ładowanie zasobu...</p>
                )}
              </div>
            );
          })
        )
      )}
    </div>
  );
};

export default UserResources;
