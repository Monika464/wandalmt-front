import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { logoutAdmin, logoutUser } from "../../store/slices/authSlice";

const Navbar = () => {
  const cartCount = useSelector((state: RootState) => state.cart.items.length);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    if (user?.role === "admin") {
      dispatch(logoutAdmin());
    } else {
      dispatch(logoutUser());
    }
  };
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
      <br></br>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
