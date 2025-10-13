import { useEffect, useState } from "react";

//import EditProductForm from "./EditProductForm";
import ProductPublicItem from "./ProductPublicItem";
import { fetchProducts } from "../../store/slices/productPublicSlice";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";

import { useNavigate } from "react-router-dom";
//import CreateProductForm from "./CreateProductForm";

//import SearchContainer from "./SearchContainer";
import AddToCartButton from "./AddToCartButton";
import SearchPublicContainer from "./SearchContainerPublic";

// ...
const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { products, loading, error } = useSelector(
    (state: RootState) => state.productsPublic
  );
  console.log("prod", products);
  //const [editingProductId, setEditingProductId] = useState<string | null>(null);
  //const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  //const handleCloseEditProduct = () => setEditingProductId(null);

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <br></br>
      <SearchPublicContainer>
        {products.map((product) => {
          // const resource = resourcesByProductId[product._id];

          //console.log("id produktu:", product._id);

          return (
            <div key={product._id} className="relative">
              <ProductPublicItem
                {...product}
                // onEdit={() => setEditingProductId(product._id)}
              />

              <button
                onClick={() => navigate(`/products/${product._id}`)}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Show detail
              </button>
              <AddToCartButton />
            </div>
          );
        })}
      </SearchPublicContainer>
    </div>
  );
};

export default ProductList;
