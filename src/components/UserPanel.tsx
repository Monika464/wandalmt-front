import { useSelector } from "react-redux";

import type { RootState } from "../store";
import LogoutButton from "./LogoutButton";

const UserPanel = () => {
  //const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <div>
      <h1>Witaj, {user ? user.name : "Gościu"}!</h1>
      {user && <LogoutButton />}
    </div>
  );
};

export default UserPanel;
// UserPanel.tsx

// import LogoutButton from "./LogoutButton";
// import { useAuth } from "../hooks/useAuth";

// const UserPanel = () => {
//   const { user } = useAuth();
//   return (
//     <div>
//       <h1>Witaj, {user ? user.name : "Gościu"}!</h1>
//       {user && <LogoutButton />}
//     </div>
//   );
// };

// export default UserPanel;

//stary:

// // src/components/UserPanel.tsx

// import type { User } from "../types";

// interface UserPanelProps {
//   user: User | null;
//   onLogout: () => void;
// }

// const UserPanel = ({ user, onLogout }: UserPanelProps) => {
//   console.log("UserPanel user:", user);
//   return (
//     <div>
//       <h1>Witaj, {user ? user.name : "Gościu"}!</h1>
//       {user && (
//         <button
//           onClick={onLogout}
//           className="bg-red-500 text-white px-4 py-2 rounded"
//         >
//           Wyloguj
//         </button>
//       )}
//     </div>
//   );
// };

// export default UserPanel;
