import { useEffect, useState } from "react";
import ProductPublicItem from "./ProductPublicItem";
import { fetchProducts } from "../../store/slices/productPublicSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { useNavigate } from "react-router-dom";
import AddToCartButton from "../orders/AddToCartButton";
import SearchPublicContainer from "./SearchContainerPublic";
import { useTranslation } from "react-i18next";

import { Eye } from "lucide-react";

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");

  const { products, loading, error } = useSelector(
    (state: RootState) => state.productsPublic,
  );

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  const filteredProducts = products
    .filter((product) => product.language === i18n.language)
    .filter(
      (product) =>
        (product.title &&
          product.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm.toLowerCase())),
    );

  if (loading) return <p>{t("product.loading")}</p>;
  if (error)
    return (
      <p className="text-red-500">
        {t("product.error")}: {error}
      </p>
    );

  return (
    <div>
      <br />

      <SearchPublicContainer onSearch={setSearchTerm} />

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
          >
            <ProductPublicItem {...product} />

            {/* Container with buttons - both the same */}
            <div className="p-4 flex flex-col sm:flex-row gap-2">
              {/* Left click - details */}
              <div className="sm:flex-1">
                <button
                  onClick={() => navigate(`/products/${product._id}`)}
                  className="
                    w-full 
                    px-6 py-3 
                    bg-blue-500 text-white 
                    rounded-lg 
                    hover:bg-blue-600 
                    transition-all 
                    duration-300 
                    font-medium
                    flex items-center justify-center gap-2
                    shadow-md hover:shadow-lg
                    transform hover:-translate-y-0.5
                    text-base
                  "
                >
                  <Eye size={20} />
                  {t("product.showDetail")}
                </button>
              </div>

              {/* Right click - add to cart */}
              <div className="sm:flex-1">
                <AddToCartButton
                  product={{
                    _id: product._id,
                    title: product.title,
                    price: product.price,
                  }}
                  variant="medium"
                  color="green"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
