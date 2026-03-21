// SearchContainer.tsx
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface Props {
  onSearch: (searchTerm: string) => void;
}

const SearchContainer = ({ onSearch }: Props) => {
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const delay = setTimeout(() => {
      onSearch(search);
    }, 500);

    return () => clearTimeout(delay);
  }, [search, onSearch]);

  return (
    <div className="flex gap-2 mb-4 relative">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("search.placeholder")}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default SearchContainer;
