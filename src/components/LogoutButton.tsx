import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice"; // <-- import akcji logout
import type { AppDispatch } from "../store";

export default function LogoutButton() {
  const dispatch = useDispatch<AppDispatch>();
  const [message, setMessage] = useState("");

  const handleLogout = () => {
    // Wywołanie akcji logout z Redux
    dispatch(logout());

    setMessage("Zostałeś pomyślnie wylogowany.");
    setTimeout(() => setMessage(""), 3000); // ukryj komunikat po 3 sekundach
  };

  return (
    <div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Wyloguj
      </button>
      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
}

// // src/components/LogoutButton.tsx
// import { useState } from "react";
// import { useAuth } from "../hooks/useAuth";

// export default function LogoutButton() {
//   const { logout } = useAuth();
//   const [message, setMessage] = useState("");

//   const handleLogout = () => {
//     logout();
//     setMessage("Zostałeś pomyślnie wylogowany.");
//     setTimeout(() => setMessage(""), 3000); // ukryj po 3 sekundach
//   };

//   return (
//     <div>
//       <button
//         onClick={handleLogout}
//         className="bg-red-500 text-white px-4 py-2 rounded"
//       >
//         Wyloguj
//       </button>
//       {message && <p className="mt-2 text-green-600">{message}</p>}
//     </div>
//   );
//  }
