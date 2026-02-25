import { useParams, useNavigate } from "react-router-dom"; // 👈 Dodaj useNavigate
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchProductById } from "../store/slices/productPublicSlice";
import { fetchResourceByProductId } from "../store/slices/resourcePublicSlice";

import type { Product, IResource } from "../types/types";
import type { RootState, AppDispatch } from "../store";
import { formatCurrency } from "../utils/formatcurremcy";
import ViewPublicResource from "../components/resources/ViewPublicResource";
import AddToCartButton from "../components/orders/AddToCartButton";
import Navbar from "../components/elements/Navbar";

export default function ProductResourcePage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate(); // 👈 Hook do nawigacji
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
    return <p>Nie znaleziono produktu</p>;
  }

  return (
    <>
      <div className="p-4">
        {/* 👇 Strzałka powrotu do listy produktów */}
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-4 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Powrót do listy produktów</span>
        </button>

        <h1 className="text-xl font-bold">Produkt: {product.title}</h1>
        <img
          src={product.imageUrl}
          alt={product.title}
          className="h-40 object-cover rounded-md"
        />
        <p className="text-sm text-gray-600">{product.description}</p>
        <p className="font-bold">{formatCurrency(product.price)}</p>

        <div className="mt-4">
          <h2 className="text-lg">Zawartość kursu:</h2>
          {resource ? (
            <div>
              <p>
                <strong>Tytuł:</strong> {resource.title}
              </p>
              <p>
                <strong>Opis:</strong> {resource.content}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-yellow-600">Produkt w przygotowaniu</p>
            </div>
          )}

          {/* 👇 Flex container z przyciskami - Pokaż zawartość po lewej, Add to Cart po prawej */}
          <div className="mt-4 flex justify-between items-center gap-4">
            <button
              onClick={() => setShowResource(!showResource)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {showResource ? "Ukryj zawartość" : "Pokaż zawartość"}
            </button>

            <AddToCartButton product={product} />
          </div>

          {/* 👇 Warunkowe wyświetlanie zasobu */}
          {showResource && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-100">
              {resource ? (
                <ViewPublicResource resource={resource} />
              ) : (
                "loading.."
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// import { useParams } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { useEffect } from "react";
// import { fetchProductById } from "../store/slices/productPublicSlice";
// import { fetchResourceByProductId } from "../store/slices/resourcePublicSlice";

// import type { Product, IResource } from "../types/types";
// import type { RootState, AppDispatch } from "../store";
// import { formatCurrency } from "../utils/formatcurremcy";
// import ViewPublicResource from "../components/resources/ViewPublicResource";
// import AddToCartButton from "../components/orders/AddToCartButton";
// import Navbar from "../components/elements/Navbar";

// export default function ProductResourcePage() {
//   const { productId } = useParams<{ productId: string }>();

//   //console.log("id changed:", productId);
//   const dispatch = useDispatch<AppDispatch>();

//   const product: Product | undefined = useSelector((state: RootState) =>
//     productId ? state.productsPublic.byId[productId] : undefined,
//   );

//   //console.log("hello", productId);

//   const resource: IResource | undefined = useSelector((state: RootState) =>
//     productId
//       ? state.resourcesPublic.resourcesByProductId[productId]
//       : undefined,
//   );

//   //console.log("resource:", resource);

//   useEffect(() => {
//     if (!productId) return;

//     const fetchData = async () => {
//       try {
//         await Promise.all([
//           dispatch(fetchProductById(productId)),
//           dispatch(fetchResourceByProductId(productId)),
//           // .unwrap()
//           // .then(() => console.log("✅ thunk resolved"))
//           // .catch((e) => console.error("❌ thunk rejected", e)),

//           //dispatch(fetchResources(productId)),
//         ]);
//         //console.log("✅ Initial data fetch completed");
//       } catch (error) {
//         console.error("❌ Error in initial fetch:", error);
//       }
//     };

//     fetchData();
//   }, [productId, dispatch]);

//   if (!product) {
//     //console.log("❌ NO PRODUCT FOUND");
//     return <p>Nie znaleziono produktu</p>;
//   }

//   return (
//     <>
//       <div className="p-4">
//         <h1 className="text-xl font-bold">Produkt: {product.title}</h1>
//         <img
//           src={product.imageUrl}
//           alt={product.title}
//           className="h-40 object-cover rounded-md"
//         />
//         <p className="text-sm text-gray-600">{product.description}</p>
//         <p className="font-bold">{formatCurrency(product.price)}</p>

//         <div className="mt-4">
//           <h2 className="text-lg">Zawartośc kursu:</h2>
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

//           <div className="mt-4 p-4 border rounded-lg bg-gray-100">
//             {resource ? (
//               <ViewPublicResource resource={resource} />
//             ) : (
//               "loading.."
//             )}
//           </div>
//           <AddToCartButton product={product} />
//           {/* <CheckoutButton productId={productId!} /> */}
//         </div>
//       </div>
//     </>
//   );
// }
