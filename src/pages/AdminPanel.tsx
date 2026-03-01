import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AdminOrdersSummary from "../components/orders/AdminOrdersSummary";
import AdminFinancials from "../components/orders/AdminFinancials";

const AdminPanel = () => {
  //const { user } = useSelector((state: RootState) => state.auth);
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={`/login?redirect=${encodeURIComponent("/adminpanel")}`} />
    );
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return (
    <div className="p-6">
      {/* <h1 className="text-2xl font-bold mb-4">Panel Administratora</h1>

      <nav className="flex flex-col gap-2 mb-4">
        <Link
          to="/admin/resources"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Zobacz zasoby
        </Link>
        <br></br>
        <Link
          to="/admin/products"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Zobacz produkty
        </Link>
        <br></br>
        <Link
          to="/admin/users"
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Użytkownicy
        </Link>
      </nav>
      <br></br> */}

      <AdminOrdersSummary />
      <AdminFinancials />
      <br></br>
      <br></br>
      {/* <VideoUploader /> */}
      <br></br>
      <br></br>
      {/* <DiscountManager /> */}
    </div>
  );
};

export default AdminPanel;
