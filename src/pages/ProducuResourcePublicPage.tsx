import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProductById } from "../store/slices/productPublicSlice";
import { fetchResourceByProductId } from "../store/slices/resourcePublicSlice";
import { useTranslation } from "react-i18next";

import type { Product, IResource } from "../types/types";
import type { RootState, AppDispatch } from "../store";
import { formatCurrency } from "../utils/formatcurremcy";
import ViewPublicResource from "../components/resources/ViewPublicResource";
import AddToCartButton from "../components/orders/AddToCartButton";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";

export default function ProductResourcePage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [showResource, setShowResource] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const product: Product | undefined = useSelector((state: RootState) =>
    productId ? state.productsPublic.byId[productId] : undefined,
  );

  const resource: IResource | undefined = useSelector((state: RootState) =>
    productId
      ? state.resourcesPublic.resourcesByProductId[productId]
      : undefined,
  );

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchProductById(productId)),
          dispatch(fetchResourceByProductId(productId)),
        ]);
      } catch (error) {
        console.error("❌ Error in initial fetch:", error);
      }
    };

    fetchData();
  }, [productId, dispatch]);

  if (!product) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{t("product.notFound")}</p>
        <button
          onClick={() => navigate("/products")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t("product.backToList")}
        </button>
      </div>
    );
  }

  // Sprawdzenie zgodności języka
  const languageMismatch =
    product.language && product.language !== i18n.language;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Przycisk powrotu */}
      <button
        onClick={() => navigate("/products")}
        className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-6 transition-colors group"
      >
        <ArrowLeft
          size={20}
          className="group-hover:-translate-x-1 transition-transform"
        />
        <span>{t("product.backToList")}</span>
      </button>

      {/* Ostrzeżenie o niezgodności języka */}
      {languageMismatch && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          <p className="text-sm">
            {t("product.languageMismatch", {
              language:
                product.language === "pl"
                  ? t("languages.polish").toLowerCase()
                  : t("languages.english").toLowerCase(),
            })}
          </p>
        </div>
      )}

      {/* Główna karta produktu */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Zdjęcie produktu */}
          <div className="md:w-1/3">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>

          {/* Informacje o produkcie */}
          <div className="p-6 md:w-2/3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
              {product.title}
            </h1>

            <p className="text-gray-600 mb-4">{product.description}</p>

            {/* Metadane produktu */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-500">
                <BookOpen size={18} />
                <span>
                  {t("product.language")}:{" "}
                  {product.language === "pl" ? "🇵🇱 Polski" : "🇬🇧 English"}
                </span>
              </div>
              {resource?.chapters && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={18} />
                  <span>
                    {resource.chapters.length} {t("product.chapters")}
                  </span>
                </div>
              )}
            </div>

            {/* Cena */}
            <div className="text-3xl font-bold text-blue-600 mb-6">
              {formatCurrency(product.price)} {t("product.currency")}
            </div>

            {/* Przyciski akcji */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowResource(!showResource)}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                {showResource
                  ? t("product.hideChapters")
                  : t("product.showChapters")}
              </button>

              <div className="flex-1">
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sekcja zasobów */}
      {showResource && (
        <div className="mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t("product.courseContent")}
          </h2>

          {resource ? (
            <ViewPublicResource resource={resource} />
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">{t("product.noContent")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// import { useParams, useNavigate } from "react-router-dom"; // 👈 Dodaj useNavigate
// import { useSelector, useDispatch } from "react-redux";
// import { useEffect, useState } from "react";
// import { fetchProductById } from "../store/slices/productPublicSlice";
// import { fetchResourceByProductId } from "../store/slices/resourcePublicSlice";

// import type { Product, IResource } from "../types/types";
// import type { RootState, AppDispatch } from "../store";
// import { formatCurrency } from "../utils/formatcurremcy";
// import ViewPublicResource from "../components/resources/ViewPublicResource";
// import AddToCartButton from "../components/orders/AddToCartButton";

// export default function ProductResourcePage() {
//   const { productId } = useParams<{ productId: string }>();
//   const navigate = useNavigate(); // 👈 Hook do nawigacji
//   const [showResource, setShowResource] = useState(false);

//   const dispatch = useDispatch<AppDispatch>();

//   const product: Product | undefined = useSelector((state: RootState) =>
//     productId ? state.productsPublic.byId[productId] : undefined,
//   );

//   const resource: IResource | undefined = useSelector((state: RootState) =>
//     productId
//       ? state.resourcesPublic.resourcesByProductId[productId]
//       : undefined,
//   );

//   useEffect(() => {
//     if (!productId) return;

//     const fetchData = async () => {
//       try {
//         await Promise.all([
//           dispatch(fetchProductById(productId)),
//           dispatch(fetchResourceByProductId(productId)),
//         ]);
//       } catch (error) {
//         console.error("❌ Error in initial fetch:", error);
//       }
//     };

//     fetchData();
//   }, [productId, dispatch]);

//   if (!product) {
//     return <p>Nie znaleziono produktu</p>;
//   }

//   return (
//     <>
//       <div className="p-4">
//         {/* 👇 Strzałka powrotu do listy produktów */}
//         <button
//           onClick={() => navigate("/products")}
//           className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-4 transition-colors"
//         >
//           <svg
//             className="w-5 h-5"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M10 19l-7-7m0 0l7-7m-7 7h18"
//             />
//           </svg>
//           <span>Powrót do listy produktów</span>
//         </button>

//         <h1 className="text-xl font-bold">Produkt: {product.title}</h1>
//         <img
//           src={product.imageUrl}
//           alt={product.title}
//           className="h-40 object-cover rounded-md"
//         />
//         <p className="text-sm text-gray-600">{product.description}</p>
//         <p className="font-bold">{formatCurrency(product.price)}</p>

//         <div className="mt-4">
//           <h2 className="text-lg">Zawartość kursu:</h2>
//           {resource ? (
//             <div>
//               <p>
//                 <strong>Tytuł:</strong> {resource.title}
//               </p>
//               <p>
//                 <strong>Opis:</strong> {resource.content}
//               </p>
//             </div>
//           ) : (
//             <div>
//               <p className="text-yellow-600">Produkt w przygotowaniu</p>
//             </div>
//           )}

//           {/* 👇 Flex container z przyciskami - Pokaż zawartość po lewej, Add to Cart po prawej */}
//           <div className="mt-4 flex justify-between items-center gap-4">
//             <button
//               onClick={() => setShowResource(!showResource)}
//               className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//             >
//               {showResource ? "Ukryj rozdziały" : "Pokaż rozdziały"}
//             </button>

//             <AddToCartButton product={product} />
//           </div>

//           {/* 👇 Warunkowe wyświetlanie zasobu */}
//           {showResource && (
//             <div className="mt-4 p-4 border rounded-lg bg-gray-100">
//               {resource ? (
//                 <ViewPublicResource resource={resource} />
//               ) : (
//                 "loading.."
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }
