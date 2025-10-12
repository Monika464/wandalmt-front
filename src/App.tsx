//import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Shop from "./components/Shop";
//import UserLogin from "./components/UserLogin";
//import AdminLogin from "./components/AdminLogin";
import UserPanel from "./components/UserPanel";
import AdminPanel from "./components/AdminPanel";
import Homepage from "./pages/Homepage";
import ProtectedRoute from "./routes/ProtectedRoute";
import "./App.css";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import ProductItem from "./components/products/ProductItem";
import ProductResourcePage from "./pages/ProductResourcePage";
import ResourceEditPage from "./pages/ResourceEditPage";
import ResourceListComponent from "./components/resources/ResourceList";
import ProductListComponent from "./components/products/ProductList";
import UserManagement from "./components/usermanagement/UserManagement";

const App = () => {
  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/homepage" />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/shop" element={<Shop />} />

            {/* Strona produktu + jego zasób */}
            <Route
              path="/admin/products/:productId"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProductResourcePage />
                </ProtectedRoute>
              }
            />

            {/* Edycja zasobu */}
            <Route
              path="/admin/resources/:resourceId/edit"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ResourceEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/resources"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ResourceListComponent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProductListComponent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            {/* <Route path="/userlogin" element={<UserLogin />} />
            <Route path="/adminlogin" element={<AdminLogin />} /> */}

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

            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/homepage" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
};

export default App;
