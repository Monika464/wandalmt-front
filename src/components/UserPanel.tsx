import { useSelector } from "react-redux";

import type { RootState } from "../store";
import LogoutButton from "./LogoutButton";

const UserPanel = () => {
  //const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <div>
      <h1>Witaj, {user ? user.name : "Gościu"}!</h1>
      {user && <LogoutButton />}
    </div>
  );
};

export default UserPanel;
