import { useDispatch } from "react-redux";
import type { ProductItemProps } from "../../types/types";
import type { AppDispatch } from "../../store";
import { deleteProduct, fetchProducts } from "../../store/slices/productSlice";
//import { formatCurrency } from "../../utils/formatcurremcy";
import { useCurrency } from "../../hooks/useCurrency";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const ProductItem: React.FC<ProductItemProps> = ({
  _id,
  title,
  description,
  price,
  imageUrl,
  onEdit,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency(); // ✅ ZMIANA: użyj hooka
  const [isDeleting, setIsDeleting] = useState(false); // ✅ DODAJ dla UX

  // const handleDelete = () => {
  //   if (window.confirm(t("product.confirmDelete"))) {
  //     dispatch(deleteProduct(_id));
  //   }
  // };

  const handleDelete = async () => {
    // ✅ ZMIANA: async
    if (window.confirm(t("product.confirmDelete"))) {
      setIsDeleting(true);
      try {
        await dispatch(deleteProduct(_id)).unwrap();
        // Odśwież listę po usunięciu
        await dispatch(fetchProducts({})).unwrap();
      } catch (error) {
        console.error("Failed to delete product:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
      {/* Product Title */}
      <h2 className="text-lg font-bold mb-2 line-clamp-2">{title}</h2>

      {/* Product Photo */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-40 object-cover rounded-md mb-3"
        />
      )}

      {/* Product Description */}
      <p className="text-sm text-gray-600 mb-2 line-clamp-3">{description}</p>

      {/* Product Price */}
      <p className="font-bold text-lg text-blue-600 mb-4">
        {/* {formatCurrency(price)} */}
        {formatPrice(price)}
      </p>

      {/* Action Buttons */}
      <div className="mt-2 flex flex-col sm:flex-row gap-2">
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm font-medium"
        >
          {t("product.edit")}
        </button>

        <button
          onClick={handleDelete}
          className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium"
        >
          {t("product.delete")}
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
