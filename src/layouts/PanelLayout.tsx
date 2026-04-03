// layouts/PanelLayout.tsx

import { Outlet, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import Navbar from "../components/elements/Navbar";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  ShoppingBag,
  HandCoins,
  PiggyBank,
} from "lucide-react";

const PanelLayout = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();

  // Admin menu
  const adminMenu = [
    {
      path: "/adminpanel",
      icon: LayoutDashboard,
      label: t("panel.admin.dashboard"),
    },
    {
      path: "/admin/products",
      icon: Package,
      label: t("panel.admin.products"),
    },
    {
      path: "/admin/resources",
      icon: FileText,
      label: t("panel.admin.resources"),
    },
    { path: "/admin/users", icon: Users, label: t("panel.admin.users") },
    {
      path: "/createproduct",
      icon: Package,
      label: t("panel.admin.addProduct"),
    },
    {
      path: "/adminfinancials",
      icon: HandCoins,
      label: t("panel.admin.finances"),
    },
    {
      path: "/discountmanager",
      icon: PiggyBank,
      label: t("panel.admin.discounts"),
    },
    {
      path: "/admin/orderssummary",
      icon: FileText,
      label: t("panel.admin.ordersSummary"),
    },
  ];

  // User menu
  const userMenu = [
    {
      path: "/userpanel",
      icon: LayoutDashboard,
      label: t("panel.user.dashboard"),
    },
    {
      path: "/userpanel/userorders",
      icon: ShoppingBag,
      label: t("panel.user.orders"),
    },

    { path: "/userprofile", icon: Users, label: t("panel.user.profile") },
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
