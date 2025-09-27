// AdminPanel.tsx

import LogoutButton from "./LogoutButton";
import { useAuth } from "../hooks/useAuth";

const AdminPanel = () => {
  const { user } = useAuth();
  return (
    <div>
      <h1>Witaj, {user ? user.name : "Gościu"}!</h1>
      {user && <LogoutButton />}
    </div>
  );
};

export default AdminPanel;
