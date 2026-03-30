// src/components/elements/Navbar.tsx
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { logoutAdmin, logoutUser } from "../../store/slices/authSlice";
import { useAppTranslation } from "../../hooks/useAppTranslation";
import {
  ShoppingCart,
  User,
  Shield,
  LogOut,
  Globe,
  Menu,
  X,
} from "lucide-react";

import logo from "/assets/images/logomt.png";
import CurrencySelector from "./CurrencySelector";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = useSelector((state: RootState) => state.cart.items.length);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const { t, i18n } = useAppTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    if (user?.role === "admin") {
      dispatch(logoutAdmin());
    } else {
      dispatch(logoutUser());
    }
    navigate("/products");
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const location = useLocation();
  const isHomePage = location.pathname === "/";
  //const isHomePage = window.location.pathname === "/";

  const isAdmin = user?.role === "admin";
  const isRegularUser = user && !isAdmin;

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-16">
          {/* LEFT SIDE - Logo and text side by side */}
          <NavLink
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2 group"
          >
            {/* Logo - to the left of the text */}
            <img
              src={logo}
              alt="Wandal Muaythai"
              className="h-8 w-auto object-contain"
            />

            {/* Text - to the right of the logo */}
            <span className="hidden xs:inline-block text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
              Wandal Muaythai
            </span>
          </NavLink>

          {/* Desktop Menu - middle part */}
          {!isHomePage && (
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `px-2 xl:px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                }
              >
                {t("nav.shop")}
              </NavLink>

              {/* ONLY regular users can see the user panel */}
              {isRegularUser && (
                <NavLink
                  to="/userpanel"
                  className={({ isActive }) =>
                    `flex items-center gap-1 px-2 xl:px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                  }
                >
                  <User size={18} />
                  {t("nav.userPanel")}
                </NavLink>
              )}

              {/* ONLY admin can see the admin panel */}
              {isAdmin && (
                <NavLink
                  to="/adminpanel"
                  className={({ isActive }) =>
                    `flex items-center gap-1 px-2 xl:px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                  }
                >
                  <Shield size={18} />
                  {t("nav.adminPanel")}
                </NavLink>
              )}

              {/* Register - show only for non-logged in users */}
              {(!user || isAdmin) && (
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `px-2 xl:px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                  }
                >
                  {t("nav.register")}
                </NavLink>
              )}

              {/* Login - show only for non-logged in users */}
              {!user && (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-2 xl:px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                  }
                >
                  {t("nav.login")}
                </NavLink>
              )}
            </div>
          )}

          {/* Right side - user actions and language */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Cart - always visible */}
            <NavLink
              to="/cart"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center gap-1 px-2 xl:px-3 py-2 rounded-md text-sm font-medium relative ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
              }
            >
              <ShoppingCart size={20} />
              <span className="hidden sm:inline">{t("nav.cart")}</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </NavLink>

            {/* Logout - desktop (only for logged in users) */}
            {user && (
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center gap-1 px-2 xl:px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">{t("nav.logout")}</span>
              </button>
            )}

            {/* Language buttons */}
            <div className="flex items-center border-l border-gray-600 pl-1 sm:pl-2">
              <Globe size={16} className="text-gray-400 mr-1 hidden sm:block" />
              <div className="flex gap-0.5 sm:gap-1">
                <button
                  onClick={() => changeLanguage("pl")}
                  className={`px-1 sm:px-2 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                    i18n.language === "pl"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  PL
                </button>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`px-1 sm:px-2 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                    i18n.language === "en"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  EN
                </button>
                <CurrencySelector />
              </div>
            </div>

            {/* Hamburger menu - only on mobile */}
            {!isHomePage && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu - drop-down */}
        {!isHomePage && isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-700 animate-fadeIn">
            <div className="flex flex-col space-y-2">
              <NavLink
                to="/products"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `px-3 py-3 rounded-md text-base font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                }
              >
                {t("nav.shop")}
              </NavLink>

              {/* 👇 ONLY regular users can see the user panel in mobile */}
              {isRegularUser && (
                <NavLink
                  to="/userpanel"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                  }
                >
                  <User size={20} />
                  {t("nav.userPanel")}
                </NavLink>
              )}

              {/* ONLY admin can see the admin panel in mobile */}
              {isAdmin && (
                <NavLink
                  to="/adminpanel"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                  }
                >
                  <Shield size={20} />
                  {t("nav.adminPanel")}
                </NavLink>
              )}

              {/* Register - only for those not logged in to mobile */}
              {(!user || isAdmin) && (
                <NavLink
                  to="/register"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `px-3 py-3 rounded-md text-base font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                  }
                >
                  {t("nav.register")}
                </NavLink>
              )}

              {/* Login - only for those not logged in to mobile */}
              {!user && (
                <NavLink
                  to="/login"
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `px-3 py-3 rounded-md text-base font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                  }
                >
                  {t("nav.login")}
                </NavLink>
              )}

              {/* Logout - mobile (only for logged in users) */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full text-left"
                >
                  <LogOut size={20} />
                  {t("nav.logout")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
