// components/products/ProductList.tsx
import { useEffect, useState } from "react";
import EditProductForm from "./EditProductForm";
import ProductItem from "./ProductItem";
import { fetchProducts } from "../../store/slices/productSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { useNavigate } from "react-router-dom";
import CreateProductForm from "./CreateProductForm";
import SearchContainer from "./SearchContainer";
import { useTranslation } from "react-i18next";
import { Plus, X, Package } from "lucide-react";

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector(
    (state: RootState) => state.products,
  );

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  const handleCloseEditProduct = () => setEditingProductId(null);

  // Filtrowanie po języku i wyszukiwaniu
  const filteredProducts = products
    .filter((product) => product.language === i18n.language)
    .filter(
      (product) =>
        (product.title &&
          product.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm.toLowerCase())),
    );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">{t("product.loading")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md mx-auto mt-10">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-800 mb-2">
          {t("product.error")}
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => dispatch(fetchProducts({}))}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          {t("common.tryAgain")}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Nagłówek */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Package size={28} className="text-blue-500" />
            {t("admin.productManagement")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("admin.productsCount", { count: filteredProducts.length })}{" "}
            {t(`languages.${i18n.language}`)}
          </p>
        </div>

        {/* Przycisk dodawania produktu */}
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showForm
              ? "bg-gray-500 hover:bg-gray-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? t("admin.closeForm") : t("admin.addNewProduct")}
        </button>
      </div>

      {/* Wyszukiwarka */}
      <div className="mb-8">
        <SearchContainer onSearch={setSearchTerm} />
      </div>

      {/* Formularz dodawania produktu */}
      {showForm && (
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            {t("admin.newProduct")}
          </h2>
          <CreateProductForm />
        </div>
      )}

      {/* Lista produktów - RESPONSYWNY GRID */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            {t("product.noProducts")}
          </h3>
          <p className="text-gray-500">{t("product.noProductsInLanguage")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts
            .filter((product) => !!product?._id)
            .map((product) => (
              <div key={product._id} className="relative">
                {/* Karta produktu */}
                <ProductItem
                  {...product}
                  onEdit={() => setEditingProductId(product._id)}
                />

                {/* Przycisk edycji zasobów */}
                <div className="mt-3">
                  <button
                    onClick={() => navigate(`/admin/products/${product._id}`)}
                    className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    {t("admin.editResources")}
                  </button>
                </div>

                {/* Formularz edycji (rozwijany) */}
                {editingProductId === product._id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-700 mb-3">
                      {t("admin.editProduct")}
                    </h3>
                    <EditProductForm
                      product={product}
                      onClose={handleCloseEditProduct}
                    />
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Przycisk powrotu na górę (dla długich list) */}
      {filteredProducts.length > 8 && (
        <div className="text-center mt-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ↑ {t("common.backToTop")}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
