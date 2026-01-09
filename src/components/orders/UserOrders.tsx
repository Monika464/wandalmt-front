import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../store/slices/orderSlice";
import type { AppDispatch, RootState } from "../../store";
import { useEffect, useState } from "react";
import RefundButton from "./RefundButton";
import PartialRefundModal from "../products/PartialRefundModal"; // Jeśli masz komponent

const UserOrders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderForPartialRefund, setOrderForPartialRefund] = useState<
    string | null
  >(null);

  const {
    userOrders,
    loading: ordersLoading,
    error: ordersError,
  } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  // Funkcja do otwierania modala dla częściowego zwrotu
  const openPartialRefundModal = (orderId: string) => {
    setOrderForPartialRefund(orderId);
  };

  // Funkcja do zamykania modala
  const closePartialRefundModal = () => {
    setOrderForPartialRefund(null);
  };

  // Funkcja po udanym złożeniu wniosku o zwrot
  const handleRefundSubmitted = () => {
    closePartialRefundModal();
    // Odśwież listę zamówień
    dispatch(fetchUserOrders());
  };

  if (ordersLoading)
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Ładowanie zamówień...</span>
      </div>
    );

  if (ordersError)
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-700">❌ Błąd: {ordersError}</p>
        <button
          onClick={() => dispatch(fetchUserOrders())}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Spróbuj ponownie
        </button>
      </div>
    );

  if (!userOrders || userOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 text-lg mb-4">
          Nie masz jeszcze żadnych zamówień.
        </p>
        <button
          onClick={() => (window.location.href = "/products")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Przeglądaj produkty
        </button>
      </div>
    );
  }

  // Funkcja pomocnicza do uzyskania informacji o produkcie
  const getProductInfo = (item: any) => {
    if (item.product && typeof item.product === "object") {
      // Stara struktura: item.product
      return {
        title: item.product.title || "Nieznany produkt",
        price: item.product.price || 0,
        description: item.product.description || "",
        imageUrl: item.product.imageUrl || "",
      };
    } else {
      // Nowa struktura: płaskie pola
      return {
        title: item.title || "Nieznany produkt",
        price: item.price || 0,
        description: item.description || item.content || "",
        imageUrl: item.imageUrl || "",
      };
    }
  };

  const canRefundOrder = (order: any) => {
    console.log("🔍 Checking if order can be refunded:", {
      id: order._id,
      status: order.status,
      refundedAt: order.refundedAt,
      hasProductsToRefund: hasRefundableProducts(order),
    });

    // Nie można zwrócić jeśli całe zamówienie już zwrócone
    if (order.status === "refunded" || order.refundedAt) {
      console.log("❌ Order fully refunded or refundedAt exists");
      return false;
    }

    // Akceptuj tylko zamówienia które są opłacone lub częściowo zwrócone
    if (order.status !== "paid" && order.status !== "partially_refunded") {
      console.log("❌ Order status not suitable for refund");
      return false;
    }

    const purchaseDate = new Date(order.paidAt || order.createdAt);
    const now = new Date();
    const daysSincePurchase = Math.floor(
      (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const canRefund = daysSincePurchase <= 14;
    console.log(
      `📅 Days since purchase: ${daysSincePurchase}, Can refund: ${canRefund}`
    );

    return canRefund;
  };

  // Sprawdź czy można zwrócić zamówienie (do 14 dni od zakupu)
  // const canRefundOrder = (order: any) => {
  //    console.log("🔍 Checking if order can be refunded:", {
  //   id: order._id,
  //   status: order.status,
  //   refundedAt: order.refundedAt,
  //   hasProductsToRefund: hasRefundableProducts(order)
  // });
  //  //   if (order.status !== "paid") return false;
  //   if (order.refundedAt) return false;
  //   const purchaseDate = new Date(order.paidAt || order.createdAt);
  //   const now = new Date();
  //   const daysSincePurchase = Math.floor(
  //     (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
  //   );
  //   return daysSincePurchase <= 14;
  // };

  // Sprawdź czy zamówienie ma jakieś produkty do zwrotu
  const hasRefundableProducts = (order: any) => {
    return (
      order.products?.some((item: any) => {
        const refundQuantity = item.refundQuantity || 0;
        const quantity = item.quantity || 1;
        return quantity > refundQuantity;
      }) || false
    );
  };

  // Oblicz dni pozostałe do zwrotu
  const getRemainingRefundDays = (order: any) => {
    const purchaseDate = new Date(order.paidAt || order.createdAt);
    const now = new Date();
    const daysSincePurchase = Math.floor(
      (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, 14 - daysSincePurchase);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Twoje zamówienia
      </h2>

      {userOrders.map((order) => {
        const isExpanded = expandedOrder === order._id;
        const canRefund = canRefundOrder(order);
        const remainingDays = getRemainingRefundDays(order);
        const hasProductsToRefund = hasRefundableProducts(order);
        const isPartiallyRefunded =
          order.status === "partially_refunded" ||
          order.products?.some((item: any) => (item.refundQuantity || 0) > 0);

        return (
          <div
            key={order._id}
            className="mb-6 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            {/* Nagłówek zamówienia */}
            <div
              className={`p-4 cursor-pointer transition-colors ${
                isExpanded ? "bg-blue-100" : "bg-blue-50 hover:bg-blue-100"
              } ${order.refundedAt ? "bg-red-50" : ""}`}
              onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-lg">
                      Zamówienie #{order._id.substring(0, 8)}...
                    </h3>
                    {order.refundedAt && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        💸 Zwrócone
                      </span>
                    )}
                    {isPartiallyRefunded && !order.refundedAt && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        ⚠️ Częściowy zwrot
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">
                    Data: {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : order.status === "refunded"
                          ? "bg-red-100 text-red-800"
                          : order.status === "partially_refunded"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status === "paid" && "Opłacone"}
                      {order.status === "refunded" && "Zwrócone"}
                      {order.status === "partially_refunded" &&
                        "Częściowo zwrócone"}
                      {order.status === "pending" && "Oczekujące"}
                    </span>

                    {canRefund && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        🕐 Możliwość zwrotu: {remainingDays} dni
                      </span>
                    )}

                    {!canRefund &&
                      order.status === "paid" &&
                      remainingDays <= 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          ❌ Okres zwrotu minął
                        </span>
                      )}
                  </div>
                </div>

                <div className="mt-2 md:mt-0 flex items-center space-x-2">
                  {isExpanded ? (
                    <>
                      <span className="text-sm text-gray-600">
                        Kliknij aby zwinąć
                      </span>
                      <span className="text-lg font-bold text-gray-800">▲</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-gray-600">
                        Kliknij aby rozwinąć
                      </span>
                      <span className="text-lg font-bold text-gray-800">▼</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Rozwinięte szczegóły */}
            {isExpanded && (
              <div className="p-4">
                {/* Produkty */}
                {order.products && order.products.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Produkty w zamówieniu:
                    </h4>

                    {order.products.map((item: any, i: number) => {
                      const productInfo = getProductInfo(item);
                      const quantity = item.quantity || 1;
                      const refundQuantity = item.refundQuantity || 0;
                      const isRefunded = refundQuantity > 0;
                      const canRefundThisProduct = quantity > refundQuantity;

                      return (
                        <div
                          key={i}
                          className={`p-4 border rounded-lg ${
                            isRefunded
                              ? refundQuantity === quantity
                                ? "bg-red-50 border-red-200"
                                : "bg-orange-50 border-orange-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between">
                            <div className="mb-3 md:mb-0 flex-1">
                              <div className="flex items-start space-x-3">
                                {productInfo.imageUrl && (
                                  <img
                                    src={productInfo.imageUrl}
                                    alt={productInfo.title}
                                    className="w-16 h-16 object-cover rounded border flex-shrink-0"
                                  />
                                )}
                                <div>
                                  <p className="font-semibold text-gray-800 text-lg">
                                    {productInfo.title}
                                  </p>
                                  <div className="mt-2 space-y-1">
                                    <p className="text-gray-600">
                                      <span className="font-medium">
                                        {productInfo.price} zł
                                      </span>{" "}
                                      / szt.
                                    </p>
                                    <div className="flex items-center space-x-4">
                                      <p className="text-gray-600">
                                        Zakupiono:{" "}
                                        <span className="font-medium">
                                          {quantity} szt.
                                        </span>
                                      </p>
                                      {isRefunded && (
                                        <p
                                          className={`font-medium ${
                                            refundQuantity === quantity
                                              ? "text-red-600"
                                              : "text-orange-600"
                                          }`}
                                        >
                                          Zwrócono: {refundQuantity} szt.
                                        </p>
                                      )}
                                    </div>
                                    {canRefund && canRefundThisProduct && (
                                      <p className="text-green-600 text-sm font-medium">
                                        ✓ Można zwrócić:{" "}
                                        {quantity - refundQuantity} szt.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">
                                {(
                                  productInfo.price *
                                  (quantity - refundQuantity)
                                ).toFixed(2)}{" "}
                                zł
                              </div>
                              {isRefunded && (
                                <div className="mt-2">
                                  <p
                                    className={`text-sm ${
                                      refundQuantity === quantity
                                        ? "text-red-600"
                                        : "text-orange-600"
                                    }`}
                                  >
                                    Zwrot:{" "}
                                    {(
                                      productInfo.price * refundQuantity
                                    ).toFixed(2)}{" "}
                                    zł
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="italic text-gray-500">
                    Brak produktów w tym zamówieniu.
                  </p>
                )}

                {/* Sekcja zwrotów */}
                <div className="mt-8 pt-6 border-t">
                  {order.refundedAt ? (
                    <div className="bg-red-50 border border-red-200 rounded p-4">
                      <p className="text-red-700 font-medium">
                        💸 Zamówienie zostało zwrócone dnia:{" "}
                        {new Date(order.refundedAt).toLocaleDateString()}
                      </p>
                      {order.refundId && (
                        <p className="text-sm text-red-600 mt-1">
                          ID zwrotu: {order.refundId}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-2">
                        Środki zostały zwrócone na Twoją kartę płatniczą.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Informacja o okresie zwrotu */}
                      {canRefund ? (
                        <div className="bg-green-50 border border-green-200 rounded p-4">
                          <h4 className="font-semibold text-green-800 mb-2">
                            🕐 Możliwość zwrotu
                          </h4>
                          <p className="text-green-700">
                            Masz jeszcze <strong>{remainingDays} dni</strong> na
                            zwrot tego zamówienia.
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            Okres zwrotu: 14 dni od daty zakupu (
                            {new Date(
                              order.paidAt || order.createdAt
                            ).toLocaleDateString()}
                            )
                          </p>
                        </div>
                      ) : order.status === "paid" ? (
                        <div className="bg-gray-50 border border-gray-200 rounded p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">
                            ❌ Okres zwrotu minął
                          </h4>
                          <p className="text-gray-700">
                            Minęło ponad 14 dni od daty zakupu (
                            {new Date(
                              order.paidAt || order.createdAt
                            ).toLocaleDateString()}
                            ).
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            W sprawie wyjątkowych sytuacji skontaktuj się z
                            supportem.
                          </p>
                        </div>
                      ) : null}

                      {/* Przyciski zwrotów */}
                      {canRefund && hasProductsToRefund && (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-800">
                            Złóż wniosek o zwrot:
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Zwrot całego zamówienia */}
                            <div className="border border-gray-300 rounded-lg p-4">
                              <h5 className="font-medium text-gray-800 mb-2">
                                Zwrot całego zamówienia
                              </h5>
                              <p className="text-sm text-gray-600 mb-3">
                                Zwróć wszystkie pozostałe produkty z tego
                                zamówienia.
                              </p>
                              <RefundButton orderId={order._id} />
                            </div>

                            {/* Częściowy zwrot */}
                            <div className="border border-gray-300 rounded-lg p-4">
                              <h5 className="font-medium text-gray-800 mb-2">
                                Zwrot wybranych produktów
                              </h5>
                              <p className="text-sm text-gray-600 mb-3">
                                Wybierz konkretne produkty i ilości do zwrotu.
                              </p>
                              <button
                                onClick={() =>
                                  setOrderForPartialRefund(order._id)
                                }
                                className="w-full px-4 py-2 border border-orange-500 text-orange-600 rounded hover:bg-orange-50"
                              >
                                Wybierz produkty do zwrotu
                              </button>
                            </div>
                          </div>

                          {/* Informacje o procesie zwrotu */}
                          <div className="bg-blue-50 border border-blue-200 rounded p-4">
                            <h5 className="font-medium text-blue-800 mb-2">
                              ℹ️ Informacje o zwrocie
                            </h5>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>
                                • Środki zostaną zwrócone na kartę płatniczą w
                                ciągu 5-10 dni roboczych
                              </li>
                              <li>
                                • Dostęp do zwróconych produktów zostanie
                                zablokowany
                              </li>
                              <li>• Otrzymasz potwierdzenie zwrotu na email</li>
                              <li>
                                • W przypadku pytań skontaktuj się z supportem
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {order.status === "pending" && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                          <p className="text-yellow-700">
                            ⏳ Zamówienie oczekuje na płatność. Po opłaceniu
                            będziesz mógł skorzystać z opcji zwrotu.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Faktura */}
                {order.invoiceId && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      🧾 Faktura VAT
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-blue-700">
                          Numer faktury: {order.invoiceId}
                        </p>
                        {order.invoiceData?.companyName && (
                          <p className="text-sm text-blue-700">
                            Firma: {order.invoiceData.companyName}
                          </p>
                        )}
                      </div>
                      {order.invoiceUrl && (
                        <a
                          href={order.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 sm:mt-0 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm inline-block"
                        >
                          Pobierz fakturę
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Zasoby użytkownika */}
                {order.userResources && order.userResources.length > 0 && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
                    <h4 className="font-semibold text-green-800 mb-2">
                      📚 Twoje zasoby
                    </h4>
                    <p className="text-sm text-green-700 mb-2">
                      Dostęp do zakupionych materiałów:
                    </p>
                    <ul className="space-y-2">
                      {order.userResources.map((resource: any, idx: number) => (
                        <li key={idx} className="text-sm text-green-600">
                          • {resource.title}
                          {resource.chapters && (
                            <span className="text-xs text-green-500 ml-2">
                              ({resource.chapters.length} rozdziałów)
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Modal częściowego zwrotu */}
      {orderForPartialRefund && (
        <PartialRefundModal
          order={userOrders.find((o) => o._id === orderForPartialRefund)!}
          isOpen={!!orderForPartialRefund}
          onClose={closePartialRefundModal}
          onRefundSuccess={handleRefundSubmitted}
        />
      )}
    </div>
  );
};

export default UserOrders;
