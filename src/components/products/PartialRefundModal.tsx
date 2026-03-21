// components/orders/PartialRefundModal.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { partialRefundOrder } from "../../store/slices/orderSlice";
import type { Order } from "../../store/slices/orderSlice";
import type { AppDispatch } from "../../store";
import { useTranslation } from "react-i18next";

interface PartialRefundModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onRefundSuccess?: () => void;
}

const PartialRefundModal: React.FC<PartialRefundModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedProducts, setSelectedProducts] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { t } = useTranslation();

  if (!isOpen) return null;

  // Get product ID from product item
  const getProductId = (item: any): string => {
    if (item.productId) {
      return item.productId.toString();
    } else if (item.product && item.product._id) {
      return item.product._id.toString();
    }
    return item._id?.toString() || `unknown-${Math.random()}`;
  };

  // Get product information
  const getProductInfo = (item: any) => {
    if (item.product && typeof item.product === "object") {
      return {
        title: item.product.title || t("orders.unknownProduct"),
        price: item.product.price || 0,
      };
    } else {
      return {
        title: item.title || t("orders.unknownProduct"),
        price: item.price || 0,
      };
    }
  };

  // Get refundable products
  const refundableProducts = order.products.filter((item: any) => {
    const refundQuantity = item.refundQuantity || 0;
    const quantity = item.quantity || 1;
    return quantity > refundQuantity;
  });

  const handleQuantityChange = (productId: string, quantity: number) => {
    const product = order.products.find((p: any) => {
      const pId = p.productId || (p.product && p.product._id);
      return pId === productId;
    });

    if (!product) return;

    const maxAvailable =
      (product.quantity || 1) - (product.refundQuantity || 0);
    const newQuantity = Math.min(Math.max(0, quantity), maxAvailable);

    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  const calculateTotalRefund = () => {
    return Object.entries(selectedProducts).reduce(
      (total, [productId, quantity]) => {
        if (quantity <= 0) return total;

        const product = order.products.find((p: any) => {
          const pId = p.productId || (p.product && p.product._id);
          return pId === productId;
        });
        if (!product) return total;

        const productInfo = getProductInfo(product);
        return total + productInfo.price * quantity;
      },
      0,
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const refundItems = Object.entries(selectedProducts)
        .filter(([_, quantity]) => quantity > 0)
        .map(([productId, quantity]) => {
          order.products.find((p: any) => {
            const pId = getProductId(p);
            return pId === productId;
          });

          return {
            productId: productId,
            quantity,
            reason: t("partialRefund.refundReason"),
          };
        });

      if (refundItems.length === 0) {
        setError(t("partialRefund.selectAtLeastOne"));
        return;
      }

      await dispatch(
        partialRefundOrder({
          orderId: order._id,
          refundItems,
        }),
      ).unwrap();

      alert(
        t("partialRefund.successMessage", {
          amount: calculateTotalRefund().toFixed(2),
        }),
      );
      onClose();
    } catch (err: any) {
      console.error("Refund submission error:", err);
      setError(err.message || t("partialRefund.errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t("partialRefund.title")}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-gray-600 mb-6">{t("partialRefund.description")}</p>

        {refundableProducts.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
            <p className="text-yellow-700">
              {t("partialRefund.allProductsRefunded")}
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {refundableProducts.map((item: any) => {
              const productId =
                item.productId ||
                (item.product && item.product._id) ||
                `product-${Math.random()}`;
              const productInfo = getProductInfo(item);
              const quantity = item.quantity || 1;
              const refundQuantity = item.refundQuantity || 0;
              const maxAvailable = quantity - refundQuantity;
              const selectedQty = selectedProducts[productId] || 0;

              return (
                <div key={productId} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{productInfo.title}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        <p>
                          {t("partialRefund.price")}: {productInfo.price} PLN/
                          {t("partialRefund.piece")}
                        </p>
                        <p>
                          {t("partialRefund.canRefund")}: {maxAvailable}{" "}
                          {t("partialRefund.of")} {quantity}{" "}
                          {t("partialRefund.pieces")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <p className="text-lg font-bold text-green-700">
                        {(productInfo.price * selectedQty).toFixed(2)} PLN
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("partialRefund.quantityToRefund")}:
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(productId, selectedQty - 1)
                          }
                          disabled={selectedQty <= 0}
                          className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border rounded min-w-[40px] text-center">
                          {selectedQty}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(productId, selectedQty + 1)
                          }
                          disabled={selectedQty >= maxAvailable}
                          className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-500">
                          {t("partialRefund.max")}: {maxAvailable}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-blue-800">
                {t("partialRefund.refundSummary")}
              </h3>
              <p className="text-sm text-blue-700">
                {t("partialRefund.refundToCard")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-800">
                {calculateTotalRefund().toFixed(2)} PLN
              </p>
              <p className="text-sm text-blue-700">
                {t("partialRefund.transferTimeline")}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {t("partialRefund.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || calculateTotalRefund() === 0}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block h-4 w-4 border-b-2 border-white rounded-full mr-2"></span>
                {t("partialRefund.processing")}
              </>
            ) : (
              t("partialRefund.submitRefund")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartialRefundModal;

// // components/orders/PartialRefundModal.tsx
// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { partialRefundOrder } from "../../store/slices/orderSlice";
// import type { Order } from "../../store/slices/orderSlice";
// import type { AppDispatch } from "../../store";
// import { useTranslation } from "react-i18next";

// interface PartialRefundModalProps {
//   order: Order;
//   isOpen: boolean;
//   onClose: () => void;
//   onRefundSuccess?: () => void;
// }

// const PartialRefundModal: React.FC<PartialRefundModalProps> = ({
//   order,
//   isOpen,
//   onClose,
// }) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const [selectedProducts, setSelectedProducts] = useState<
//     Record<string, number>
//   >({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const { t } = useTranslation();

//   if (!isOpen) return null;

//   // Function to get productId from product
//   const getProductId = (item: any): string => {
//     if (item.productId) {
//       return item.productId.toString();
//     } else if (item.product && item.product._id) {
//       return item.product._id.toString();
//     }
//     return item._id?.toString() || `unknown-${Math.random()}`;
//   };

//   // Function to get product information
//   const getProductInfo = (item: any) => {
//     if (item.product && typeof item.product === "object") {
//       return {
//         title: item.product.title || "Nieznany produkt",
//         price: item.product.price || 0,
//       };
//     } else {
//       return {
//         title: item.title || "Nieznany produkt",
//         price: item.price || 0,
//       };
//     }
//   };

//   // Download returnable products
//   const refundableProducts = order.products.filter((item: any) => {
//     const refundQuantity = item.refundQuantity || 0;
//     const quantity = item.quantity || 1;
//     return quantity > refundQuantity;
//   });

//   const handleQuantityChange = (productId: string, quantity: number) => {
//     const product = order.products.find((p: any) => {
//       const pId = p.productId || (p.product && p.product._id);
//       return pId === productId;
//     });

//     if (!product) return;

//     const maxAvailable =
//       (product.quantity || 1) - (product.refundQuantity || 0);
//     const newQuantity = Math.min(Math.max(0, quantity), maxAvailable);

//     setSelectedProducts((prev) => ({
//       ...prev,
//       [productId]: newQuantity,
//     }));
//   };

//   const calculateTotalRefund = () => {
//     return Object.entries(selectedProducts).reduce(
//       (total, [productId, quantity]) => {
//         if (quantity <= 0) return total;

//         const product = order.products.find((p: any) => {
//           const pId = p.productId || (p.product && p.product._id);
//           return pId === productId;
//         });
//         if (!product) return total;

//         const productInfo = getProductInfo(product);
//         return total + productInfo.price * quantity;
//       },
//       0,
//     );
//   };
//   const handleSubmit = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const refundItems = Object.entries(selectedProducts)
//         .filter(([_, quantity]) => quantity > 0)
//         .map(([productId, quantity]) => {
//           order.products.find((p: any) => {
//             const pId = getProductId(p);
//             return pId === productId;
//           });

//           return {
//             productId: productId,
//             quantity,
//             reason: "Zwrot na żądanie klienta",
//           };
//         });

//       if (refundItems.length === 0) {
//         setError("Wybierz przynajmniej jeden produkt do zwrotu");
//         return;
//       }

//       await dispatch(
//         partialRefundOrder({
//           orderId: order._id,
//           refundItems,
//         }),
//       ).unwrap();

//       alert(
//         `✅ Wniosek o zwrot ${calculateTotalRefund().toFixed(
//           2,
//         )} PLN został złożony`,
//       );
//       onClose();
//     } catch (err: any) {
//       console.error("Refund submission error:", err);
//       setError(err.message || "Błąd podczas składania wniosku o zwrot");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-bold">Zwrot wybranych produktów</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-2xl"
//           >
//             ×
//           </button>
//         </div>

//         <p className="text-gray-600 mb-6">
//           Wybierz produkty, które chcesz zwrócić. Możesz zwrócić wybrane sztuki
//           z każdego produktu.
//         </p>

//         {refundableProducts.length === 0 ? (
//           <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
//             <p className="text-yellow-700">
//               Wszystkie produkty z tego zamówienia zostały już zwrócone.
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-4 mb-6">
//             {refundableProducts.map((item: any) => {
//               const productId =
//                 item.productId ||
//                 (item.product && item.product._id) ||
//                 `product-${Math.random()}`;
//               const productInfo = getProductInfo(item);
//               const quantity = item.quantity || 1;
//               const refundQuantity = item.refundQuantity || 0;
//               const maxAvailable = quantity - refundQuantity;
//               const selectedQty = selectedProducts[productId] || 0;

//               return (
//                 <div key={productId} className="border rounded-lg p-4">
//                   <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
//                     <div>
//                       <h3 className="font-semibold">{productInfo.title}</h3>
//                       <div className="text-sm text-gray-600 mt-1">
//                         <p>Cena: {productInfo.price} PLN/szt</p>
//                         <p>
//                           Możesz zwrócić: {maxAvailable} z {quantity} szt.
//                         </p>
//                       </div>
//                     </div>
//                     <div className="mt-2 md:mt-0">
//                       <p className="text-lg font-bold text-green-700">
//                         {(productInfo.price * selectedQty).toFixed(2)} PLN
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center space-x-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Ilość do zwrotu:
//                       </label>
//                       <div className="flex items-center space-x-2">
//                         <button
//                           onClick={() =>
//                             handleQuantityChange(productId, selectedQty - 1)
//                           }
//                           disabled={selectedQty <= 0}
//                           className="px-3 py-1 border rounded disabled:opacity-50"
//                         >
//                           -
//                         </button>
//                         <span className="px-3 py-1 border rounded min-w-[40px] text-center">
//                           {selectedQty}
//                         </span>
//                         <button
//                           onClick={() =>
//                             handleQuantityChange(productId, selectedQty + 1)
//                           }
//                           disabled={selectedQty >= maxAvailable}
//                           className="px-3 py-1 border rounded disabled:opacity-50"
//                         >
//                           +
//                         </button>
//                         <span className="text-sm text-gray-500">
//                           max: {maxAvailable}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Summary */}
//         <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h3 className="font-semibold text-blue-800">
//                 Podsumowanie zwrotu
//               </h3>
//               <p className="text-sm text-blue-700">
//                 Środki zostaną zwrócone na Twoją kartę
//               </p>
//             </div>
//             <div className="text-right">
//               <p className="text-2xl font-bold text-blue-800">
//                 {calculateTotalRefund().toFixed(2)} PLN
//               </p>
//               <p className="text-sm text-blue-700">
//                 Przelew w ciągu 5-10 dni roboczych
//               </p>
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
//             <p className="text-red-700">{error}</p>
//           </div>
//         )}

//         <div className="flex justify-end space-x-4">
//           <button
//             onClick={onClose}
//             disabled={loading}
//             className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
//           >
//             Anuluj
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={loading || calculateTotalRefund() === 0}
//             className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
//           >
//             {loading ? (
//               <>
//                 <span className="animate-spin inline-block h-4 w-4 border-b-2 border-white rounded-full mr-2"></span>
//                 Przetwarzanie...
//               </>
//             ) : (
//               "Złóż wniosek o zwrot"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PartialRefundModal;
