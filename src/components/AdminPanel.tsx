// AdminPanel.tsx
import { useSelector } from "react-redux";
import LogoutButton from "./auth/LogoutButton";
//import { useAuth } from "../hooks/useAuth";
import type { RootState } from "../store";
import UserManagement from "./usermanagement/UserManagement";
import CreateProductForm from "./products/CreateProductForm";

const AdminPanel = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  //const { user } = useAuth();
  return (
    <div>
      <h1>Witaj, {user ? user.name : "Gościu"}!</h1>
      {user && <LogoutButton />}
      <UserManagement />
      CREATE PRODUCT
      <CreateProductForm />
    </div>
  );
};

export default AdminPanel;
