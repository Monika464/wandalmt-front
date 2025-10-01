import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchProducts } from "../../store/slices/productSlice";
import ProductItem from "./ProductItem";
import EditProductForm from "./EditProductForm";
import type { Product } from "../../types";

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleEdit = (id: string) => {
    setSelectedProductId(id);
  };

  const handleCloseForm = () => {
    setSelectedProductId(null);
  };

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Lista produktów</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="relative">
            <ProductItem
              {...product}
              onEdit={handleEdit}
              onViewResource={(id) => console.log("view resource", id)}
            />

            {selectedProductId === product._id && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <EditProductForm product={product} onClose={handleCloseForm} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
