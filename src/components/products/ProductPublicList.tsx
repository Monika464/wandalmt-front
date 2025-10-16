import { useEffect, useState } from "react";

import ProductPublicItem from "./ProductPublicItem";
import { fetchProducts } from "../../store/slices/productPublicSlice";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";

import { useNavigate } from "react-router-dom";
import AddToCartButton from "./AddToCartButton";
import SearchPublicContainer from "./SearchContainerPublic";
import Navbar from "../elements/Navbar";

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { products, loading, error } = useSelector(
    (state: RootState) => state.productsPublic
  );

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <Navbar />
      <br></br>
      <SearchPublicContainer>
        {products.map((product) => {
          return (
            <div key={product._id} className="relative">
              <ProductPublicItem {...product} />

              <button
                onClick={() => navigate(`/products/${product._id}`)}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Show detail
              </button>
              <AddToCartButton
                product={{
                  _id: product._id,
                  title: product.title,
                  price: product.price,
                }}
              />
            </div>
          );
        })}
      </SearchPublicContainer>
    </div>
  );
};

export default ProductList;
