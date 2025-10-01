// src/components/ProductItem.tsx
import React from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/index";
import { deleteProduct } from "../../store/slices/productSlice";
import { formatCurrency } from "../../utils/formatcurremcy";

interface Props {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  onEdit: (id: string) => void;
  onViewResource: (id: string) => void;
}

const ProductItem: React.FC<Props> = ({
  _id,
  title,
  description,
  price,
  imageUrl,
  onEdit,
  onViewResource,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = () => {
    if (window.confirm("Na pewno chcesz usunąć ten produkt?")) {
      dispatch(deleteProduct(_id));
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow-md flex flex-col gap-2">
      <img
        src={imageUrl}
        alt={title}
        className="h-40 object-cover rounded-md"
      />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="font-bold">{formatCurrency(price)}</p>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onEdit(_id)}
          className="bg-blue-500 text-white px-3 py-1 rounded-md"
        >
          Edytuj
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-3 py-1 rounded-md"
        >
          Usuń
        </button>
        <button
          onClick={() => onViewResource(_id)}
          className="bg-green-500 text-white px-3 py-1 rounded-md"
        >
          Zasób
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
