// AdminPanel.tsx
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import LogoutButton from "./auth/LogoutButton";
//import { useAuth } from "../hooks/useAuth";
import type { RootState } from "../store";
import UserManagement from "./usermanagement/UserManagement";
import CreateProductForm from "./products/CreateProductForm";

const AdminPanel = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel Administratora</h1>

      <nav className="flex flex-col gap-2">
        <Link
          to="/admin/resources"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Zobacz zasoby
        </Link>

        {/* przykładowe inne linki */}
        <Link
          to="/admin/users"
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Użytkownicy
        </Link>
      </nav>
    </div>
  );
};

export default AdminPanel;

// const AdminPanel = () => {
//   const { user } = useSelector((state: RootState) => state.auth);
//   //const { user } = useAuth();
//   return (
//     <div>
//       <h1>Witaj, {user ? user.name : "Gościu"}!</h1>
//       {user && <LogoutButton />}
//       <UserManagement />
//       CREATE PRODUCT
//       <CreateProductForm />
//     </div>
//   );
// };
