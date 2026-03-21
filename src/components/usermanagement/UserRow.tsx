import type { User } from "../../types/types";
import { useTranslation } from "react-i18next";

interface UserRowProps {
  user: User;
  onToggleStatus: (userId: string, newStatus: boolean) => void;
  onDelete: (userId: string) => void;
}

const UserRow: React.FC<UserRowProps> = ({
  user,
  onToggleStatus,
  onDelete,
}) => {
  const { t } = useTranslation();

  const handleToggleStatus = () => {
    const newStatus = user.active ? false : true;
    onToggleStatus(user._id, newStatus);
  };

  const handleDelete = () => {
    const confirmText = prompt(
      t("user.deleteUserPrompt", { email: user.email }),
    );
    if (confirmText === "delete") {
      onDelete(user._id);
    } else {
      alert(t("user.deleteWrongWord"));
    }
  };

  return (
    <tr className="text-center hover:bg-gray-50">
      <td className="border border-gray-300 px-4 py-2">{user.name}</td>
      <td className="border border-gray-300 px-4 py-2">{user.email}</td>
      <td className="border border-gray-300 px-4 py-2">
        {user.active ? (
          <span className="text-green-600 font-semibold">
            {t("user.active")}
          </span>
        ) : (
          <span className="text-red-600 font-semibold">
            {t("user.inactive")}
          </span>
        )}
      </td>
      <td className="border border-gray-300 px-4 py-2 space-x-2">
        {/* Button to activate/deactivate */}
        <button
          onClick={handleToggleStatus}
          className={`px-3 py-1 rounded text-white ${
            user.active
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {user.active ? t("user.deactivate") : t("user.activate")}
        </button>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
        >
          {t("common.delete")}
        </button>
      </td>
    </tr>
  );
};

export default UserRow;
