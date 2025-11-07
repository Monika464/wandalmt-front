import { useDispatch } from "react-redux";
import { refundOrder } from "../../store/slices/orderSlice";
import type { AppDispatch } from "../../store";

const RefundButton: React.FC<{ orderId: string }> = ({ orderId }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleRefund = () => {
    if (window.confirm("Czy na pewno chcesz zwrócić to zamówienie?")) {
      dispatch(refundOrder(orderId));
    }
  };

  return (
    <button
      onClick={handleRefund}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
    >
      Zwrot
    </button>
  );
};
export default RefundButton;
