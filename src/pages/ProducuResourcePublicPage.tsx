import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchProductById } from "../store/slices/productPublicSlice";
import { fetchResourceByProductId } from "../store/slices/resourcePublicSlice";

import type { Product, IResource } from "../types";
import type { RootState, AppDispatch } from "../store";
import { formatCurrency } from "../utils/formatcurremcy";
import ViewPublicResource from "../components/resources/ViewPublicResource";
import AddToCartButton from "../components/products/AddToCartButton";
import CheckoutButton from "../components/products/CheckoutButton";

export default function ProductResourcePage() {
  const { productId } = useParams<{ productId: string }>();

  //console.log("id changed:", productId);
  const dispatch = useDispatch<AppDispatch>();

  const product: Product | undefined = useSelector((state: RootState) =>
    productId ? state.productsPublic.byId[productId] : undefined
  );

  //console.log("hello", productId);

  const resource: IResource | undefined = useSelector((state: RootState) =>
    productId
      ? state.resourcesPublic.resourcesByProductId[productId]
      : undefined
  );

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
  }, [productId, dispatch]);

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
          </div>
        ) : (
          <div>
            <p className="text-yellow-600">Produkt w przygotowaniu</p>
          </div>
        )}

        <div className="mt-4 p-4 border rounded-lg bg-gray-100">
          {resource ? <ViewPublicResource resource={resource} /> : "loading.."}
        </div>
        <AddToCartButton product={product} />
        <CheckoutButton productId={productId!} />
      </div>
    </div>
  );
}
