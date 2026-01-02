import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProductById } from "../store/slices/productSlice";
import { fetchResourceByProductId } from "../store/slices/resourceSlice";
//import { fetchResources } from "../store/slices/resourceSlice";

import type { Product, IResource } from "../types";
import type { RootState, AppDispatch } from "../store";
import { formatCurrency } from "../utils/formatcurremcy";
import ViewResource from "../components/resources/ViewResource";
import EditResourceForm from "../components/resources/EditResourceForm";
import CreateResourceForm from "../components/resources/CreateResourceForm";

export default function ProductResourcePage() {
  const { productId } = useParams<{ productId: string }>();

  //console.log("id changed:", productId);
  const dispatch = useDispatch<AppDispatch>();

  const product: Product | undefined = useSelector((state: RootState) =>
    productId ? state.products.byId[productId] : undefined
  );

  const resource: IResource | undefined = useSelector((state: RootState) =>
    productId ? state.resources.resourcesByProductId[productId] : undefined
  );

  //console.log("resurce from state:", resource);

  const [creatingResourceProduct, setCreatingResourceProduct] =
    useState<Product | null>(null);
  const [editingResource, setEditingResource] = useState<IResource | null>(
    null
  );
  const [viewingResource, setViewingResource] = useState<IResource | null>(
    null
  );
  const [refreshView, setRefreshView] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchProductById(productId)),
          dispatch(fetchResourceByProductId(productId)),
          // .unwrap()
          // .then(() => console.log("✅ thunk resolved"))
          // .catch((e) => console.error("❌ thunk rejected", e)),

          //dispatch(fetchResources(productId)),
        ]);
        //console.log("✅ Initial data fetch completed");
      } catch (error) {
        console.error("❌ Error in initial fetch:", error);
      }
    };

    fetchData();
  }, [productId, dispatch, refreshView]);

  if (!product) {
    //console.log("❌ NO PRODUCT FOUND");
    return <p>Nie znaleziono produktu</p>;
  }

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
            <p>
              <strong>Tytuł:</strong> {resource.title}
            </p>
            <p>
              <strong>Opis:</strong> {resource.description}
            </p>
            <div className="mt-2">
              {!editingResource && !viewingResource && (
                <>
                  <button
                    onClick={() => setEditingResource(resource)}
                    className="px-3 py-1 bg-purple-500 text-white rounded mr-2"
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
              {(editingResource || viewingResource) && (
                <p className="text-gray-500 text-sm italic">
                  {editingResource
                    ? "Tryb edycji aktywny"
                    : "Podgląd zasobu aktywny"}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-yellow-600">Brak zasobu dla tego produktu</p>
            <button
              onClick={() => setCreatingResourceProduct(product)}
              className="px-3 py-1 bg-green-500 text-white rounded mt-2"
            >
              Dodaj zasób
            </button>
          </div>
        )}

        {creatingResourceProduct?._id === product._id && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <CreateResourceForm
              productId={creatingResourceProduct._id}
              onClose={() => setCreatingResourceProduct(null)}
              onSuccess={async () => {
                setCreatingResourceProduct(null);
                setRefreshView((prev) => !prev);
              }}
            />
          </div>
        )}

        {editingResource && editingResource.productId === product._id && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            <EditResourceForm
              resource={editingResource}
              onClose={() => {
                setEditingResource(null);
                setRefreshView((prev) => !prev);
              }}
            />
          </div>
        )}

        {viewingResource && viewingResource.productId === product._id && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-100">
            <ViewResource
              resource={viewingResource}
              onClose={() => setViewingResource(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
