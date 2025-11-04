import { useSelector } from "react-redux";

import type { RootState } from "../store";
import UserOrders from "../components/orders/UserOrders";
import UserResources from "../components/orders/UserResources";
import Navbar from "../components/elements/Navbar";
//import LogoutButton from "./auth/LogoutButton";

const UserPanel = () => {
  //const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <div>
      <Navbar />
      <h1>Witaj, {user ? user.name : "Gościu"}!</h1>
      {/* {user && <LogoutButton />} */}
      <UserOrders />
      <br></br>
      <UserResources />
    </div>
  );
};

export default UserPanel;
