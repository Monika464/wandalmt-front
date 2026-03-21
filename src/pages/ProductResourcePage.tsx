import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProductById } from "../store/slices/productSlice";
import { fetchResourceByProductId } from "../store/slices/resourceSlice";
import { useTranslation } from "react-i18next";
import type { Product, IResource } from "../types/types";
import type { RootState, AppDispatch } from "../store";
import { formatCurrency } from "../utils/formatcurremcy";
import ViewResource from "../components/resources/ViewResource";
import EditResourceForm from "../components/resources/EditResourceForm";
import CreateResourceForm from "../components/resources/CreateResourceForm";

export default function ProductResourcePage() {
  const { productId } = useParams<{ productId: string }>();
  const { i18n, t } = useTranslation();

  const dispatch = useDispatch<AppDispatch>();

  const product: Product | undefined = useSelector((state: RootState) =>
    productId ? state.products.byId[productId] : undefined,
  );

  const resource: IResource | undefined = useSelector((state: RootState) =>
    productId ? state.resources.resourcesByProductId[productId] : undefined,
  );

  const [creatingResourceProduct, setCreatingResourceProduct] =
    useState<Product | null>(null);
  const [editingResource, setEditingResource] = useState<IResource | null>(
    null,
  );
  const [viewingResource, setViewingResource] = useState<IResource | null>(
    null,
  );
  const [refreshView, setRefreshView] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchProductById(productId)),
          dispatch(
            fetchResourceByProductId({
              productId,
              language: i18n.language as "pl" | "en",
            }),
          ),
        ]);
      } catch (error) {
        console.error("❌ Error in initial fetch:", error);
      }
    };

    fetchData();
  }, [productId, dispatch, refreshView, i18n.language]);

  if (!product) {
    return <p>{t("product.notFound")}</p>;
  }

  // Check if the product language matches the current language
  if (product.language && product.language !== i18n.language) {
    return (
      <div className="p-4">
        <p className="text-yellow-600">
          {t("product.languageMismatch", {
            language:
              product.language === "pl"
                ? t("languages.polish").toLowerCase()
                : t("languages.english").toLowerCase(),
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header with product title */}
      <h1 className="text-2xl font-bold mb-4">
        {t("resource.productTitle")}: {product.title}
      </h1>

      {/* Product Image */}
      <img
        src={product.imageUrl}
        alt={product.title}
        className="w-full max-w-md h-64 object-cover rounded-md mb-4"
      />

      {/* Product Description */}
      <p className="text-gray-600 mb-2">{product.description}</p>

      {/* Product Price */}
      <p className="font-bold text-lg text-blue-600 mb-2">
        {formatCurrency(product.price)}
      </p>

      {/* Information about product language */}
      <div className="mt-2 text-sm bg-gray-50 p-2 rounded inline-block">
        <span className="text-gray-500">{t("product.language")}: </span>
        <span className="font-medium">
          {product.language === "pl"
            ? `🇵🇱 ${t("languages.polish")}`
            : `🇬🇧 ${t("languages.english")}`}
        </span>
      </div>

      {/* Section for resources */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">{t("resource.title")}:</h2>

        {resource ? (
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <p className="mb-2">
              <span className="font-medium">{t("resource.name")}:</span>{" "}
              {resource.title}
            </p>
            <p className="mb-2">
              <span className="font-medium">{t("resource.description")}:</span>{" "}
              {resource.description}
            </p>

            {/* Information about resource language */}
            <div className="mt-2 text-sm bg-gray-50 p-2 rounded inline-block">
              <span className="text-gray-500">{t("resource.language")}: </span>
              <span className="font-medium">
                {resource.language === "pl"
                  ? `🇵🇱 ${t("languages.polish")}`
                  : `🇬🇧 ${t("languages.english")}`}
              </span>
            </div>

            {/* Action buttons for the resource */}
            <div className="mt-4">
              {!editingResource && !viewingResource && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingResource(resource)}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  >
                    {t("resource.edit")}
                  </button>
                  <button
                    onClick={() => setViewingResource(resource)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    {t("resource.view")}
                  </button>
                </div>
              )}

              {(editingResource || viewingResource) && (
                <p className="text-gray-500 text-sm italic">
                  {editingResource
                    ? t("resource.editModeActive")
                    : t("resource.viewModeActive")}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-700 mb-3">{t("resource.noResource")}</p>
            <button
              onClick={() => setCreatingResourceProduct(product)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              {t("resource.add")}
            </button>
          </div>
        )}

        {/* Resource creation form */}
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

        {/* Resource editing form */}
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

        {/* Resource preview */}
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
