import { useSelector } from "react-redux";

import type { RootState } from "../store";
import UserOrders from "../components/orders/UserOrders";
import UserResources from "../components/orders/UserResources";
import Navbar from "../components/elements/Navbar";
import { Link } from "react-router-dom";
//import LogoutButton from "./auth/LogoutButton";

const UserPanel = () => {
  //const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <div>
      <Navbar />
      <h1>Witaj, {user ? user.name : "Gościu"}!</h1>
      {/* {user && <LogoutButton />} */}
      <Link
        to="userorders"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Zobacz orders
      </Link>
      <Link
        to="userresources"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Zobacz produkty
      </Link>
      {/* <UserOrders />
      <br></br>
      <UserResources /> */}
    </div>
  );
};

export default UserPanel;
