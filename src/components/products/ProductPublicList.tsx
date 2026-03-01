import { useEffect, useState } from "react";
import ProductPublicItem from "./ProductPublicItem";
import { fetchProducts } from "../../store/slices/productPublicSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { useNavigate } from "react-router-dom";
import AddToCartButton from "../orders/AddToCartButton";
import SearchPublicContainer from "./SearchContainerPublic";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState(""); // 👈 Dodaj stan dla wyszukiwania

  const { products, loading, error } = useSelector(
    (state: RootState) => state.productsPublic,
  );

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    dispatch(fetchProducts({}));
  }, [dispatch]);

  // Filtrowanie po języku i wyszukiwaniu
  const filteredProducts = products
    .filter((product) => product.language === i18n.language)
    .filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  if (loading) return <p>{t("product.loading")}</p>;
  if (error)
    return (
      <p className="text-red-500">
        {t("product.error")}: {error}
      </p>
    );

  return (
    <div>
      <br />
      {/* 👈 Poprawione - SearchContainer jako samodzielny komponent */}
      <SearchPublicContainer onSearch={setSearchTerm} />

      {/* Grid produktów */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
          >
            <ProductPublicItem {...product} />

            {/* Kontener z przyciskami - oba takie same */}
            <div className="p-4 flex flex-col sm:flex-row gap-2">
              {/* Lewy przycisk - szczegóły */}
              <div className="sm:flex-1">
                <button
                  onClick={() => navigate(`/products/${product._id}`)}
                  className="
                    w-full 
                    px-6 py-3 
                    bg-blue-500 text-white 
                    rounded-lg 
                    hover:bg-blue-600 
                    transition-all 
                    duration-300 
                    font-medium
                    flex items-center justify-center gap-2
                    shadow-md hover:shadow-lg
                    transform hover:-translate-y-0.5
                    text-base
                  "
                >
                  <Eye size={20} />
                  {t("product.showDetail")}
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
                  variant="medium"
                  color="green"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
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
// import { Eye } from "lucide-react"; // 👈 Dodaj ikonę dla przycisku szczegółów

// const ProductList: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();

//   const { products, loading, error } = useSelector(
//     (state: RootState) => state.productsPublic,
//   );

//   const navigate = useNavigate();
//   const { t, i18n } = useTranslation();

//   useEffect(() => {
//     dispatch(fetchProducts({}));
//   }, [dispatch]);

//   if (loading) return <p>{t("product.loading")}</p>;
//   if (error)
//     return (
//       <p className="text-red-500">
//         {t("product.error")}: {error}
//       </p>
//     );

//   const filteredProducts = products.filter(
//     (product) => product.language === i18n.language,
//   );

//   return (
//     <div>
//       <br />
//       <SearchPublicContainer>
//         {/* Grid produktów */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//           {filteredProducts.map((product) => (
//             <div
//               key={product._id}
//               className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
//             >
//               <ProductPublicItem {...product} />

//               {/* Kontener z przyciskami - oba takie same */}
//               <div className="p-4 flex flex-col sm:flex-row gap-2">
//                 {/* Lewy przycisk - szczegóły (dopasowany do AddToCartButton) */}
//                 <div className="sm:flex-1">
//                   <button
//                     onClick={() => navigate(`/products/${product._id}`)}
//                     className="
//                       w-full
//                       px-6 py-3
//                       bg-blue-500 text-white
//                       rounded-lg
//                       hover:bg-blue-600
//                       transition-all
//                       duration-300
//                       font-medium
//                       flex items-center justify-center gap-2
//                       shadow-md hover:shadow-lg
//                       transform hover:-translate-y-0.5
//                       text-base
//                     "
//                   >
//                     <Eye size={20} />
//                     {t("product.showDetail")}
//                   </button>
//                 </div>

//                 {/* Prawy przycisk - dodaj do koszyka */}
//                 <div className="sm:flex-1">
//                   <AddToCartButton
//                     product={{
//                       _id: product._id,
//                       title: product.title,
//                       price: product.price,
//                     }}
//                     variant="medium"
//                     color="green" // 👈 Ustawiamy zielony kolor dla spójności
//                   />
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       {/* </SearchPublicContainer> */}
//       <SearchPublicContainer onSearch={setSearchTerm} />
//     </div>
//   );
// };

// export default ProductList;
