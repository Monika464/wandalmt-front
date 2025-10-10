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

// ...
const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { products, loading, error } = useSelector(
    (state: RootState) => state.products
  );
  // const { selected: viewingResource } = useSelector(
  //   (state: RootState) => state.resources
  // );

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  // const [creatingResourceProduct, setCreatingResourceProduct] =
  //   useState<Product | null>(null);
  // const [editingResource, setEditingResource] = useState<IResource | null>(
  //   null
  // );
  // const [viewingResource, setViewingResource] = useState<IResource | null>(
  //   null
  // );

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleCloseEditProduct = () => setEditingProductId(null);

  // useEffect(() => {
  //   products.forEach((p) => dispatch(fetchResource(p._id)));
  // }, [products, dispatch]);

  // const handleViewResource = (productId: string) => {
  //   dispatch(fetchResource(productId));
  //   console.log("Viewing resource for productId:", productId);
  // };
  // const resourcesByProductId = useSelector(
  //   (state: RootState) => state.resources.resourcesByProductId
  // );

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      {products.map((product) => {
        // const resource = resourcesByProductId[product._id];

        //console.log("Resource dla produktu:", product._id, resource);

        return (
          <div key={product._id} className="relative">
            <ProductItem
              {...product}
              // resource={resource || null}
              onEdit={() => setEditingProductId(product._id)}
              // onCreateResource={() => setCreatingResourceProduct(product)}
              //onEditResource={(resource) => setEditingResource(resource)}
              // onViewResource={() => handleViewResource(product._id)}
            />
            {/* 
            {viewingResource && viewingResource.productId === product._id && (
              <ViewResource
                resource={viewingResource}
                onClose={handleCloseViewResource}
              />
            )} */}

            {editingProductId === product._id && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <EditProductForm
                  product={product}
                  onClose={handleCloseEditProduct}
                />
              </div>
            )}

            {/* {creatingResourceProduct?._id === product._id && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <CreateResourceForm
                  productId={creatingResourceProduct._id}
                  onClose={handleCloseCreateResource}
                />
              </div>
            )} */}

            {/* {editingResource && editingResource.productId === product._id && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <EditResourceForm
                  resource={editingResource}
                  onClose={handleCloseEditResource}
                />
              </div>
            )} */}
            {/* 
            {viewingResource && viewingResource.productId === product._id && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-100">
                <ViewResource
                  resource={viewingResource}
                  onClose={handleCloseViewResource}
                />
              </div>
            )} */}
            <button
              onClick={() => navigate(`/admin/products/${product._id}`)}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              Show detail
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;
