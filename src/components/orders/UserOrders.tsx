import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../store/slices/orderSlice";
import type { AppDispatch, RootState } from "../../store";
import { useEffect, useState } from "react";
import RefundButton from "./RefundButton";
import PartialRefundModal from "../products/PartialRefundModal";
import { useTranslation } from "react-i18next";

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

  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  // Close the modal
  const closePartialRefundModal = () => {
    setOrderForPartialRefund(null);
  };

  // Handle successful refund request submission
  const handleRefundSubmitted = () => {
    closePartialRefundModal();
    // Refresh the order list
    dispatch(fetchUserOrders());
  };

  if (ordersLoading)
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">{t("orders.loading")}</span>
      </div>
    );

  if (ordersError)
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <p className="text-red-700">
          ❌ {t("orders.error")}: {ordersError}
        </p>
        <button
          onClick={() => dispatch(fetchUserOrders())}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          {t("orders.retry")}
        </button>
      </div>
    );

  if (!userOrders || userOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 text-lg mb-4">{t("orders.noOrders")}</p>
        <button
          onClick={() => (window.location.href = "/products")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t("orders.browseProducts")}
        </button>
      </div>
    );
  }

  // Get product information
  const getProductInfo = (item: any) => {
    if (item.product && typeof item.product === "object") {
      return {
        title: item.product.title || t("orders.unknownProduct"),
        price: item.product.price || 0,
        description: item.product.description || "",
        imageUrl: item.product.imageUrl || "",
      };
    } else {
      return {
        title: item.title || t("orders.unknownProduct"),
        price: item.price || 0,
        description: item.description || item.content || "",
        imageUrl: item.imageUrl || "",
      };
    }
  };

  // Check if the order has a coupon or discount
  const hasDiscount = (order: any) => {
    return order.couponCode || (order.totalDiscount && order.totalDiscount > 0);
  };

  // Check if the order can be refunded
  const canRefundOrder = (order: any) => {
    const purchaseDate = new Date(order.paidAt || order.createdAt);
    const now = new Date();
    const daysSincePurchase = Math.floor(
      (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const canRefund = daysSincePurchase <= 14;

    return canRefund;
  };

  // Check if the order can be partially refunded
  const canPartialRefundOrder = (order: any) => {
    if (!canRefundOrder(order)) return false;

    // Check if there are products to refund
    return hasRefundableProducts(order);
  };

  // Check if the order can be fully refunded
  const canFullRefundOrder = (order: any) => {
    if (!canRefundOrder(order)) return false;

    // Full refund always possible (even with a coupon)
    return hasRefundableProducts(order);
  };

  // Check if the order has any products to refund
  const hasRefundableProducts = (order: any) => {
    return (
      order.products?.some((item: any) => {
        const refundQuantity = item.refundQuantity || 0;
        const quantity = item.quantity || 1;
        return quantity > refundQuantity;
      }) || false
    );
  };

  // Calculate the remaining days until the refund
  const getRemainingRefundDays = (order: any) => {
    const purchaseDate = new Date(order.paidAt || order.createdAt);
    const now = new Date();
    const daysSincePurchase = Math.floor(
      (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(0, 14 - daysSincePurchase);
  };

  // Get coupon details
  const getDiscountDetails = (order: any) => {
    if (!hasDiscount(order)) return null;

    return {
      couponCode: order.couponCode,
      totalDiscount: order.totalDiscount,
      originalTotal: order.totalAmount + (order.totalDiscount || 0),
      finalTotal: order.totalAmount,
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {t("orders.yourOrders")}
      </h2>

      {userOrders.map((order) => {
        const isExpanded = expandedOrder === order._id;
        const canRefund = canRefundOrder(order);
        const canPartialRefund = canPartialRefundOrder(order);
        const canFullRefund = canFullRefundOrder(order);
        const remainingDays = getRemainingRefundDays(order);
        const hasProductsToRefund = hasRefundableProducts(order);
        const isPartiallyRefunded =
          order.status === "partially_refunded" ||
          order.products?.some((item: any) => (item.refundQuantity || 0) > 0);

        const discountDetails = getDiscountDetails(order);

        return (
          <div
            key={order._id}
            className="mb-6 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            {/* Order Header */}
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
                      {t("orders.order")} #{order._id.substring(0, 8)}...
                    </h3>
                    {order.refundedAt && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        💸 {t("orders.refunded")}
                      </span>
                    )}
                    {isPartiallyRefunded && !order.refundedAt && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        ⚠️ {t("orders.partialRefund")}
                      </span>
                    )}
                    {discountDetails && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        💰 {t("orders.coupon")}:{" "}
                        {discountDetails.couponCode || t("orders.discount")}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {t("orders.date")}:{" "}
                    {new Date(order.createdAt).toLocaleString()}
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
                      {order.status === "paid" && t("orders.paid")}
                      {order.status === "refunded" && t("orders.refunded")}
                      {order.status === "partially_refunded" &&
                        t("orders.partiallyRefunded")}
                      {order.status === "pending" && t("orders.pending")}
                    </span>

                    {canRefund && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        🕐 {t("orders.refundAvailable")}: {remainingDays}{" "}
                        {t("orders.days")}
                      </span>
                    )}

                    {!canRefund &&
                      order.status === "paid" &&
                      remainingDays <= 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          ❌ {t("orders.refundPeriodExpired")}
                        </span>
                      )}
                  </div>
                </div>

                <div className="mt-2 md:mt-0 flex items-center space-x-2">
                  {isExpanded ? (
                    <>
                      <span className="text-sm text-gray-600">
                        {t("orders.clickToCollapse")}
                      </span>
                      <span className="text-lg font-bold text-gray-800">▲</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-gray-600">
                        {t("orders.clickToExpand")}
                      </span>
                      <span className="text-lg font-bold text-gray-800">▼</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="p-4">
                {/* Coupon/Discount Section */}
                {discountDetails && (
                  <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span className="text-purple-600 font-medium mr-2">
                        💰
                      </span>
                      <h4 className="font-semibold text-purple-800">
                        {discountDetails.couponCode
                          ? `${t("orders.appliedCoupon")}: ${discountDetails.couponCode}`
                          : t("orders.appliedDiscount")}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">
                          {t("orders.originalAmount")}:
                        </p>
                        <p className="font-medium text-gray-800">
                          {discountDetails.originalTotal.toFixed(2)} zł
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          {t("orders.discountAmount")}:
                        </p>
                        <p className="font-medium text-red-600">
                          -{discountDetails.totalDiscount.toFixed(2)} zł
                        </p>
                      </div>
                      <div className="md:col-span-2 pt-2 border-t border-purple-100">
                        <p className="text-gray-600">
                          {t("orders.totalToPay")}:
                        </p>
                        <p className="text-lg font-bold text-purple-700">
                          {discountDetails.finalTotal.toFixed(2)} zł
                        </p>
                      </div>
                    </div>
                    {hasDiscount(order) && (
                      <div className="mt-3 p-3 bg-purple-100 border border-purple-300 rounded">
                        <p className="text-sm text-purple-700 font-medium">
                          ⚠️ {t("orders.couponRefundWarning")}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          {t("orders.couponRefundContact")}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Products */}
                {order.products && order.products.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      {t("orders.orderProducts")}:
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
                                      / {t("orders.piece")}
                                    </p>
                                    <div className="flex items-center space-x-4">
                                      <p className="text-gray-600">
                                        {t("orders.purchased")}:{" "}
                                        <span className="font-medium">
                                          {quantity} {t("orders.pieces")}
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
                                          {t("orders.refunded")}:{" "}
                                          {refundQuantity} {t("orders.pieces")}
                                        </p>
                                      )}
                                    </div>
                                    {canRefund && canRefundThisProduct && (
                                      <p className="text-green-600 text-sm font-medium">
                                        ✓ {t("orders.canRefund")}:{" "}
                                        {quantity - refundQuantity}{" "}
                                        {t("orders.pieces")}
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
                                    {t("orders.refund")}:{" "}
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
                    {t("orders.noProductsInOrder")}
                  </p>
                )}

                {/* Returns Section */}
                <div className="mt-8 pt-6 border-t">
                  {order.refundedAt ? (
                    <div className="bg-red-50 border border-red-200 rounded p-4">
                      <p className="text-red-700 font-medium">
                        💸 {t("orders.orderRefundedOn")}:{" "}
                        {new Date(order.refundedAt).toLocaleDateString()}
                      </p>
                      {order.refundId && (
                        <p className="text-sm text-red-600 mt-1">
                          {t("orders.refundId")}: {order.refundId}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-2">
                        {t("orders.refundProcessedToCard")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Return period information */}
                      {canRefund ? (
                        <div className="bg-green-50 border border-green-200 rounded p-4">
                          <h4 className="font-semibold text-green-800 mb-2">
                            🕐 {t("orders.refundEligibility")}
                          </h4>
                          <p className="text-green-700">
                            {t("orders.refundDaysRemaining")}{" "}
                            <strong>
                              {remainingDays} {t("orders.days")}
                            </strong>{" "}
                            {t("orders.toRefund")}
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            {t("orders.refundPeriodInfo")} (
                            {new Date(
                              order.paidAt || order.createdAt,
                            ).toLocaleDateString()}
                            )
                          </p>
                        </div>
                      ) : order.status === "paid" ? (
                        <div className="bg-gray-50 border border-gray-200 rounded p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">
                            ❌ {t("orders.refundPeriodExpired")}
                          </h4>
                          <p className="text-gray-700">
                            {t("orders.refundPeriodExpiredMessage")} (
                            {new Date(
                              order.paidAt || order.createdAt,
                            ).toLocaleDateString()}
                            ).
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {t("orders.contactSupportForExceptions")}
                          </p>
                        </div>
                      ) : null}

                      {/* Return Buttons */}

                      {canRefund && hasProductsToRefund && (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-800">
                            {t("orders.submitRefundRequest")}:
                          </h4>

                          <div
                            className={`grid ${discountDetails ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-4`}
                          >
                            {/* Refund of entire order */}
                            <div className="border border-gray-300 rounded-lg p-4">
                              <h5 className="font-medium text-gray-800 mb-2">
                                {t("orders.fullOrderRefund")}
                              </h5>
                              <p className="text-sm text-gray-600 mb-3">
                                {discountDetails
                                  ? t("orders.fullOrderRefundWithDiscountDesc")
                                  : t("orders.fullOrderRefundDesc")}
                              </p>

                              <RefundButton
                                orderId={order._id}
                                orderStatus={order.status}
                                hasPartialRefunds={
                                  order.partialRefunds &&
                                  order.partialRefunds.length > 0
                                }
                                allProductsRefunded={order.products?.every(
                                  (item: any) =>
                                    (item.refundQuantity || 0) ===
                                    item.quantity,
                                )}
                                disabled={
                                  !canFullRefund ||
                                  order.status === "refunded" ||
                                  order.status === "partially_refunded" ||
                                  (order.partialRefunds &&
                                    order.partialRefunds.length > 0) ||
                                  order.products?.every(
                                    (item: any) =>
                                      (item.refundQuantity || 0) ===
                                      item.quantity,
                                  )
                                }
                                variant={
                                  discountDetails ? "discount" : "normal"
                                }
                              />

                              {discountDetails && (
                                <p className="text-xs text-purple-600 mt-2">
                                  💰 {t("orders.willBeRefunded")}:{" "}
                                  <strong>
                                    {order.totalAmount.toFixed(2)} zł
                                  </strong>{" "}
                                  ({t("orders.amountAfterDiscount")})
                                </p>
                              )}
                            </div>

                            {/* Partial refund - only WITHOUT coupon */}
                            {!discountDetails && canPartialRefund && (
                              <div className="border border-gray-300 rounded-lg p-4">
                                <h5 className="font-medium text-gray-800 mb-2">
                                  {t("orders.selectedProductsRefund")}
                                </h5>
                                <p className="text-sm text-gray-600 mb-3">
                                  {t("orders.selectProductsToRefund")}
                                </p>
                                <button
                                  onClick={() =>
                                    setOrderForPartialRefund(order._id)
                                  }
                                  className="w-full px-4 py-2 border border-orange-500 text-orange-600 rounded hover:bg-orange-50"
                                >
                                  {t("orders.selectProductsToRefundButton")}
                                </button>
                              </div>
                            )}

                            {/* Message when partial refund not available due to coupon */}
                            {discountDetails && (
                              <div className="border border-orange-300 bg-orange-50 rounded-lg p-4">
                                <h5 className="font-medium text-orange-800 mb-2">
                                  ⚠️ {t("orders.partialRefundUnavailable")}
                                </h5>
                                <p className="text-sm text-orange-700 mb-3">
                                  {t("orders.partialRefundCouponMessage")}
                                </p>
                                <button
                                  disabled
                                  className="w-full px-4 py-2 border border-orange-300 text-orange-500 bg-orange-100 rounded cursor-not-allowed"
                                >
                                  {t("orders.unavailableCoupon")}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Return Process Information */}
                          <div className="bg-blue-50 border border-blue-200 rounded p-4">
                            <h5 className="font-medium text-blue-800 mb-2">
                              ℹ️ {t("orders.refundInformation")}
                            </h5>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• {t("orders.refundTimeline")}</li>
                              {discountDetails && (
                                <li>• {t("orders.couponRefundInfo")}</li>
                              )}
                              <li>• {t("orders.productAccessBlocked")}</li>
                              <li>• {t("orders.refundEmailConfirmation")}</li>
                              <li>• {t("orders.contactSupport")}</li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {order.status === "pending" && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                          <p className="text-yellow-700">
                            ⏳ {t("orders.orderPendingPayment")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Invoice */}
                {order.invoiceDetails?.invoicePdf && (
                  <a
                    href={order.invoiceDetails.invoicePdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm ml-3"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {t("orders.downloadPDF")}
                  </a>
                )}

                {order.invoiceDetails?.invoiceNumber && (
                  <p className="text-sm text-gray-600 mt-2">
                    {t("orders.invoiceNumber")}:{" "}
                    <span className="font-medium">
                      {order.invoiceDetails.invoiceNumber}
                    </span>
                  </p>
                )}

                {/* User Resources */}
                {!order.refundedAt &&
                  order.userResources &&
                  order.userResources.length > 0 && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
                      <h4 className="font-semibold text-green-800 mb-2">
                        📚 {t("orders.yourResources")}
                      </h4>
                      <p className="text-sm text-green-700 mb-2">
                        {t("orders.accessToPurchasedMaterials")}:
                      </p>
                      <ul className="space-y-2">
                        {order.userResources.map(
                          (resource: any, idx: number) => (
                            <li key={idx} className="text-sm text-green-600">
                              • {resource.title}
                              {resource.chapters && (
                                <span className="text-xs text-green-500 ml-2">
                                  ({resource.chapters.length}{" "}
                                  {t("orders.chapters")})
                                </span>
                              )}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>
        );
      })}

      {/* Partial Return Modal */}
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

// import { useDispatch, useSelector } from "react-redux";
// import { fetchUserOrders } from "../../store/slices/orderSlice";
// import type { AppDispatch, RootState } from "../../store";
// import { useEffect, useState } from "react";
// import RefundButton from "./RefundButton";
// import PartialRefundModal from "../products/PartialRefundModal";
// import { useTranslation } from "react-i18next";

// const UserOrders: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
//   const [orderForPartialRefund, setOrderForPartialRefund] = useState<
//     string | null
//   >(null);

//   const {
//     userOrders,
//     loading: ordersLoading,
//     error: ordersError,
//   } = useSelector((state: RootState) => state.orders);

//   const { t } = useTranslation();

//   useEffect(() => {
//     dispatch(fetchUserOrders());
//   }, [dispatch]);

//   // Function to close the modal
//   const closePartialRefundModal = () => {
//     setOrderForPartialRefund(null);
//   };

//   // Function after successful refund request submission
//   const handleRefundSubmitted = () => {
//     closePartialRefundModal();
//     // Refresh the order list
//     dispatch(fetchUserOrders());
//   };

//   if (ordersLoading)
//     return (
//       <div className="flex justify-center items-center py-8">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//         <span className="ml-2">Ładowanie zamówień...</span>
//       </div>
//     );

//   if (ordersError)
//     return (
//       <div className="bg-red-50 border border-red-200 rounded p-4">
//         <p className="text-red-700">❌ Błąd: {ordersError}</p>
//         <button
//           onClick={() => dispatch(fetchUserOrders())}
//           className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//         >
//           Spróbuj ponownie
//         </button>
//       </div>
//     );

//   if (!userOrders || userOrders.length === 0) {
//     return (
//       <div className="text-center py-8">
//         <p className="text-gray-600 text-lg mb-4">
//           Nie masz jeszcze żadnych zamówień.
//         </p>
//         <button
//           onClick={() => (window.location.href = "/products")}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Przeglądaj produkty
//         </button>
//       </div>
//     );
//   }

//   // Helper function to get product information
//   const getProductInfo = (item: any) => {
//     if (item.product && typeof item.product === "object") {
//       return {
//         title: item.product.title || "Nieznany produkt",
//         price: item.product.price || 0,
//         description: item.product.description || "",
//         imageUrl: item.product.imageUrl || "",
//       };
//     } else {
//       return {
//         title: item.title || "Nieznany produkt",
//         price: item.price || 0,
//         description: item.description || item.content || "",
//         imageUrl: item.imageUrl || "",
//       };
//     }
//   };

//   // Check if the order has a coupon or discount
//   const hasDiscount = (order: any) => {
//     return order.couponCode || (order.totalDiscount && order.totalDiscount > 0);
//   };

//   // Check if the order can be refunded
//   const canRefundOrder = (order: any) => {
//     const purchaseDate = new Date(order.paidAt || order.createdAt);
//     const now = new Date();
//     const daysSincePurchase = Math.floor(
//       (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24),
//     );

//     const canRefund = daysSincePurchase <= 14;

//     return canRefund;
//   };

//   // Check if the order can be partially refunded
//   const canPartialRefundOrder = (order: any) => {
//     if (!canRefundOrder(order)) return false;

//     // Check if there are products to refund
//     return hasRefundableProducts(order);
//   };

//   // Check if the order can be fully refunded
//   const canFullRefundOrder = (order: any) => {
//     if (!canRefundOrder(order)) return false;

//     // Full refund always possible (even with a coupon)
//     return hasRefundableProducts(order);
//   };

//   // Check if the order has any products to refund
//   const hasRefundableProducts = (order: any) => {
//     return (
//       order.products?.some((item: any) => {
//         const refundQuantity = item.refundQuantity || 0;
//         const quantity = item.quantity || 1;
//         return quantity > refundQuantity;
//       }) || false
//     );
//   };

//   // Calculate the remaining days until the refund
//   const getRemainingRefundDays = (order: any) => {
//     const purchaseDate = new Date(order.paidAt || order.createdAt);
//     const now = new Date();
//     const daysSincePurchase = Math.floor(
//       (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24),
//     );
//     return Math.max(0, 14 - daysSincePurchase);
//   };

//   // Function to retrieve coupon details
//   const getDiscountDetails = (order: any) => {
//     if (!hasDiscount(order)) return null;

//     return {
//       couponCode: order.couponCode,
//       totalDiscount: order.totalDiscount,
//       originalTotal: order.totalAmount + (order.totalDiscount || 0),
//       finalTotal: order.totalAmount,
//     };
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-6 text-gray-800">
//         Twoje zamówienia
//       </h2>

//       {userOrders.map((order) => {
//         const isExpanded = expandedOrder === order._id;
//         const canRefund = canRefundOrder(order);
//         const canPartialRefund = canPartialRefundOrder(order);
//         const canFullRefund = canFullRefundOrder(order);
//         const remainingDays = getRemainingRefundDays(order);
//         const hasProductsToRefund = hasRefundableProducts(order);
//         const isPartiallyRefunded =
//           order.status === "partially_refunded" ||
//           order.products?.some((item: any) => (item.refundQuantity || 0) > 0);

//         const discountDetails = getDiscountDetails(order);

//         return (
//           <div
//             key={order._id}
//             className="mb-6 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
//           >
//             {/* Order Header */}
//             <div
//               className={`p-4 cursor-pointer transition-colors ${
//                 isExpanded ? "bg-blue-100" : "bg-blue-50 hover:bg-blue-100"
//               } ${order.refundedAt ? "bg-red-50" : ""}`}
//               onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
//             >
//               <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//                 <div>
//                   <div className="flex items-center space-x-2">
//                     <h3 className="font-bold text-lg">
//                       Zamówienie #{order._id.substring(0, 8)}...
//                     </h3>
//                     {order.refundedAt && (
//                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
//                         💸 Zwrócone
//                       </span>
//                     )}
//                     {isPartiallyRefunded && !order.refundedAt && (
//                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
//                         ⚠️ Częściowy zwrot
//                       </span>
//                     )}
//                     {discountDetails && (
//                       <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                         💰 Kupon: {discountDetails.couponCode || "Zniżka"}
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-gray-600 text-sm">
//                     Data: {new Date(order.createdAt).toLocaleString()}
//                   </p>
//                   <div className="flex flex-wrap gap-2 mt-1">
//                     <span
//                       className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
//                         order.status === "paid"
//                           ? "bg-green-100 text-green-800"
//                           : order.status === "refunded"
//                             ? "bg-red-100 text-red-800"
//                             : order.status === "partially_refunded"
//                               ? "bg-orange-100 text-orange-800"
//                               : "bg-yellow-100 text-yellow-800"
//                       }`}
//                     >
//                       {order.status === "paid" && "Opłacone"}
//                       {order.status === "refunded" && "Zwrócone"}
//                       {order.status === "partially_refunded" &&
//                         "Częściowo zwrócone"}
//                       {order.status === "pending" && "Oczekujące"}
//                     </span>

//                     {canRefund && (
//                       <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
//                         🕐 Możliwość zwrotu: {remainingDays} dni
//                       </span>
//                     )}

//                     {!canRefund &&
//                       order.status === "paid" &&
//                       remainingDays <= 0 && (
//                         <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                           ❌ Okres zwrotu minął
//                         </span>
//                       )}
//                   </div>
//                 </div>

//                 <div className="mt-2 md:mt-0 flex items-center space-x-2">
//                   {isExpanded ? (
//                     <>
//                       <span className="text-sm text-gray-600">
//                         Kliknij aby zwinąć
//                       </span>
//                       <span className="text-lg font-bold text-gray-800">▲</span>
//                     </>
//                   ) : (
//                     <>
//                       <span className="text-sm text-gray-600">
//                         Kliknij aby rozwinąć
//                       </span>
//                       <span className="text-lg font-bold text-gray-800">▼</span>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Expanded Details */}
//             {isExpanded && (
//               <div className="p-4">
//                 {/* Coupon/Discount Section */}
//                 {discountDetails && (
//                   <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
//                     <div className="flex items-center mb-2">
//                       <span className="text-purple-600 font-medium mr-2">
//                         💰
//                       </span>
//                       <h4 className="font-semibold text-purple-800">
//                         Zastosowano{" "}
//                         {discountDetails.couponCode
//                           ? `kupon: ${discountDetails.couponCode}`
//                           : "zniżkę"}
//                       </h4>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
//                       <div>
//                         <p className="text-gray-600">Wartość oryginalna:</p>
//                         <p className="font-medium text-gray-800">
//                           {discountDetails.originalTotal.toFixed(2)} zł
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-gray-600">Zniżka:</p>
//                         <p className="font-medium text-red-600">
//                           -{discountDetails.totalDiscount.toFixed(2)} zł
//                         </p>
//                       </div>
//                       <div className="md:col-span-2 pt-2 border-t border-purple-100">
//                         <p className="text-gray-600">Do zapłaty:</p>
//                         <p className="text-lg font-bold text-purple-700">
//                           {discountDetails.finalTotal.toFixed(2)} zł
//                         </p>
//                       </div>
//                     </div>
//                     {hasDiscount(order) && (
//                       <div className="mt-3 p-3 bg-purple-100 border border-purple-300 rounded">
//                         <p className="text-sm text-purple-700 font-medium">
//                           ⚠️ Zamówienie z kuponem: możliwy tylko pełny zwrot
//                           całego zamówienia.
//                         </p>
//                         <p className="text-xs text-purple-600 mt-1">
//                           W przypadku pytań dotyczących zwrotu skontaktuj się z
//                           obsługą klienta.
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Products */}
//                 {order.products && order.products.length > 0 ? (
//                   <div className="space-y-4">
//                     <h4 className="font-semibold text-gray-700 mb-3">
//                       Produkty w zamówieniu:
//                     </h4>

//                     {order.products.map((item: any, i: number) => {
//                       const productInfo = getProductInfo(item);
//                       const quantity = item.quantity || 1;
//                       const refundQuantity = item.refundQuantity || 0;
//                       const isRefunded = refundQuantity > 0;
//                       const canRefundThisProduct = quantity > refundQuantity;

//                       return (
//                         <div
//                           key={i}
//                           className={`p-4 border rounded-lg ${
//                             isRefunded
//                               ? refundQuantity === quantity
//                                 ? "bg-red-50 border-red-200"
//                                 : "bg-orange-50 border-orange-200"
//                               : "bg-gray-50 border-gray-200"
//                           }`}
//                         >
//                           <div className="flex flex-col md:flex-row md:items-start justify-between">
//                             <div className="mb-3 md:mb-0 flex-1">
//                               <div className="flex items-start space-x-3">
//                                 {productInfo.imageUrl && (
//                                   <img
//                                     src={productInfo.imageUrl}
//                                     alt={productInfo.title}
//                                     className="w-16 h-16 object-cover rounded border flex-shrink-0"
//                                   />
//                                 )}
//                                 <div>
//                                   <p className="font-semibold text-gray-800 text-lg">
//                                     {productInfo.title}
//                                   </p>
//                                   <div className="mt-2 space-y-1">
//                                     <p className="text-gray-600">
//                                       <span className="font-medium">
//                                         {productInfo.price} zł
//                                       </span>{" "}
//                                       / szt.
//                                     </p>
//                                     <div className="flex items-center space-x-4">
//                                       <p className="text-gray-600">
//                                         Zakupiono:{" "}
//                                         <span className="font-medium">
//                                           {quantity} szt.
//                                         </span>
//                                       </p>
//                                       {isRefunded && (
//                                         <p
//                                           className={`font-medium ${
//                                             refundQuantity === quantity
//                                               ? "text-red-600"
//                                               : "text-orange-600"
//                                           }`}
//                                         >
//                                           Zwrócono: {refundQuantity} szt.
//                                         </p>
//                                       )}
//                                     </div>
//                                     {canRefund && canRefundThisProduct && (
//                                       <p className="text-green-600 text-sm font-medium">
//                                         ✓ Można zwrócić:{" "}
//                                         {quantity - refundQuantity} szt.
//                                       </p>
//                                     )}
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>

//                             <div className="text-right">
//                               <div className="text-xl font-bold text-gray-900">
//                                 {(
//                                   productInfo.price *
//                                   (quantity - refundQuantity)
//                                 ).toFixed(2)}{" "}
//                                 zł
//                               </div>
//                               {isRefunded && (
//                                 <div className="mt-2">
//                                   <p
//                                     className={`text-sm ${
//                                       refundQuantity === quantity
//                                         ? "text-red-600"
//                                         : "text-orange-600"
//                                     }`}
//                                   >
//                                     Zwrot:{" "}
//                                     {(
//                                       productInfo.price * refundQuantity
//                                     ).toFixed(2)}{" "}
//                                     zł
//                                   </p>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <p className="italic text-gray-500">
//                     Brak produktów w tym zamówieniu.
//                   </p>
//                 )}

//                 {/* Returns Section */}
//                 <div className="mt-8 pt-6 border-t">
//                   {order.refundedAt ? (
//                     <div className="bg-red-50 border border-red-200 rounded p-4">
//                       <p className="text-red-700 font-medium">
//                         💸 Zamówienie zostało zwrócone dnia:{" "}
//                         {new Date(order.refundedAt).toLocaleDateString()}
//                       </p>
//                       {order.refundId && (
//                         <p className="text-sm text-red-600 mt-1">
//                           ID zwrotu: {order.refundId}
//                         </p>
//                       )}
//                       <p className="text-sm text-gray-600 mt-2">
//                         Środki zostały zwrócone na Twoją kartę płatniczą.
//                       </p>
//                     </div>
//                   ) : (
//                     <div className="space-y-6">
//                       {/* Return period information */}
//                       {canRefund ? (
//                         <div className="bg-green-50 border border-green-200 rounded p-4">
//                           <h4 className="font-semibold text-green-800 mb-2">
//                             🕐 Możliwość zwrotu
//                           </h4>
//                           <p className="text-green-700">
//                             Masz jeszcze <strong>{remainingDays} dni</strong> na
//                             zwrot tego zamówienia.
//                           </p>
//                           <p className="text-sm text-green-600 mt-1">
//                             Okres zwrotu: 14 dni od daty zakupu (
//                             {new Date(
//                               order.paidAt || order.createdAt,
//                             ).toLocaleDateString()}
//                             )
//                           </p>
//                         </div>
//                       ) : order.status === "paid" ? (
//                         <div className="bg-gray-50 border border-gray-200 rounded p-4">
//                           <h4 className="font-semibold text-gray-800 mb-2">
//                             ❌ Okres zwrotu minął
//                           </h4>
//                           <p className="text-gray-700">
//                             Minęło ponad 14 dni od daty zakupu (
//                             {new Date(
//                               order.paidAt || order.createdAt,
//                             ).toLocaleDateString()}
//                             ).
//                           </p>
//                           <p className="text-sm text-gray-600 mt-1">
//                             W sprawie wyjątkowych sytuacji skontaktuj się z
//                             supportem.
//                           </p>
//                         </div>
//                       ) : null}

//                       {/* Przyciski zwrotów */}

//                       {canRefund && hasProductsToRefund && (
//                         <div className="space-y-4">
//                           <h4 className="font-semibold text-gray-800">
//                             Złóż wniosek o zwrot:
//                           </h4>

//                           <div
//                             className={`grid ${discountDetails ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-4`}
//                           >
//                             {/* Refund of entire order */}
//                             <div className="border border-gray-300 rounded-lg p-4">
//                               <h5 className="font-medium text-gray-800 mb-2">
//                                 Refund of entire order
//                               </h5>
//                               <p className="text-sm text-gray-600 mb-3">
//                                 {discountDetails
//                                   ? "Zwróć całe zamówienie (kwota po zniżce zostanie zwrócona)."
//                                   : "Zwróć wszystkie produkty z tego zamówienia."}
//                               </p>

//                               <RefundButton
//                                 orderId={order._id}
//                                 orderStatus={order.status}
//                                 hasPartialRefunds={
//                                   order.partialRefunds &&
//                                   order.partialRefunds.length > 0
//                                 }
//                                 allProductsRefunded={order.products?.every(
//                                   (item: any) =>
//                                     (item.refundQuantity || 0) ===
//                                     item.quantity,
//                                 )}
//                                 disabled={
//                                   !canFullRefund ||
//                                   order.status === "refunded" ||
//                                   order.status === "partially_refunded" ||
//                                   (order.partialRefunds &&
//                                     order.partialRefunds.length > 0) ||
//                                   order.products?.every(
//                                     (item: any) =>
//                                       (item.refundQuantity || 0) ===
//                                       item.quantity,
//                                   )
//                                 }
//                                 variant={
//                                   discountDetails ? "discount" : "normal"
//                                 }
//                               />

//                               {discountDetails && (
//                                 <p className="text-xs text-purple-600 mt-2">
//                                   💰 Zostanie zwrócone:{" "}
//                                   <strong>
//                                     {order.totalAmount.toFixed(2)} zł
//                                   </strong>{" "}
//                                   (kwota po zniżce)
//                                 </p>
//                               )}
//                             </div>

//                             {/* Partial refund - only WITHOUT coupon */}
//                             {!discountDetails && canPartialRefund && (
//                               <div className="border border-gray-300 rounded-lg p-4">
//                                 <h5 className="font-medium text-gray-800 mb-2">
//                                   Refund of selected products
//                                 </h5>
//                                 <p className="text-sm text-gray-600 mb-3">
//                                   Wybierz konkretne produkty i ilości do zwrotu.
//                                 </p>
//                                 <button
//                                   onClick={() =>
//                                     setOrderForPartialRefund(order._id)
//                                   }
//                                   className="w-full px-4 py-2 border border-orange-500 text-orange-600 rounded hover:bg-orange-50"
//                                 >
//                                   Wybierz produkty do zwrotu
//                                 </button>
//                               </div>
//                             )}

//                             {/* Message when partial refund not available due to coupon */}
//                             {discountDetails && (
//                               <div className="border border-orange-300 bg-orange-50 rounded-lg p-4">
//                                 <h5 className="font-medium text-orange-800 mb-2">
//                                   ⚠️ Zwrot wybranych produktów
//                                 </h5>
//                                 <p className="text-sm text-orange-700 mb-3">
//                                   Częściowy zwrot jest niemożliwy dla zamówień z
//                                   kuponem. Aby zwrócić wybrane produkty,
//                                   skontaktuj się z obsługą klienta.
//                                 </p>
//                                 <button
//                                   disabled
//                                   className="w-full px-4 py-2 border border-orange-300 text-orange-500 bg-orange-100 rounded cursor-not-allowed"
//                                 >
//                                   Niedostępne (kupon)
//                                 </button>
//                               </div>
//                             )}
//                           </div>

//                           {/* Return Process Information */}
//                           <div className="bg-blue-50 border border-blue-200 rounded p-4">
//                             <h5 className="font-medium text-blue-800 mb-2">
//                               ℹ️ Informacje o zwrocie
//                             </h5>
//                             <ul className="text-sm text-blue-700 space-y-1">
//                               <li>
//                                 • Środki zostaną zwrócone na kartę płatniczą w
//                                 ciągu 5-10 dni roboczych
//                               </li>
//                               {discountDetails && (
//                                 <li>
//                                   • W zamówieniach z kuponem możliwy jest tylko
//                                   pełny zwrot całego zamówienia
//                                 </li>
//                               )}
//                               <li>
//                                 • Dostęp do zwróconych produktów zostanie
//                                 zablokowany
//                               </li>
//                               <li>• Otrzymasz potwierdzenie zwrotu na email</li>
//                               <li>
//                                 • W przypadku pytań skontaktuj się z supportem
//                               </li>
//                             </ul>
//                           </div>
//                         </div>
//                       )}

//                       {order.status === "pending" && (
//                         <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
//                           <p className="text-yellow-700">
//                             ⏳ Zamówienie oczekuje na płatność. Po opłaceniu
//                             będziesz mógł skorzystać z opcji zwrotu.
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* Invoice */}
//                 {order.invoiceDetails?.invoicePdf && (
//                   <a
//                     href={order.invoiceDetails.invoicePdf}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm ml-3"
//                   >
//                     <svg
//                       className="w-4 h-4 mr-2"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                       />
//                     </svg>
//                     Pobierz PDF
//                   </a>
//                 )}

//                 {order.invoiceDetails?.invoiceNumber && (
//                   <p className="text-sm text-gray-600 mt-2">
//                     Numer faktury:{" "}
//                     <span className="font-medium">
//                       {order.invoiceDetails.invoiceNumber}
//                     </span>
//                   </p>
//                 )}

//                 {/* User Resources */}
//                 {!order.refundedAt &&
//                   order.userResources &&
//                   order.userResources.length > 0 && (
//                     <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
//                       <h4 className="font-semibold text-green-800 mb-2">
//                         📚 Twoje zasoby
//                       </h4>
//                       <p className="text-sm text-green-700 mb-2">
//                         Dostęp do zakupionych materiałów:
//                       </p>
//                       <ul className="space-y-2">
//                         {order.userResources.map(
//                           (resource: any, idx: number) => (
//                             <li key={idx} className="text-sm text-green-600">
//                               • {resource.title}
//                               {resource.chapters && (
//                                 <span className="text-xs text-green-500 ml-2">
//                                   ({resource.chapters.length} rozdziałów)
//                                 </span>
//                               )}
//                             </li>
//                           ),
//                         )}
//                       </ul>
//                     </div>
//                   )}
//               </div>
//             )}
//           </div>
//         );
//       })}

//       {/* Partial Return Modal */}
//       {orderForPartialRefund && (
//         <PartialRefundModal
//           order={userOrders.find((o) => o._id === orderForPartialRefund)!}
//           isOpen={!!orderForPartialRefund}
//           onClose={closePartialRefundModal}
//           onRefundSuccess={handleRefundSubmitted}
//         />
//       )}
//     </div>
//   );
// };

// export default UserOrders;
