import { useDispatch } from "react-redux";
import type { ProductItemProps } from "../../types/types";
import type { AppDispatch } from "../../store";
import { deleteProduct } from "../../store/slices/productSlice";
import { formatCurrency } from "../../utils/formatcurremcy";

const ProductItem: React.FC<ProductItemProps> = ({
  _id,
  title,
  description,
  price,
  //resource,
  imageUrl,
  onEdit,
  //onCreateResource,
  //onEditResource,
  //onViewResource,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = () => {
    if (window.confirm("Na pewno chcesz usunąć ten produkt?")) {
      dispatch(deleteProduct(_id));
    }
  };
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h2 className="text-lg font-bold">{title}</h2>
      <img
        src={imageUrl}
        alt={title}
        className="h-40 object-cover rounded-md"
      />
      <p className="text-sm text-gray-600">{description}</p>
      <p className="font-bold">{formatCurrency(price)}</p>

      <div className="mt-2 flex gap-2">
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-yellow-500 text-white rounded"
        >
          Edytuj produkt
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-3 py-1 rounded-md"
        >
          Usuń produkt
        </button>
      </div>
    </div>
  );
};

export default ProductItem;
