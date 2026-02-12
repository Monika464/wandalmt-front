import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import type { AppDispatch } from "../../store";
import { useNavigate } from "react-router-dom";

interface AddToCartButtonProps {
  product: {
    _id: string;
    title: string;
    price: number;
  };
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  //console.log("pr", product);

  const handleAdd = () => {
    //dispatch(addToCart(product));
    dispatch(addToCart({ ...product, quantity: 1 }));
    navigate("/cart");
  };

  return (
    <button
      onClick={handleAdd}
      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
      Add to cart
    </button>
  );
};

export default AddToCartButton;
