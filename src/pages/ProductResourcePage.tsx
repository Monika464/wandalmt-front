import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { use, useEffect, useState } from "react";
import { fetchProductById } from "../store/slices/productSlice";
import { fetchResource } from "../store/slices/resourceSlice";

import type { Product, IResource } from "../types";
import type { RootState, AppDispatch } from "../store";
import { formatCurrency } from "../utils/formatcurremcy";
import ViewResource from "../components/resources/ViewResource";
import EditResourceForm from "../components/resources/EditResourceForm";
import CreateResourceForm from "../components/resources/CreateResourceForm";

export default function ProductResourcePage() {
  const { productId } = useParams<{ productId: string }>();
  // console.log("ProductId from params:", productId);

  const dispatch = useDispatch<AppDispatch>();

  // product z mapy byId
  const product: Product | undefined = useSelector((state: RootState) =>
    productId ? state.products.byId[productId] : undefined
  );

  //console.log("Product in ProductResourcePage:", product);

  // resource z mapy resourcesByProductId
  const resource: IResource | undefined = useSelector((state: RootState) =>
    productId ? state.resources.resourcesByProductId[productId] : undefined
  );

  // console.log("Resource in ProductResourcePage:", resource);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [creatingResourceProduct, setCreatingResourceProduct] =
    useState<Product | null>(null);
  const [editingResource, setEditingResource] = useState<IResource | null>(
    null
  );
  const [viewingResource, setViewingResource] = useState<IResource | null>(
    null
  );
  const [refreshView, setRefreshView] = useState(false);

  const handleCloseEditProduct = () => setEditingProductId(null);
  const handleCloseCreateResource = () => setCreatingResourceProduct(null);
  const handleCloseEditResource = () => {
    setEditingResource(null);
    handleRefreshView();
  };
  const handleCloseViewResource = () => {
    setViewingResource(null);
  };

  const handleRefreshView = () => {
    setRefreshView((prev) => !prev);
  };

  useEffect(() => {
    // console.log("🔥 useEffect fired with productId:", productId);
    if (productId) {
      dispatch(fetchProductById(productId));
      dispatch(fetchResource(productId));
    }
  }, [productId, dispatch, refreshView]);

  if (!product) return <p>Ładowanie produktu...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Produkt: {product.title}</h1>
      <img
        src={product.imageUrl}
        alt={product.title}
        className="h-40 object-cover rounded-md"
      />
      <p className="text-sm text-gray-600">{product.description}</p>
      <p className="font-bold">{formatCurrency(product.price)}</p>

      <div className="mt-4">
        <h2 className="text-lg">Zasób:</h2>
        {resource ? (
          <div>
            <p>{resource.title}</p>
          </div>
        ) : (
          <p>Brak zasobu dla tego produktu</p>
        )}
        {!resource && (
          <button
            onClick={() => setCreatingResourceProduct(product)}
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            Dodaj zasób
          </button>
        )}

        {resource && (
          <>
            <button
              onClick={() => setEditingResource(resource)}
              className="px-3 py-1 bg-purple-500 text-white rounded"
            >
              Edytuj zasób
            </button>

            <button
              onClick={() => setViewingResource(resource)}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              Pokaż zasób
            </button>
          </>
        )}
        {creatingResourceProduct?._id === product._id && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <CreateResourceForm
              productId={creatingResourceProduct._id}
              onClose={handleCloseCreateResource}
            />
          </div>
        )}

        {editingResource && editingResource.productId === product._id && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <EditResourceForm
              resource={editingResource}
              onClose={handleCloseEditResource}
            />
          </div>
        )}

        {viewingResource && viewingResource.productId === product._id && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-100">
            <ViewResource
              resource={viewingResource}
              onClose={handleCloseViewResource}
            />
          </div>
        )}
      </div>
    </div>
  );
}
