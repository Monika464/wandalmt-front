//import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Shop from "./components/Shop";
//import UserLogin from "./components/UserLogin";
//import AdminLogin from "./components/AdminLogin";
import UserPanel from "./pages/UserPanel";
import AdminPanel from "./pages/AdminPanel";
import Homepage from "./pages/Homepage";
import ProtectedRoute from "./routes/ProtectedRoute";
import "./App.css";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
//import ProductItem from "./components/products/ProductItem";
import ProductResourcePage from "./pages/ProductResourcePage";
import ProductResourcePublicPage from "./pages/ProducuResourcePublicPage";
import ResourceEditPage from "./pages/ResourceEditPage";
import ResourceAdminListComponent from "./components/resources/ResourceList";
import ProductListComponent from "./components/products/ProductList";
import ProductListPublicComponent from "./components/products/ProductPublicList";
import UserManagement from "./components/usermanagement/UserManagement";
import CartCheckout from "./components/products/CartCheckout";
import CheckoutPage from "./pages/CheckoutPage";
import ReturnPage from "./pages/ReturnPage";
//import CartCheckoutPage from "./pages/CartCheckoutPage";
import CartReturnPage from "./pages/CartReturnPage";
import UserOrders from "./components/orders/UserOrders";
import UserResources from "./components/orders/UserResources";
import CreateProductForm from "./components/products/CreateProductForm";

import SetNewPassword from "./components/auth/SetNewPassword";
import PasswordResetRequest from "./components/auth/PasswordResetRequest";
//import VideoPlayer from "./components/video/VideoPlayer";
import WatchVideo from "./pages/WatchVideoPage";
import { useAutoRefresh } from "./hooks/useAutoRefresh";

const App = () => {
  useAutoRefresh();
  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/homepage" />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/shop" element={<Shop />} />

            {/* Routy public */}
            <Route path="/products" element={<ProductListPublicComponent />} />
            <Route
              path="products/:productId"
              element={<ProductResourcePublicPage />}
            />

            <Route path="/cart" element={<CartCheckout />} />

            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/return" element={<ReturnPage />} />
            {/* <Route path="/cart-checkout" element={<CartCheckoutPage />} /> */}
            <Route path="/cart-return" element={<CartReturnPage />} />

            <Route path="/reset-password/:token" element={<SetNewPassword />} />
            <Route
              path="/reset-password-request"
              element={<PasswordResetRequest />}
            />
            {/* Routy admina */}
            <Route
              path="/admin/products/:productId"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProductResourcePage />
                </ProtectedRoute>
              }
            />

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
                  <ResourceAdminListComponent />
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

            <Route
              path="/adminpanel"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/createproduct"
              element={
                <ProtectedRoute requiredRole="admin">
                  <CreateProductForm />
                </ProtectedRoute>
              }
            />

            {/* Routy usera */}

            <Route
              path="/userpanel"
              element={
                <ProtectedRoute requiredRole="user">
                  <UserPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userpanel/userorders"
              element={
                <ProtectedRoute requiredRole="user">
                  <UserOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/userpanel/userresources"
              element={
                <ProtectedRoute requiredRole="user">
                  <UserResources />
                </ProtectedRoute>
              }
            />

            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/watch/:videoId" element={<WatchVideo />} />
            <Route path="*" element={<Navigate to="/homepage" />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
};

export default App;
