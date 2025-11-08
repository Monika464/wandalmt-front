import { useEffect, useState } from "react";
//import { fetchResource } from "../../store/slices/resourceSlice";
//import CreateResourceForm from "../resources/CreateResourceForm";
//import EditResourceForm from "../resources/EditResourceForm";
//import ViewResource from "../resources/ViewResource";
import EditProductForm from "./EditProductForm";
import ProductItem from "./ProductItem";
import { fetchProducts } from "../../store/slices/productSlice";
//import type { Product } from "../../types";
//import type { IResource } from "../../types";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";

import { useNavigate } from "react-router-dom";
import CreateProductForm from "./CreateProductForm";

import SearchContainer from "./SearchContainer";

// ...
const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { products, loading, error } = useSelector(
    (state: RootState) => state.products
  );

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  const handleCloseEditProduct = () => setEditingProductId(null);

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <br></br>
      <SearchContainer>
        {Array.isArray(products) &&
          products
            .filter(
              (product): product is { _id: string } =>
                !!product && !!product._id
            )
            .map((product) => (
              <div key={product._id} className="relative">
                <ProductItem
                  {...product}
                  onEdit={() => setEditingProductId(product._id)}
                />

                {editingProductId === product._id && (
                  <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                    <EditProductForm
                      product={product}
                      onClose={handleCloseEditProduct}
                    />
                  </div>
                )}

                <button
                  onClick={() => navigate(`/admin/products/${product._id}`)}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Edytuj zasoby produktu
                </button>
              </div>
            ))}
      </SearchContainer>
      <br></br>
      <br></br>
      <br></br>
      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {showForm ? "Close Create Product" : "Open Create Product"}
      </button>
      {showForm && <CreateProductForm />}
      <br></br>
      <br></br>
      <br></br>
    </div>
  );
};

export default ProductList;
