// src/components/elements/Navbar.tsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { logoutAdmin, logoutUser } from "../../store/slices/authSlice";
import { useTranslation } from "react-i18next";
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

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = useSelector((state: RootState) => state.cart.items.length);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { t, i18n } = useTranslation();

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

  const isHomePage = window.location.pathname === "/";

  // 👇 Określenie czy użytkownik jest administratorem
  const isAdmin = user?.role === "admin";
  // 👇 Określenie czy użytkownik jest zwykłym użytkownikiem
  const isRegularUser = user && !isAdmin;

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* 🔥 LEWA STRONA - Logo i tekst obok siebie */}
          <NavLink
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2 group"
          >
            {/* Logo - po lewej */}
            <img
              src={logo}
              alt="Wandal Muaythai"
              className="h-8 w-auto object-contain"
            />

            {/* Tekst - po prawej stronie logo */}
            <span className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
              Wandal Muaythai
            </span>
          </NavLink>

          {/* Desktop Menu - środkowa część */}
          {!isHomePage && (
            <div className="hidden md:flex items-center space-x-2">
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                }
              >
                {t("nav.shop")}
              </NavLink>

              {/* 👇 TYLKO zwykły użytkownik widzi panel użytkownika */}
              {isRegularUser && (
                <NavLink
                  to="/userpanel"
                  className={({ isActive }) =>
                    `flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                  }
                >
                  <User size={18} />
                  {t("nav.userPanel")}
                </NavLink>
              )}

              {/* 👇 TYLKO admin widzi panel admina */}
              {isAdmin && (
                <NavLink
                  to="/adminpanel"
                  className={({ isActive }) =>
                    `flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                  }
                >
                  <Shield size={18} />
                  {t("nav.adminPanel")}
                </NavLink>
              )}

              {/* 👇 Register - pokazuj tylko dla niezalogowanych */}
              {!user && (
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                  }
                >
                  {t("nav.register")}
                </NavLink>
              )}

              {/* 👇 Login - pokazuj tylko dla niezalogowanych */}
              {!user && (
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
                  }
                >
                  {t("nav.login")}
                </NavLink>
              )}
            </div>
          )}

          {/* Prawa strona - akcje użytkownika i język */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Koszyk - zawsze widoczny */}
            <NavLink
              to="/cart"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center gap-1 px-2 sm:px-3 py-2 rounded-md text-sm font-medium relative ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
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

            {/* Wylogowanie - desktop (tylko dla zalogowanych) */}
            {user && (
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">{t("nav.logout")}</span>
              </button>
            )}

            {/* Przyciski języka */}
            <div className="flex items-center border-l border-gray-600 pl-2 sm:pl-4">
              <Globe size={18} className="text-gray-400 mr-1 sm:mr-2" />
              <div className="flex gap-1">
                <button
                  onClick={() => changeLanguage("pl")}
                  className={`px-1.5 sm:px-2 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                    i18n.language === "pl"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  PL
                </button>
                <button
                  onClick={() => changeLanguage("en")}
                  className={`px-1.5 sm:px-2 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
                    i18n.language === "en"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Hamburger menu - tylko na mobile */}
            {!isHomePage && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu - rozwijane */}
        {!isHomePage && isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700 animate-fadeIn">
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

              {/* 👇 TYLKO zwykły użytkownik widzi panel użytkownika w mobile */}
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

              {/* 👇 TYLKO admin widzi panel admina w mobile */}
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

              {/* 👇 Register - tylko dla niezalogowanych w mobile */}
              {!user && (
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

              {/* 👇 Login - tylko dla niezalogowanych w mobile */}
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

              {/* Wylogowanie - mobile (tylko dla zalogowanych) */}
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

// // src/components/elements/Navbar.tsx
// import { useState } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import type { AppDispatch, RootState } from "../../store";
// import { logoutAdmin, logoutUser } from "../../store/slices/authSlice";
// import { useTranslation } from "react-i18next";
// import {
//   ShoppingCart,
//   User,
//   Shield,
//   LogOut,
//   Globe,
//   Menu,
//   X,
// } from "lucide-react";

// import logo from "/assets/images/logomt.png";

// const Navbar = () => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const cartCount = useSelector((state: RootState) => state.cart.items.length);
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const { user } = useSelector((state: RootState) => state.auth);
//   const { t, i18n } = useTranslation();

//   const changeLanguage = (lng: string) => {
//     i18n.changeLanguage(lng);
//     setIsMobileMenuOpen(false);
//   };

//   const handleLogout = () => {
//     if (user?.role === "admin") {
//       dispatch(logoutAdmin());
//     } else {
//       dispatch(logoutUser());
//     }
//     navigate("/products");
//     setIsMobileMenuOpen(false);
//   };

//   const closeMobileMenu = () => {
//     setIsMobileMenuOpen(false);
//   };

//   const isHomePage = window.location.pathname === "/";

//   return (
//     <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg sticky top-0 z-50">
//       <div className="container mx-auto px-4">
//         <div className="flex justify-between items-center h-16">
//           {/* 🔥 LEWA STRONA - Logo i tekst obok siebie */}
//           <NavLink
//             to="/"
//             onClick={closeMobileMenu}
//             className="flex items-center gap-2 group"
//           >
//             {/* Logo - po lewej */}
//             <img
//               src={logo}
//               alt="Wandal Muaythai"
//               className="h-8 w-auto object-contain"
//             />

//             {/* Tekst - po prawej stronie logo */}
//             <span className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
//               Wandal Muaythai
//             </span>
//           </NavLink>

//           {/* Desktop Menu - środkowa część (bez zmian) */}
//           {!isHomePage && (
//             <div className="hidden md:flex items-center space-x-2">
//               <NavLink
//                 to="/products"
//                 className={({ isActive }) =>
//                   `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
//                 }
//               >
//                 {t("nav.shop")}
//               </NavLink>

//               {user && (
//                 <NavLink
//                   to="/userpanel"
//                   className={({ isActive }) =>
//                     `flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
//                   }
//                 >
//                   <User size={18} />
//                   {t("nav.userPanel")}
//                 </NavLink>
//               )}

//               {user?.role === "admin" && (
//                 <NavLink
//                   to="/adminpanel"
//                   className={({ isActive }) =>
//                     `flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
//                   }
//                 >
//                   <Shield size={18} />
//                   {t("nav.adminPanel")}
//                 </NavLink>
//               )}

//               {(!user || user?.role === "admin") && (
//                 <NavLink
//                   to="/register"
//                   className={({ isActive }) =>
//                     `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
//                   }
//                 >
//                   {t("nav.register")}
//                 </NavLink>
//               )}

//               {!user && (
//                 <NavLink
//                   to="/login"
//                   className={({ isActive }) =>
//                     `px-3 py-2 rounded-md text-sm font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
//                   }
//                 >
//                   {t("nav.login")}
//                 </NavLink>
//               )}
//             </div>
//           )}

//           {/* Prawa strona - akcje użytkownika i język (bez zmian) */}
//           <div className="flex items-center space-x-2 sm:space-x-4">
//             {/* Koszyk - zawsze widoczny */}
//             <NavLink
//               to="/cart"
//               onClick={closeMobileMenu}
//               className={({ isActive }) =>
//                 `flex items-center gap-1 px-2 sm:px-3 py-2 rounded-md text-sm font-medium relative ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
//               }
//             >
//               <ShoppingCart size={20} />
//               <span className="hidden sm:inline">{t("nav.cart")}</span>
//               {cartCount > 0 && (
//                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                   {cartCount}
//                 </span>
//               )}
//             </NavLink>

//             {/* Wylogowanie - desktop */}
//             {user && (
//               <button
//                 onClick={handleLogout}
//                 className="hidden md:flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
//               >
//                 <LogOut size={18} />
//                 <span className="hidden sm:inline">{t("nav.logout")}</span>
//               </button>
//             )}

//             {/* Przyciski języka */}
//             <div className="flex items-center border-l border-gray-600 pl-2 sm:pl-4">
//               <Globe size={18} className="text-gray-400 mr-1 sm:mr-2" />
//               <div className="flex gap-1">
//                 <button
//                   onClick={() => changeLanguage("pl")}
//                   className={`px-1.5 sm:px-2 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
//                     i18n.language === "pl"
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-700 text-gray-300 hover:bg-gray-600"
//                   }`}
//                 >
//                   PL
//                 </button>
//                 <button
//                   onClick={() => changeLanguage("en")}
//                   className={`px-1.5 sm:px-2 py-1 rounded text-xs sm:text-sm font-medium transition-colors ${
//                     i18n.language === "en"
//                       ? "bg-blue-600 text-white"
//                       : "bg-gray-700 text-gray-300 hover:bg-gray-600"
//                   }`}
//                 >
//                   EN
//                 </button>
//               </div>
//             </div>

//             {/* Hamburger menu - tylko na mobile */}
//             {!isHomePage && (
//               <button
//                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                 className="md:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
//                 aria-label="Toggle menu"
//               >
//                 {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Mobile menu - rozwijane (bez zmian) */}
//         {!isHomePage && isMobileMenuOpen && (
//           <div className="md:hidden py-4 border-t border-gray-700 animate-fadeIn">
//             <div className="flex flex-col space-y-2">
//               <NavLink
//                 to="/products"
//                 onClick={closeMobileMenu}
//                 className={({ isActive }) =>
//                   `px-3 py-3 rounded-md text-base font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
//                 }
//               >
//                 {t("nav.shop")}
//               </NavLink>

//               {user && (
//                 <NavLink
//                   to="/userpanel"
//                   onClick={closeMobileMenu}
//                   className={({ isActive }) =>
//                     `flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
//                   }
//                 >
//                   <User size={20} />
//                   {t("nav.userPanel")}
//                 </NavLink>
//               )}

//               {user?.role === "admin" && (
//                 <NavLink
//                   to="/adminpanel"
//                   onClick={closeMobileMenu}
//                   className={({ isActive }) =>
//                     `flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
//                   }
//                 >
//                   <Shield size={20} />
//                   {t("nav.adminPanel")}
//                 </NavLink>
//               )}

//               {(!user || user?.role === "admin") && (
//                 <NavLink
//                   to="/register"
//                   onClick={closeMobileMenu}
//                   className={({ isActive }) =>
//                     `px-3 py-3 rounded-md text-base font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
//                   }
//                 >
//                   {t("nav.register")}
//                 </NavLink>
//               )}

//               {!user && (
//                 <NavLink
//                   to="/login"
//                   onClick={closeMobileMenu}
//                   className={({ isActive }) =>
//                     `px-3 py-3 rounded-md text-base font-medium ${isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} transition-colors`
//                   }
//                 >
//                   {t("nav.login")}
//                 </NavLink>
//               )}

//               {/* Wylogowanie - mobile */}
//               {user && (
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center gap-2 px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full text-left"
//                 >
//                   <LogOut size={20} />
//                   {t("nav.logout")}
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
