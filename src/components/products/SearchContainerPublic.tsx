// SearchContainer.tsx
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchProducts } from "../../store/slices/productPublicSlice";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { AppDispatch } from "../../store";

interface Props {
  onSearch: (searchTerm: string) => void;
}

const SearchPublicContainer = ({ onSearch }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const delay = setTimeout(() => {
      onSearch(search);
      if (search !== "") {
        dispatch(fetchProducts({ search }));
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [search, dispatch, onSearch]);

  const handleClear = () => {
    setSearch("");
    onSearch("");
  };

  return (
    <div>
      <div className="relative w-full max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {search && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchPublicContainer;
