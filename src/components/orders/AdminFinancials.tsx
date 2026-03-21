import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders } from "../../store/slices/orderSlice";
import { useEffect } from "react";
import type { AppDispatch, RootState } from "../../store";
import type { Order } from "../../store/slices/orderSlice";
import { useTranslation } from "react-i18next";

const AdminFinancials: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { allOrders, loading, error } = useSelector(
    (state: RootState) => state.orders,
  );

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  if (loading)
    return <p className="text-center py-4">{t("financial.loading")}</p>;
  if (error)
    return (
      <p className="text-red-500 text-center py-4">
        {t("common.error")}: {error}
      </p>
    );
  if (!allOrders || allOrders.length === 0)
    return <p className="text-center py-4">{t("financial.noOrders")}</p>;

  // Helper function to get the product price
  const getProductPrice = (productItem: any): number => {
    if (productItem.product && typeof productItem.product === "object") {
      return productItem.product.price || 0;
    } else {
      return productItem.price || 0;
    }
  };

  // Helper function to get the product title
  const getProductTitle = (productItem: any): string => {
    if (productItem.product && productItem.product.title) {
      return productItem.product.title;
    } else if (productItem.title) {
      return productItem.title;
    }
    return t("financial.unknownProduct");
  };

  // Calculate revenues including refunds
  const calculateOrderValue = (order: Order): number => {
    return order.products.reduce((sum, item) => {
      const price = getProductPrice(item);
      const quantity = item.quantity || 1;
      const refundQuantity = item.refundQuantity || 0;
      const nonRefundedQuantity = Math.max(0, quantity - refundQuantity);
      return sum + price * nonRefundedQuantity;
    }, 0);
  };

  const calculateOriginalOrderValue = (order: Order): number => {
    return order.products.reduce((sum, item) => {
      const price = getProductPrice(item);
      const quantity = item.quantity || 1;
      return sum + price * quantity;
    }, 0);
  };

  // Calculate all revenues
  const totalRevenue = allOrders.reduce((sum, order) => {
    return sum + calculateOrderValue(order);
  }, 0);

  const originalRevenue = allOrders.reduce((sum, order) => {
    return sum + calculateOriginalOrderValue(order);
  }, 0);

  const totalRefunds = originalRevenue - totalRevenue;

  // Order statistics
  const ordersByStatus = {
    paid: allOrders.filter((o) => o.status === "paid" && !o.refundedAt).length,
    pending: allOrders.filter((o) => o.status === "pending").length,
    refunded: allOrders.filter((o) => o.status === "refunded" || o.refundedAt)
      .length,
    partially_refunded: allOrders.filter(
      (o) => o.status === "partially_refunded",
    ).length,
    failed: allOrders.filter((o) => o.status === "failed").length,
    canceled: allOrders.filter((o) => o.status === "canceled").length,
  };

  // Monthly revenues
  const monthlyRevenue: Record<string, number> = {};
  allOrders.forEach((order) => {
    const date = new Date(order.paidAt || order.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyRevenue[monthKey] =
      (monthlyRevenue[monthKey] || 0) + calculateOrderValue(order);
  });

  const sortedMonths = Object.keys(monthlyRevenue).sort().reverse().slice(0, 6);

  // Top products
  const productSales: Record<
    string,
    { title: string; revenue: number; sales: number; refunds: number }
  > = {};
  allOrders.forEach((order) => {
    order.products.forEach((item) => {
      const title = getProductTitle(item);
      const price = getProductPrice(item);
      const quantity = item.quantity || 1;
      const refundQuantity = item.refundQuantity || 0;
      const soldQuantity = quantity - refundQuantity;

      if (!productSales[title]) {
        productSales[title] = { title, revenue: 0, sales: 0, refunds: 0 };
      }

      productSales[title].revenue += price * soldQuantity;
      productSales[title].sales += soldQuantity;
      productSales[title].refunds += refundQuantity;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const monthNames = t("financial.months", { returnObjects: true }) as string[];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        📊 {t("financial.title")}
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <h3 className="text-lg font-semibold text-green-700">
            {t("financial.currentRevenue")}
          </h3>
          <p className="text-3xl font-bold text-green-800">
            {totalRevenue.toFixed(2)} {t("financial.currency")}
          </p>
          <p className="text-sm text-green-600 mt-1">
            {t("financial.afterRefunds", { amount: totalRefunds.toFixed(2) })}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-700">
            {t("financial.totalSales")}
          </h3>
          <p className="text-3xl font-bold text-blue-800">
            {originalRevenue.toFixed(2)} {t("financial.currency")}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            {t("financial.beforeRefunds")}
          </p>
        </div>

        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <h3 className="text-lg font-semibold text-red-700">
            {t("financial.totalRefunds")}
          </h3>
          <p className="text-3xl font-bold text-red-800">
            {totalRefunds.toFixed(2)} {t("financial.currency")}
          </p>
          <p className="text-sm text-red-600 mt-1">
            {t("financial.fullAndPartial")}
          </p>
        </div>
      </div>

      {/* Order Statuses */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">
          {t("financial.orderStatus")}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>
              {t("financial.paid")}: <strong>{ordersByStatus.paid}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>
              {t("financial.pending")}:{" "}
              <strong>{ordersByStatus.pending}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>
              {t("financial.refunded")}:{" "}
              <strong>{ordersByStatus.refunded}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>
              {t("financial.partiallyRefunded")}:{" "}
              <strong>{ordersByStatus.partially_refunded}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>
              {t("financial.canceled")}:{" "}
              <strong>{ordersByStatus.canceled}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <span>
              {t("financial.failed")}: <strong>{ordersByStatus.failed}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">
          🏆 {t("financial.topProducts")}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {t("financial.product")}
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {t("financial.revenue")}
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {t("financial.sales")}
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {t("financial.refunds")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProducts.map((product, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {product.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-semibold">
                    {product.revenue.toFixed(2)} {t("financial.currency")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {product.sales} {t("financial.pcs")}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-600">
                    {product.refunds} {t("financial.pcs")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly revenues */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">
          📈 {t("financial.monthlyRevenue")}
        </h3>
        <div className="space-y-3">
          {sortedMonths.map((month) => {
            const [year, monthNum] = month.split("-");
            const monthName = monthNames[parseInt(monthNum) - 1];

            return (
              <div key={month} className="flex items-center justify-between">
                <span className="text-gray-700">
                  {monthName} {year}
                </span>
                <span className="font-semibold text-green-600">
                  {monthlyRevenue[month].toFixed(2)} {t("financial.currency")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* List of all orders */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3 text-gray-700">
          📋 {t("financial.allOrders")} ({allOrders.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {t("financial.date")}
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {t("financial.customer")}
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {t("financial.products")}
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {t("financial.value")}
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {t("financial.status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allOrders.map((order) => {
                const orderValue = calculateOrderValue(order);
                const originalValue = calculateOriginalOrderValue(order);
                const refundAmount = originalValue - orderValue;

                return (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(
                        order.paidAt || order.createdAt,
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {order.user?.email || t("financial.noEmail")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {order.products.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="truncate max-w-xs">
                          {getProductTitle(item)} × {item.quantity || 1}
                          {item.refundQuantity && item.refundQuantity > 0 && (
                            <span className="text-red-500 text-xs ml-1">
                              ({t("financial.refunded")} {item.refundQuantity})
                            </span>
                          )}
                        </div>
                      ))}
                      {order.products.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{order.products.length - 2} {t("financial.more")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-semibold text-gray-900">
                        {orderValue.toFixed(2)} {t("financial.currency")}
                      </div>
                      {refundAmount > 0 && (
                        <div className="text-xs text-red-500">
                          -{refundAmount.toFixed(2)} {t("financial.currency")}{" "}
                          {t("financial.refund")}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${order.status === "paid" ? "bg-green-100 text-green-800" : ""}
                        ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                        ${order.status === "refunded" ? "bg-red-100 text-red-800" : ""}
                        ${order.status === "partially_refunded" ? "bg-orange-100 text-orange-800" : ""}
                        ${order.status === "failed" ? "bg-gray-100 text-gray-800" : ""}
                        ${order.status === "canceled" ? "bg-gray-100 text-gray-800" : ""}
                      `}
                      >
                        {order.status === "paid" && t("financial.paid")}
                        {order.status === "pending" && t("financial.pending")}
                        {order.status === "refunded" && t("financial.refunded")}
                        {order.status === "partially_refunded" &&
                          t("financial.partiallyRefunded")}
                        {order.status === "failed" && t("financial.failed")}
                        {order.status === "canceled" && t("financial.canceled")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFinancials;
