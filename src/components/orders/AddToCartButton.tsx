import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import type { AppDispatch } from "../../store";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    _id: string;
    title: string;
    price: number;
  };
  variant?: "small" | "medium" | "large";
  color?: "blue" | "green" | "purple";
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  variant = "medium",
  color = "green",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleAdd = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    navigate("/cart");
  };

  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
  };

  const colorClasses = {
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    purple: "bg-purple-500 hover:bg-purple-600",
  };

  return (
    <button
      onClick={handleAdd}
      className={`
        w-full 
        ${sizeClasses[variant]} 
        ${colorClasses[color]}
        text-white 
        rounded-lg 
        transition-all 
        duration-300 
        font-medium
        flex items-center justify-center gap-2
        shadow-md hover:shadow-lg
        transform hover:-translate-y-0.5
      `}
    >
      <ShoppingCart size={variant === "small" ? 16 : 20} />
      {t("cart.addToCart")}
    </button>
  );
};

export default AddToCartButton;
