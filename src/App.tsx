//import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Shop from "./components/Shop";
import UserLogin from "./components/UserLogin";
import AdminLogin from "./components/AdminLogin";
import UserPanel from "./components/UserPanel";
import AdminPanel from "./components/AdminPanel";
import Homepage from "./pages/Homepage";
import ProtectedRoute from "./routes/ProtectedRoute";
import "./App.css";

const App = () => {
  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/homepage" />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/shop" element={<Shop />} />

            {/* przekazujemy callback do logowania */}
            <Route path="/userlogin" element={<UserLogin />} />
            <Route path="/adminlogin" element={<AdminLogin />} />

            {/* <Route path="/userlogin" element={<UserLogin />} />
            <Route path="/adminlogin" element={<AdminLogin />} /> */}

            <Route
              path="/userpanel"
              element={
                <ProtectedRoute requiredRole="user">
                  <UserPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminpanel"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            {/* <Route path="/adminpanel" element={<AdminPanel />} /> */}
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
};

export default App;
