import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Shop from "./components/Shop";
import UserLogin from "./components/UserLogin";
import AdminLogin from "./components/AdminLogin";
import UserPanel from "./components/UserPanel";
import AdminPanel from "./components/AdminPanel";
import Homepage from "./pages/Homepage";
import ProtectedRoute from "./routes/ProtectedRoute";
import "./App.css";
import type { User } from "./types";

const App = () => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser); // zapisz dane użytkownika w stanie
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };
  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/homepage" />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/shop" element={<Shop />} />

            {/* przekazujemy callback do logowania */}
            <Route
              path="/userlogin"
              element={<UserLogin onLogin={handleLogin} />}
            />
            <Route
              path="/adminlogin"
              element={<AdminLogin onLogin={handleLogin} />}
            />

            {/* <Route path="/userlogin" element={<UserLogin />} />
            <Route path="/adminlogin" element={<AdminLogin />} /> */}

            <Route
              path="/userpanel"
              element={
                <ProtectedRoute requiredRole="user">
                  <UserPanel user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            <Route path="/adminpanel" element={<AdminPanel />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
};

export default App;
