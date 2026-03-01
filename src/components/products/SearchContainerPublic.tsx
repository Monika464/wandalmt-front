// SearchContainer.tsx
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchProducts } from "../../store/slices/productPublicSlice";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { AppDispatch } from "../../store";

interface Props {
  onSearch: (searchTerm: string) => void; // Zmienione z children na onSearch
}

const SearchPublicContainer = ({ onSearch }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const delay = setTimeout(() => {
      onSearch(search); // Przekazanie searchTerm do rodzica
      if (search !== "") {
        dispatch(fetchProducts({ search })); // Opcjonalnie - jeśli chcesz też fetchować
      }
    }, 500); // Zmniejszone z 1000ms na 500ms dla lepszego UX

    return () => clearTimeout(delay);
  }, [search, dispatch, onSearch]);

  // Opcjonalnie - funkcja do czyszczenia wyszukiwania
  const handleClear = () => {
    setSearch("");
    onSearch("");
  };

  return (
    <div>
      <div className="relative w-full max-w-md">
        {/* Ikona wewnątrz pola */}
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Przycisk czyszczenia (opcjonalny) */}
        {search && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
      {/* {children} - usunięte, bo nie potrzebujemy już children */}
    </div>
  );
};

export default SearchPublicContainer;

// // SearchContainer.tsx
// import { type ReactNode, useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import { fetchProducts } from "../../store/slices/productPublicSlice";
// import { FiSearch } from "react-icons/fi";
// import { useTranslation } from "react-i18next"; // 👈 Dodaj import
// import type { AppDispatch } from "../../store";

// interface Props {
//   children: ReactNode;
// }

// const SearchPublicContainer = ({ children }: Props) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const [search, setSearch] = useState("");
//   const { t } = useTranslation(); // 👈 Inicjalizacja useTranslation

//   // const handleSearch = () => {
//   //   setSearch("");
//   //   dispatch(fetchProducts({ search }));
//   // };

//   useEffect(() => {
//     const delay = setTimeout(() => {
//       if (search !== "") dispatch(fetchProducts({ search }));
//     }, 1000);

//     return () => clearTimeout(delay);
//   }, [search, dispatch]);

//   return (
//     <div>
//       <div className="relative w-full max-w-md">
//         {/* Ikona wewnątrz pola */}
//         <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

//         <input
//           type="text"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder={t("search.placeholder")} // 👇 Zmienione na tłumaczenie
//           className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />

//         {/* <button onClick={handleSearch}>{t("search.clear")}</button> */}
//         {/* <p>{search}</p> */}
//       </div>
//       {children}
//     </div>
//   );
// };

// export default SearchPublicContainer;
