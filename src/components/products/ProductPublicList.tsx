import { useEffect } from "react";
import ProductPublicItem from "./ProductPublicItem";
import { fetchProducts } from "../../store/slices/productPublicSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { useNavigate } from "react-router-dom";
import AddToCartButton from "../orders/AddToCartButton";
import SearchPublicContainer from "./SearchContainerPublic";
import { useTranslation } from "react-i18next";

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { products, loading, error } = useSelector(
    (state: RootState) => state.productsPublic,
  );

  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // 👈 Dodaj t

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  if (loading) return <p>{t("product.loading")}</p>; // 👈 Tłumaczenie
  if (error)
    return (
      <p className="text-red-500">
        {t("product.error")}: {error}
      </p>
    ); // 👈 Tłumaczenie

  const filteredProducts = products.filter(
    (product) => product.language === i18n.language,
  );

  return (
    <div>
      <br />
      <SearchPublicContainer>
        {/* Grid produktów */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
            >
              <ProductPublicItem {...product} />

              {/* 🔥 WAŻNE: Tutaj implementujemy Wariant 2 */}
              <div className="p-4 flex flex-col sm:flex-row gap-2">
                {/* Lewy przycisk - szczegóły */}
                <div className="sm:flex-1">
                  <button
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="w-full px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    {t("product.showDetail")} {/* 👈 Tłumaczenie */}
                  </button>
                </div>

                {/* Prawy przycisk - dodaj do koszyka */}
                <div className="sm:flex-1">
                  <AddToCartButton
                    product={{
                      _id: product._id,
                      title: product.title,
                      price: product.price,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SearchPublicContainer>
    </div>
  );
};

export default ProductList;

// import { useEffect } from "react";

// import ProductPublicItem from "./ProductPublicItem";
// import { fetchProducts } from "../../store/slices/productPublicSlice";

// import { useDispatch, useSelector } from "react-redux";
// import type { AppDispatch, RootState } from "../../store";

// import { useNavigate } from "react-router-dom";
// import AddToCartButton from "../orders/AddToCartButton";
// import SearchPublicContainer from "./SearchContainerPublic";
// import { useTranslation } from "react-i18next";

// const ProductList: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();

//   const { products, loading, error } = useSelector(
//     (state: RootState) => state.productsPublic,
//   );

//   const navigate = useNavigate();
//   const { i18n } = useTranslation();

//   useEffect(() => {
//     dispatch(fetchProducts({}));
//   }, [dispatch]);

//   if (loading) return <p>Ładowanie...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;

//   //console.log("📦 All products:", products);
//   const filteredProducts = products.filter(
//     (product) => product.language === i18n.language,
//   );

//   //console.log("📦 Filtered products:", filteredProducts);
//   return (
//     <div>
//       {/* <Navbar /> */}
//       <br></br>
//       <SearchPublicContainer>
//         {/* Grid produktów */}
//         {/* Mobile: 1 kolumna, tablety/desktop: 2 kolumny */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//           {filteredProducts.map((product) => {
//             return (
//               <div
//                 key={product._id}
//                 className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
//               >
//                 <ProductPublicItem {...product} />

//                 <div className="p-4 flex flex-col sm:flex-row gap-2">
//                   <button
//                     onClick={() => navigate(`/products/${product._id}`)}
//                     className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-full sm:w-auto"
//                   >
//                     Show detail
//                   </button>
//                   <div className="w-full sm:w-auto">
//                     <AddToCartButton
//                       product={{
//                         _id: product._id,
//                         title: product.title,
//                         price: product.price,
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </SearchPublicContainer>
//     </div>
//   );
// };

// export default ProductList;
