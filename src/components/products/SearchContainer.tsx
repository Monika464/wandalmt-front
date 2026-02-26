// SearchContainer.tsx - rozszerzona wersja
// SearchContainer.tsx
import { type ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchProducts } from "../../store/slices/productSlice";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next"; // 👈 Dodaj import
import type { AppDispatch } from "../../store";

interface Props {
  children: ReactNode;
}

const SearchContainer = ({ children }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const { t } = useTranslation(); // 👈 Inicjalizacja useTranslation

  // const handleSearch = () => {
  //   dispatch(fetchProducts({ search }));
  // };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (search !== "") dispatch(fetchProducts({ search }));
    }, 500);

    return () => clearTimeout(delay);
  }, [search, dispatch]);

  return (
    <div>
      <div className="flex gap-2 mb-4 relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search.placeholder")} // 👇 Użyj tłumaczenia
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* <button onClick={handleSearch}>{t("search.clear")}</button> */}
      </div>
      {children}
    </div>
  );
};

export default SearchContainer;

// // SearchContainer.tsx
// import { type ReactNode, useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import { fetchProducts } from "../../store/slices/productSlice";
// import { FiSearch } from "react-icons/fi";
// import type { AppDispatch } from "../../store";

// interface Props {
//   children: ReactNode;
// }

// const SearchContainer = ({ children }: Props) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const [search, setSearch] = useState("");

//   // const handleSearch = () => {
//   //   dispatch(fetchProducts({ search }));
//   // };

//   useEffect(() => {
//     const delay = setTimeout(() => {
//       if (search !== "") dispatch(fetchProducts({ search }));
//     }, 500);

//     return () => clearTimeout(delay);
//   }, [search, dispatch]);

//   return (
//     <div>
//       <div className="flex gap-2 mb-4">
//         <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
//         <input
//           type="text"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Szukaj produktu..."
//         />
//         {/* <button onClick={handleSearch}>Wyczyść szukanie</button> */}
//       </div>
//       {children}
//     </div>
//   );
// };

// export default SearchContainer;
