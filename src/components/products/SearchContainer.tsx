// SearchContainer.tsx
import { type ReactNode, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchProducts } from "../../store/slices/productSlice";

interface Props {
  children: ReactNode;
}

const SearchContainer = ({ children }: Props) => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    dispatch(fetchProducts({ search }));
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj produktu..."
        />
        <button onClick={handleSearch}>Szukaj</button>
      </div>
      {children}
    </div>
  );
};

export default SearchContainer;
