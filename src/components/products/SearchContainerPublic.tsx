// SearchContainer.tsx
import { type ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchProducts } from "../../store/slices/productPublicSlice";
import { FiSearch } from "react-icons/fi";
import type { AppDispatch } from "../../store";

interface Props {
  children: ReactNode;
}

const SearchPublicContainer = ({ children }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");

  // const handleSearch = () => {
  //   setSearch("");
  //   dispatch(fetchProducts({ search }));
  // };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (search !== "") dispatch(fetchProducts({ search }));
    }, 1000);

    return () => clearTimeout(delay);
  }, [search, dispatch]);

  return (
    <div>
      <div className="relative w-full max-w-md">
        {/* Ikona wewnątrz pola */}
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj produktu..."
          className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* <button onClick={handleSearch}>Wyczyść szukanie</button> */}
        <p>{search}</p>
      </div>
      {children}
    </div>
  );
};

export default SearchPublicContainer;
