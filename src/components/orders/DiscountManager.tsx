import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface Discount {
  _id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed" | "product";
  value: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string | null;
  userId: string | null;
  productId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const DiscountManager: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "percentage" as "percentage" | "fixed" | "product",
    value: 10,
    minPurchaseAmount: 0,
    maxDiscountAmount: "",
    maxUses: "",
    userId: "",
    productId: "",
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: "",
    isActive: true,
  });

  useEffect(() => {
    fetchDiscounts();
  }, [pagination.page, search, isActiveFilter]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(isActiveFilter !== "all" && { isActive: isActiveFilter }),
      });

      const response = await axios.get(`/admin/discounts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDiscounts(response.data.discounts);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error("Error fetching discounts:", error);
      toast.error(t("discount.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with data:", formData);

    try {
      const payload = {
        ...formData,
        maxDiscountAmount: formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        userId: formData.userId || null,
        productId: formData.productId || null,
        validUntil: formData.validUntil || null,
      };

      // await axios.post(
      //   `${import.meta.env.VITE_API_URL}/admin/discounts`,
      //   payload,
      //   {
      //     headers: { Authorization: `Bearer ${token}` },
      //   },
      // );

      await axios.post("/admin/discounts", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(t("discount.createSuccess"));
      setShowForm(false);
      resetForm();
      fetchDiscounts();
    } catch (error: any) {
      console.error("Error creating discount:", error);
      toast.error(error.response?.data?.error || t("discount.createError"));
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      minPurchaseAmount: discount.minPurchaseAmount,
      maxDiscountAmount: discount.maxDiscountAmount?.toString() || "",
      maxUses: discount.maxUses?.toString() || "",
      userId: discount.userId || "",
      productId: discount.productId || "",
      validFrom: new Date(discount.validFrom).toISOString().split("T")[0],
      validUntil: discount.validUntil
        ? new Date(discount.validUntil).toISOString().split("T")[0]
        : "",
      isActive: discount.isActive,
    });
    setShowEditForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingDiscount) return;

    try {
      const payload = {
        ...formData,
        maxDiscountAmount: formData.maxDiscountAmount
          ? parseFloat(formData.maxDiscountAmount)
          : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        userId: formData.userId || null,
        productId: formData.productId || null,
        validUntil: formData.validUntil || null,
      };

      await axios.put(`/admin/discounts/${editingDiscount._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(t("discount.updateSuccess"));
      setShowEditForm(false);
      setEditingDiscount(null);
      resetForm();
      fetchDiscounts();
    } catch (error: any) {
      console.error("Error updating discount:", error);
      toast.error(error.response?.data?.error || t("discount.updateError"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("discount.confirmDelete"))) return;

    try {
      await axios.delete(`/admin/discounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(t("discount.deleteSuccess"));
      fetchDiscounts();
    } catch (error: any) {
      console.error("Error deleting discount:", error);
      toast.error(error.response?.data?.error || t("discount.deleteError"));
    }
  };

  const toggleStatus = async (discount: Discount) => {
    try {
      await axios.put(
        `/admin/discounts/${discount._id}`,
        { isActive: !discount.isActive },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(
        t(`discount.${!discount.isActive ? "activated" : "deactivated"}`),
      );
      fetchDiscounts();
    } catch (error: any) {
      console.error("Error toggling discount status:", error);
      toast.error(t("discount.statusError"));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      type: "percentage",
      value: 10,
      minPurchaseAmount: 0,
      maxDiscountAmount: "",
      maxUses: "",
      userId: "",
      productId: "",
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: "",
      isActive: true,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("discount.noExpiry");
    return new Date(dateString).toLocaleDateString(
      t("common.locale") === "pl" ? "pl-PL" : "en-US",
    );
  };

  const formatDiscountValue = (discount: Discount) => {
    if (discount.type === "percentage") {
      return `${discount.value}%`;
    } else if (discount.type === "fixed") {
      return `${discount.value} ${t("financial.currency")}`;
    } else {
      return `${discount.value}% (${t("discount.product")})`;
    }
  };

  if (loading && discounts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">{t("discount.loading")}</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Nagłówek i przyciski */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t("discount.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {pagination.total} {t("discount.discounts")} • {t("discount.page")}{" "}
            {pagination.page} / {pagination.pages}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <span className="mr-2">+</span> {t("discount.newDiscount")}
        </button>
      </div>

      {/* Filtry i wyszukiwarka */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("discount.searchLabel")}
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("discount.searchPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("discount.status")}
            </label>
            <select
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t("discount.all")}</option>
              <option value="true">{t("discount.active")}</option>
              <option value="false">{t("discount.inactive")}</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                fetchDiscounts();
              }}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 w-full"
            >
              {t("discount.filter")}
            </button>
          </div>
        </div>
      </div>

      {/* Tabela kuponów */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("discount.code")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("discount.name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("discount.value")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("discount.usage")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("discount.validity")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("discount.status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {discounts.map((discount) => (
                <tr key={discount._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                        {discount.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {discount.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {discount.type === "percentage" &&
                        t("discount.percentageType")}
                      {discount.type === "fixed" && t("discount.fixedType")}
                      {discount.type === "product" && t("discount.productType")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-green-600">
                      {formatDiscountValue(discount)}
                    </div>
                    {discount.minPurchaseAmount > 0 && (
                      <div className="text-xs text-gray-500">
                        {t("discount.minPurchase")} {discount.minPurchaseAmount}{" "}
                        {t("financial.currency")}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <span className="font-medium">{discount.usedCount}</span>
                      {discount.maxUses && (
                        <span className="text-gray-500">
                          {" "}
                          / {discount.maxUses}
                        </span>
                      )}
                    </div>
                    {discount.maxUses && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{
                            width: `${Math.min((discount.usedCount / discount.maxUses) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {t("discount.from")}: {formatDate(discount.validFrom)}
                    </div>
                    <div>
                      {t("discount.to")}: {formatDate(discount.validUntil)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        discount.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {discount.isActive
                        ? t("discount.active")
                        : t("discount.inactive")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(discount)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {t("common.edit")}
                      </button>
                      <button
                        onClick={() => toggleStatus(discount)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {discount.isActive
                          ? t("discount.deactivate")
                          : t("discount.activate")}
                      </button>
                      <button
                        onClick={() => handleDelete(discount._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginacja */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.max(1, prev.page - 1),
              }))
            }
            disabled={pagination.page === 1}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← {t("pagination.previous")}
          </button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNum;
              if (pagination.pages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: pageNum }))
                  }
                  className={`px-3 py-1 rounded-md text-sm ${
                    pagination.page === pageNum
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.min(pagination.pages, prev.page + 1),
              }))
            }
            disabled={pagination.page === pagination.pages}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("pagination.next")} →
          </button>
        </div>
      )}

      {/* Modal tworzenia nowego kuponu */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {t("discount.newDiscount")}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.nameLabel")} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("discount.namePlaceholder")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.codeLabel")} *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                      placeholder="WELCOME10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.typeLabel")} *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">
                        {t("discount.percentage")}
                      </option>
                      <option value="fixed">{t("discount.fixed")}</option>
                      <option value="product">{t("discount.product")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.valueLabel")} *
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      required
                      min={formData.type === "percentage" ? 1 : 0}
                      max={formData.type === "percentage" ? 100 : undefined}
                      step={formData.type === "percentage" ? 1 : 0.01}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.minPurchaseLabel")}
                    </label>
                    <input
                      type="number"
                      name="minPurchaseAmount"
                      value={formData.minPurchaseAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.maxDiscountLabel")}
                    </label>
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("discount.noLimit")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.maxUsesLabel")}
                    </label>
                    <input
                      type="number"
                      name="maxUses"
                      value={formData.maxUses}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("discount.noLimit")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.validFrom")} *
                    </label>
                    <input
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.validUntil")}
                    </label>
                    <input
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("discount.noExpiry")}
                    />
                  </div>
                </div>

                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {t("discount.isActive")}
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {t("discount.create")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal edycji kuponu */}
      {showEditForm && editingDiscount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {t("discount.editDiscount")}:{" "}
                  <span className="font-mono">{editingDiscount.code}</span>
                </h2>
                <button
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingDiscount(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.nameLabel")} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.codeLabel")} *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.typeLabel")} *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">
                        {t("discount.percentage")}
                      </option>
                      <option value="fixed">{t("discount.fixed")}</option>
                      <option value="product">{t("discount.product")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.valueLabel")} *
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      required
                      min={formData.type === "percentage" ? 1 : 0}
                      max={formData.type === "percentage" ? 100 : undefined}
                      step={formData.type === "percentage" ? 1 : 0.01}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.minPurchaseLabel")}
                    </label>
                    <input
                      type="number"
                      name="minPurchaseAmount"
                      value={formData.minPurchaseAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.maxDiscountLabel")}
                    </label>
                    <input
                      type="number"
                      name="maxDiscountAmount"
                      value={formData.maxDiscountAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("discount.noLimit")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.maxUsesLabel")}
                    </label>
                    <input
                      type="number"
                      name="maxUses"
                      value={formData.maxUses}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("discount.noLimit")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.validFrom")} *
                    </label>
                    <input
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("discount.validUntil")}
                    </label>
                    <input
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t("discount.noExpiry")}
                    />
                  </div>
                </div>

                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="isActiveEdit"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActiveEdit"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {t("discount.isActive")}
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">
                    {t("discount.statistics")}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      {t("discount.used")}:{" "}
                      <span className="font-medium">
                        {editingDiscount.usedCount}
                      </span>
                    </div>
                    <div>
                      {t("discount.created")}:{" "}
                      <span className="font-medium">
                        {formatDate(editingDiscount.createdAt)}
                      </span>
                    </div>
                    <div>
                      {t("discount.lastEdited")}:{" "}
                      <span className="font-medium">
                        {formatDate(editingDiscount.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingDiscount(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {t("common.save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountManager;
