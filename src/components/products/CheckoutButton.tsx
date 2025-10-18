import React from "react";
import { useNavigate } from "react-router-dom";

interface CheckoutButtonProps {
  productId: string;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ productId }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/checkout", { state: { productId } });
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
    >
      💳 Kup teraz
    </button>
  );
};

export default CheckoutButton;
