// SearchContainer.tsx
import { type ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchProducts } from "../../store/slices/productSlice";
import { FiSearch } from "react-icons/fi";
import type { AppDispatch } from "../../store";

interface Props {
  children: ReactNode;
}

const SearchContainer = ({ children }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");

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
      <div className="flex gap-2 mb-4">
        <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj produktu..."
        />
        {/* <button onClick={handleSearch}>Wyczyść szukanie</button> */}
      </div>
      {children}
    </div>
  );
};

export default SearchContainer;
