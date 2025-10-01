import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import {
  deleteUser,
  fetchUsers,
  toggleUserStatus,
} from "../../store/slices/userSlice";
import UserList from "./UserList";
//import type IUser from "../../types/User";

// interface IUserList {
//   users: IUser[];
// }

const UserManagement = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { users, status, error } = useSelector(
    (state: RootState) => state.users
  );

  console.log(
    "UserManagement render - users:",
    users,
    "status:",
    status,
    "error:",
    error
  );

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleToggleStatus = (userId: string, newStatus: boolean) => {
    dispatch(toggleUserStatus({ userId, newStatus }));
  };

  const handleDelete = (userId: string) => {
    const confirmText = prompt("Aby usunąć użytkownika, wpisz: delete");
    if (confirmText === "delete") {
      dispatch(deleteUser(userId));
    } else {
      alert("Usuwanie przerwane — wpisz poprawnie delete.");
    }
  };

  if (status === "loading") return <p>Ładowanie...</p>;
  if (status === "failed") return <p>Błąd: {error}</p>;

  return (
    <div>
      {" "}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Zarządzanie użytkownikami</h2>
        <UserList
          users={users}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default UserManagement;
