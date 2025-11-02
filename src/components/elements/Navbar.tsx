import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

const Navbar = () => {
  const cartCount = useSelector((state: RootState) => state.cart.items.length);

  return (
    <nav className="flex justify-between bg-gray-200 p-3">
      <NavLink to="/cart">🛒 Koszyk ({cartCount})</NavLink>
      <br></br>
      <NavLink to="/adminpanel">AdminPanel</NavLink>
      <br></br>
      <NavLink to="/userpanel">UserPanel</NavLink>
      <br></br>
      <NavLink to="/products">Shop</NavLink>
      <br></br>
      <NavLink to="/register">Register</NavLink>
      <br></br>
      <NavLink to="/login">Login</NavLink>
    </nav>
  );
};

export default Navbar;
