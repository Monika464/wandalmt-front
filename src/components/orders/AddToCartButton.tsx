import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice";
import type { AppDispatch } from "../../store";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const handleAdd = () => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    navigate("/cart");
  };

  return (
    <button
      onClick={handleAdd}
      className="w-full px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
      {t("cart.addToCart")} {/* 👈 Tłumaczenie */}
    </button>
  );
};

export default AddToCartButton;

// import { useDispatch } from "react-redux";
// import { addToCart } from "../../store/slices/cartSlice";
// import type { AppDispatch } from "../../store";
// import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import { ShoppingCart } from "lucide-react";

// interface AddToCartButtonProps {
//   product: {
//     _id: string;
//     title: string;
//     price: number;
//   };
//   variant?: "small" | "medium" | "large";
//   showIcon?: boolean;
// }

// const AddToCartButton: React.FC<AddToCartButtonProps> = ({
//   product,
//   variant = "medium",
//   showIcon = true,
// }) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const { t } = useTranslation();

//   const sizeClasses = {
//     small: "px-2 py-1 text-xs",
//     medium: "px-3 py-1 text-sm",
//     large: "px-4 py-2 text-base",
//   };

//   const handleAdd = () => {
//     dispatch(addToCart({ ...product, quantity: 1 }));
//     navigate("/cart");
//   };

//   return (
//     <button
//       onClick={handleAdd}
//       className={`
//         ${sizeClasses[variant]}
//         bg-green-600 text-white rounded hover:bg-green-700 transition
//         w-full sm:w-auto flex items-center justify-center gap-2
//       `}
//     >
//       {showIcon && <ShoppingCart size={variant === "small" ? 16 : 18} />}
//       {t("cart.addToCart")}
//     </button>
//   );
// };

// export default AddToCartButton;

///////////////////////////////////////////

// import { useDispatch } from "react-redux";
// import { addToCart } from "../../store/slices/cartSlice";
// import type { AppDispatch } from "../../store";
// import { useNavigate } from "react-router-dom";

// interface AddToCartButtonProps {
//   product: {
//     _id: string;
//     title: string;
//     price: number;
//   };
// }

// const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product }) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   //console.log("pr", product);

//   const handleAdd = () => {
//     //dispatch(addToCart(product));
//     dispatch(addToCart({ ...product, quantity: 1 }));
//     navigate("/cart");
//   };

//   return (
//     <button
//       onClick={handleAdd}
//       className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
//     >
//       Add to cart
//     </button>
//   );
// };

// export default AddToCartButton;
