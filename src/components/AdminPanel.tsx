import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import LogoutButton from "./auth/LogoutButton";
import type { RootState } from "../store";

const AdminPanel = () => {
  // <-- useSelector MUSI być wewnątrz komponentu
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel Administratora</h1>

      <nav className="flex flex-col gap-2 mb-4">
        <Link
          to="/admin/resources"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Zobacz zasoby
        </Link>
        <br></br>
        <Link
          to="/admin/products"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Zobacz produkty
        </Link>
        <br></br>
        <Link
          to="/admin/users"
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Użytkownicy
        </Link>
      </nav>
      <br></br>
      {/* LogoutButton pokazujemy tylko jeśli user jest zalogowany */}
      {user && <LogoutButton />}
    </div>
  );
};

export default AdminPanel;

// // AdminPanel.tsx
// import { Link } from "react-router-dom";
// import { useSelector } from "react-redux";
// import LogoutButton from "./auth/LogoutButton";
// //import { useAuth } from "../hooks/useAuth";
// import type { RootState } from "../store";
// import UserManagement from "./usermanagement/UserManagement";
// import CreateProductForm from "./products/CreateProductForm";

// const { user } = useSelector((state: RootState) => state.auth);

// const AdminPanel = () => {
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Panel Administratora</h1>

//       <nav className="flex flex-col gap-2">
//         <Link
//           to="/admin/resources"
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           Zobacz zasoby
//         </Link>
//         <br></br>
//         <Link
//           to="/admin/products"
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           Zobacz produkty
//         </Link>
//         <br></br>
//         <Link
//           to="/admin/users"
//           className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
//         >
//           Użytkownicy
//         </Link>
//       </nav>
//       {user && <LogoutButton />}
//     </div>
//   );
// };

//export default AdminPanel;

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
