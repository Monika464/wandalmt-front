// src/components/ProductList.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchProducts } from "../../store/slices/productSlice";
import ProductItem from "./ProductItem";
import type { Product } from "../../types";

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleEdit = (id: string) => {
    console.log("Edytuj produkt", id);
    // TODO: otwarcie formularza edycji
  };

  const handleViewResource = (id: string) => {
    console.log("Pokaż zasób dla produktu", id);
    // TODO: przekierowanie do ResourceView
  };

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product: Product) => (
        <ProductItem
          key={product._id}
          {...product}
          onEdit={handleEdit}
          onViewResource={handleViewResource}
        />
      ))}
    </div>
  );
};

export default ProductList;
