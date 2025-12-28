import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AdminOrdersSummary from "../components/orders/AdminOrdersSummary";
import AdminFinancials from "../components/orders/AdminFinancials";
import Navbar from "../components/elements/Navbar";
import VideoUploader from "../components/video/VideoUploader";
import WatchVideoPage from "./WatchVideoPage";
import VideoList from "../components/video/VideoList";
import VideoTitle from "../components/video/VideoTitle";

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
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Panel Administratora</h1>

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
      <br></br>
      {/* LogoutButton pokazujemy tylko jeśli user jest zalogowany */}
      {/* {user && <LogoutButton />} */}

      <AdminOrdersSummary />
      <AdminFinancials />
      <br></br>
      <br></br>
      <VideoUploader />
      <br></br>
      {/* <WatchVideoPage /> */}
      <br></br>
      <VideoList />
      <p>title</p>
      <VideoTitle videoId={"695184f863d131abcd25a3e0"} />
    </div>
  );
};

export default AdminPanel;
