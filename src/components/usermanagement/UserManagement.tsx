import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import {
  deleteUser,
  fetchUsers,
  toggleUserStatus,
} from "../../store/slices/userSlice";
import UserList from "./UserList";
import { useTranslation } from "react-i18next"; // 👈 Dodaj import

const UserManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation(); // 👈 Inicjalizacja

  const { users, status, error } = useSelector(
    (state: RootState) => state.users,
  );

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleToggleStatus = (userId: string, newStatus: boolean) => {
    dispatch(toggleUserStatus({ userId, newStatus }));
  };

  const handleDelete = (userId: string) => {
    const confirmText = prompt(t("user.deletePrompt")); // 👈 Tłumaczenie
    if (confirmText === "delete") {
      dispatch(deleteUser(userId));
    } else {
      alert(t("user.deleteCancelled")); // 👈 Tłumaczenie
    }
  };

  if (status === "loading") return <p>{t("common.loading")}</p>;
  if (status === "failed")
    return (
      <p>
        {t("common.error")}: {error}
      </p>
    );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{t("user.management")}</h2>
      <UserList
        users={users}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default UserManagement;
