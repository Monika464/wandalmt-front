// layouts/PanelLayout.tsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import Navbar from "../components/elements/Navbar";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  ShoppingBag,
  Heart,
  Settings,
  HandCoins,
  PiggyBank,
} from "lucide-react";

const PanelLayout = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Menu dla admina
  const adminMenu = [
    { path: "/adminpanel", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/products", icon: Package, label: "Produkty" },
    { path: "/admin/resources", icon: FileText, label: "Zasoby" },
    { path: "/admin/users", icon: Users, label: "Użytkownicy" },
    { path: "/createproduct", icon: Package, label: "Dodaj produkt" },
    { path: "/adminfinancials", icon: HandCoins, label: "Finanse" },
    {
      path: "/discountmanager",
      icon: PiggyBank,
      label: "Zarządzanie rabatami",
    },
    {
      path: "/admin/orderssummary",
      icon: FileText,
      label: "Podsumowanie zamówień",
    },
  ];

  // Menu dla użytkownika
  const userMenu = [
    { path: "/userpanel", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/userpanel/userorders", icon: ShoppingBag, label: "Zamówienia" },
    { path: "/user/products", icon: Heart, label: "Moje produkty" },
    { path: "/userpanel/settings", icon: Settings, label: "Ustawienia" },
    { path: "/userprofile", icon: Users, label: "Mój profil" },
  ];

  const menu = user?.role === "admin" ? adminMenu : userMenu;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen p-4">
          <nav className="space-y-1">
            {menu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PanelLayout;
