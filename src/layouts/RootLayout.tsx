// layouts/RootLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/elements/Navbar";
import Footer from "../components/elements/Footer";

const RootLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
