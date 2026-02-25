import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Navbar from "./components/elements/Navbar";
import Footer from "./components/elements/Footer";

export const RootLayout = () => (
  <>
    <Navbar />
    <main className="container mx-auto px-4">
      <Outlet />
    </main>
    <Footer />
  </>
);
