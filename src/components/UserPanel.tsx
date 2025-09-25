// src/components/UserPanel.tsx

import type { User } from "../types";

interface UserPanelProps {
  user: User | null;
  onLogout: () => void;
}

const UserPanel = ({ user, onLogout }: UserPanelProps) => {
  console.log("UserPanel user:", user);
  return (
    <div>
      <h1>Witaj, {user ? user.name : "Gościu"}!</h1>
      {user && (
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Wyloguj
        </button>
      )}
    </div>
  );
};

export default UserPanel;
