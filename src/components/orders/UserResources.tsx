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

  // 🔹 Połącz wszystkie zasoby z zamówień w jedną tablicę
  const allResources = userOrders.flatMap((order) => order.userResources || []);

  // 🔹 Usuń duplikaty po _id, aby każdy zasób pojawił się tylko raz
  const uniqueResources = allResources.filter(
    (res, index, self) => index === self.findIndex((r) => r._id === res._id)
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Panel użytkownika</h2>

      {/* 🔹 SEKCJA ZAMÓWIEŃ */}
      {/* <section className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Twoje zamówienia</h3>

        {userOrders.length === 0 ? (
          <p>Nie masz jeszcze żadnych zamówień.</p>
        ) : (
          userOrders.map((order) => (
            <div
              key={order._id}
              className="p-4 mb-3 border border-gray-300 rounded-xl"
            >
              <p>
                <strong>ID zamówienia:</strong> {order._id}
              </p>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(order.createdAt).toLocaleDateString("pl-PL")}
              </p>
              <p>
                <strong>Kwota:</strong> {order.amount / 100} zł
              </p>

              {order.userResources && order.userResources.length > 0 ? (
                <div className="mt-3">
                  <p className="font-semibold">Zasoby w tym zamówieniu:</p>
                  <ul className="list-disc ml-5">
                    {order.userResources.map((r) => (
                      <li key={r._id}>{r.title}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  Brak zasobów w tym zamówieniu.
                </p>
              )}
            </div>
          ))
        )}
      </section> */}

      {/* 🔹 SEKCJA ZASOBÓW */}
      <section>
        {uniqueResources.length === 0 ? (
          <p>Nie masz jeszcze żadnych zasobów.</p>
        ) : (
          uniqueResources.map((resource) => (
            <div
              key={resource._id}
              className="p-4 mb-4 border border-gray-300 rounded-xl"
            >
              <h3 className="font-bold text-lg">{resource.title}</h3>
              <p className="text-gray-700">{resource.description}</p>

              {resource.chapters && resource.chapters.length > 0 && (
                <div className="mt-3">
                  <ul className="list-disc ml-6 mt-1">
                    {resource.chapters.map((chapter, idx) => (
                      <li key={idx} className="mb-1">
                        <h4 className="font-medium">{chapter.title}</h4>
                        {chapter.content && (
                          <p className="text-sm text-gray-600">
                            {chapter.content}
                          </p>
                        )}
                        {chapter.videoUrl && (
                          <a
                            href={chapter.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline text-sm"
                          >
                            Zobacz wideo
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default UserResources;
