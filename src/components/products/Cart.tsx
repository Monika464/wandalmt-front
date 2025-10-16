import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { removeFromCart, clearCart } from "../../store/slices/cartSlice";
import { useNavigate } from "react-router-dom";

const Cart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.cart.items);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  //console.log("cart", items, total);
  const navigate = useNavigate();

  if (items.length === 0)
    return <p className="text-gray-500 mt-4">Koszyk jest pusty</p>;

  return (
    <div className="mt-8 border-t pt-4">
      <h2 className="text-xl font-bold mb-2">🧺 Twój koszyk</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item._id} className="flex justify-between">
            <span>
              {item.title} × {item.quantity}_
            </span>
            <span>{item.price * item.quantity} zł</span>
            <button
              className="ml-4 text-red-500"
              onClick={() => dispatch(removeFromCart(item._id))}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-semibold text-lg">
        Suma: <span className="text-blue-600">{total} zł</span>
      </p>
      <button
        onClick={() => dispatch(clearCart())}
        className="mt-3 bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
      >
        Wyczyść koszyk
      </button>
      <button onClick={() => navigate("/products")}>Kontynuuj zakupy</button>
    </div>
  );
};

export default Cart;
