// src/components/elements/Navbar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { logoutAdmin, logoutUser } from "../../store/slices/authSlice";
import { useTranslation } from "react-i18next";
import { ShoppingCart, User, Shield, LogOut, Globe } from "lucide-react"; // Dodaj ikony

const Navbar = () => {
  const cartCount = useSelector((state: RootState) => state.cart.items.length);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    if (user?.role === "admin") {
      dispatch(logoutAdmin());
    } else {
      dispatch(logoutUser());
    }
    navigate("/products");
  };

  // Sprawdź czy jesteśmy na stronie głównej
  const isHomePage = window.location.pathname === "/";

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Lewa strona - Logo i główne linki */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-xl font-bold ${isActive ? "text-blue-400" : "text-white hover:text-blue-300"} transition-colors`
              }
            >
              wandalmt
            </NavLink>

            {/* Główne linki nawigacyjne - tylko jeśli nie jesteśmy na stronie głównej */}
            {!isHomePage && (
              <div className="hidden md:flex items-center space-x-4">
                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                  }
                >
                  Shop
                </NavLink>

                {user && (
                  <NavLink
                    to="/userpanel"
                    className={({ isActive }) =>
                      `flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                    }
                  >
                    <User size={18} />
                    User Panel
                  </NavLink>
                )}

                {user?.role === "admin" && (
                  <NavLink
                    to="/adminpanel"
                    className={({ isActive }) =>
                      `flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                    }
                  >
                    <Shield size={18} />
                    Admin Panel
                  </NavLink>
                )}
              </div>
            )}
          </div>

          {/* Prawa strona - akcje użytkownika i język */}
          <div className="flex items-center space-x-4">
            {/* Koszyk - zawsze widoczny */}
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                `flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium relative ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
              }
            >
              <ShoppingCart size={20} />
              <span className="hidden sm:inline">Koszyk</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </NavLink>

            {/* Przyciski logowania/rejestracji - tylko dla niezalogowanych lub admina */}
            {(!user || user?.role === "admin") && !isHomePage && (
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                }
              >
                Register
              </NavLink>
            )}

            {!user && !isHomePage && (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                }
              >
                Login
              </NavLink>
            )}

            {/* Wylogowanie - dla zalogowanych */}
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            {/* Przyciski zmiany języka */}
            <div className="flex items-center border-l border-gray-600 pl-4">
              <Globe size={18} className="text-gray-400 mr-2" />
              <div className="flex gap-1">
                <button
                  onClick={() => changeLanguage("pl")}
                  className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                    i18n.language === "pl"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  PL
                </button>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                    i18n.language === "en"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu - tylko jeśli nie jesteśmy na stronie głównej */}
        {!isHomePage && (
          <div className="md:hidden flex flex-wrap gap-2 py-2 border-t border-gray-700">
            <NavLink
              to="/products"
              className="text-sm text-gray-300 hover:text-white"
            >
              Shop
            </NavLink>
            {user && (
              <NavLink
                to="/userpanel"
                className="text-sm text-gray-300 hover:text-white"
              >
                User Panel
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink
                to="/adminpanel"
                className="text-sm text-gray-300 hover:text-white"
              >
                Admin Panel
              </NavLink>
            )}
            {(!user || user?.role === "admin") && (
              <NavLink
                to="/register"
                className="text-sm text-gray-300 hover:text-white"
              >
                Register
              </NavLink>
            )}
            {!user && (
              <NavLink
                to="/login"
                className="text-sm text-gray-300 hover:text-white"
              >
                Login
              </NavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

// import { NavLink, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import type { AppDispatch, RootState } from "../../store";
// import { logoutAdmin, logoutUser } from "../../store/slices/authSlice";
// import { useTranslation } from 'react-i18next';

// const Navbar = () => {
//   const cartCount = useSelector((state: RootState) => state.cart.items.length);
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const { user } = useSelector((state: RootState) => state.auth);
//     const { i18n } = useTranslation();

//   const changeLanguage = (lng: string) => {
//     i18n.changeLanguage(lng);
//   };

//   const handleLogout = () => {
//     if (user?.role === "admin") {
//       dispatch(logoutAdmin());
//     } else {
//       dispatch(logoutUser());
//     }
//     navigate("/products");
//   };

//   // useEffect(() => {
//   //   console.log("Checking authentication status...");
//   //   dispatch(checkAuth());
//   // }, [dispatch]);

//   return (
//     <nav className="flex justify-between bg-gray-200 p-3">
//       <NavLink to="/cart">🛒 Koszyk ({cartCount})</NavLink>
//       <br></br>
//       {user?.role === "admin" && <NavLink to="/adminpanel">AdminPanel</NavLink>}
//       <br></br>
//       {user && <NavLink to="/userpanel">UserPanel</NavLink>}
//       <br></br>
//       <NavLink to="/products">Shop</NavLink>
//       <br></br>
//       {(!user || user?.role === "admin") && (
//         <NavLink to="/register">Register</NavLink>
//       )}
//       <br></br>
//       {!user && <NavLink to="/login">Login</NavLink>}
//       <br></br>
//       {user && <button onClick={handleLogout}>Logout</button>}
//     </nav>
//   );
// };

// export default Navbar;
