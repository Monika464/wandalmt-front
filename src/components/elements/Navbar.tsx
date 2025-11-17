import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { logoutAdmin, logoutUser } from "../../store/slices/authSlice";

const Navbar = () => {
  const cartCount = useSelector((state: RootState) => state.cart.items.length);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    if (user?.role === "admin") {
      dispatch(logoutAdmin());
    } else {
      dispatch(logoutUser());
    }
    navigate("/products");
  };

  // useEffect(() => {
  //   console.log("Checking authentication status...");
  //   dispatch(checkAuth());
  // }, [dispatch]);

  return (
    <nav className="flex justify-between bg-gray-200 p-3">
      <NavLink to="/cart">🛒 Koszyk ({cartCount})</NavLink>
      <br></br>
      {user?.role === "admin" && <NavLink to="/adminpanel">AdminPanel</NavLink>}
      <br></br>
      {user && <NavLink to="/userpanel">UserPanel</NavLink>}
      <br></br>
      <NavLink to="/products">Shop</NavLink>
      <br></br>
      {(!user || user?.role === "admin") && (
        <NavLink to="/register">Register</NavLink>
      )}
      <br></br>
      {!user && <NavLink to="/login">Login</NavLink>}
      <br></br>
      {user && <button onClick={handleLogout}>Logout</button>}
    </nav>
  );
};

export default Navbar;
