import React from "react";
import { useNavigate } from "react-router-dom";

const CheckoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/checkout");
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
