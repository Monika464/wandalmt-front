import UserRow from "./UserRow";
import type { User } from "../../types/types";
import { useTranslation } from "react-i18next"; // 👈 Dodaj import

interface UserListProps {
  users: User[];
  onToggleStatus: (userId: string, newStatus: boolean) => void;
  onDelete: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  onToggleStatus,
  onDelete,
}) => {
  const { t } = useTranslation(); // 👈 Inicjalizacja

  return (
    <table className="table-auto w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 px-4 py-2">{t("user.name")}</th>
          <th className="border border-gray-300 px-4 py-2">
            {t("user.email")}
          </th>
          <th className="border border-gray-300 px-4 py-2">
            {t("user.status")}
          </th>
          <th className="border border-gray-300 px-4 py-2">
            {t("common.actions")}
          </th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <UserRow
            key={user._id}
            user={user}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
};

export default UserList;

// import UserRow from "./UserRow";

// import type { User } from "../../types/types";

// interface UserListProps {
//   users: User[];
//   onToggleStatus: (userId: string, newStatus: boolean) => void;
//   onDelete: (userId: string) => void;
// }

// const UserList: React.FC<UserListProps> = ({
//   users,
//   onToggleStatus,
//   onDelete,
// }) => {
//   return (
//     <table className="table-auto w-full border-collapse border border-gray-300">
//       <thead>
//         <tr className="bg-gray-100">
//           <th className="border border-gray-300 px-4 py-2">Imię</th>
//           <th className="border border-gray-300 px-4 py-2">Email</th>
//           <th className="border border-gray-300 px-4 py-2">Status</th>
//           <th className="border border-gray-300 px-4 py-2">Akcje</th>
//         </tr>
//       </thead>
//       <tbody>
//         {users.map((user) => (
//           <UserRow
//             key={user._id}
//             user={user}
//             onToggleStatus={onToggleStatus}
//             onDelete={onDelete}
//           />
//         ))}
//       </tbody>
//     </table>
//   );
// };

// export default UserList;
