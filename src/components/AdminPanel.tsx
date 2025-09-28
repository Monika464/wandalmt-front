// AdminPanel.tsx
import { useSelector } from "react-redux";
import LogoutButton from "./LogoutButton";
//import { useAuth } from "../hooks/useAuth";
import type { RootState } from "../store";

const AdminPanel = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  //const { user } = useAuth();
  return (
    <div>
      <h1>Witaj, {user ? user.name : "Gościu"}!</h1>
      {user && <LogoutButton />}
    </div>
  );
};

export default AdminPanel;
