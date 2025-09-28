import React from "react";

const UserRow = ({ user, onToggleStatus, onDelete }) => {
  const handleToggleStatus = () => {
    const newStatus = user.active ? false : true;
    onToggleStatus(user._id, newStatus);
  };

  const handleDelete = () => {
    const confirmText = prompt(
      `Aby usunąć użytkownika ${user.email}, wpisz: delete`
    );
    if (confirmText === "delete") {
      onDelete(user._id);
    } else {
      alert("Usuwanie przerwane. Nie wpisałeś poprawnego słowa.");
    }
  };

  return (
    <tr className="text-center">
      <td className="border border-gray-300 px-4 py-2">{user.name}</td>
      <td className="border border-gray-300 px-4 py-2">{user.email}</td>
      <td className="border border-gray-300 px-4 py-2">
        {user.active ? (
          <span className="text-green-600 font-semibold">Aktywny</span>
        ) : (
          <span className="text-red-600 font-semibold">Nieaktywny</span>
        )}
      </td>
      <td className="border border-gray-300 px-4 py-2 space-x-2">
        {/* Przycisk do aktywacji/dezaktywacji */}
        <button
          onClick={handleToggleStatus}
          className={`px-3 py-1 rounded text-white ${
            user.active
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {user.active ? "Dezaktywuj" : "Aktywuj"}
        </button>

        {/* Przycisk do usuwania */}
        <button
          onClick={handleDelete}
          className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
        >
          Usuń
        </button>
      </td>
    </tr>
  );
};

export default UserRow;

// import { useDispatch } from "react-redux";
// //import { deleteUser, deactivateUser } from "../userSlice";

// const UserRow = ({ user }) => {
//   const dispatch = useDispatch();

//   // const handleDelete = () => {
//   //   dispatch(deleteUser(user._id));
//   // };

//   // const handleDeactivate = () => {
//   //   dispatch(deactivateUser(user._id));
//   // };

//   return (
//     <tr>
//       <td>{user.name}</td>
//       <td>{user.email}</td>
//       <td>{user.active ? "Aktywny" : "Nieaktywny"}</td>
//       <td>
//         {/* <button
//           onClick={handleDeactivate}
//           className="mr-2 bg-yellow-400 px-2 py-1"
//         >
//           Dezaktywuj
//         </button>
//         <button
//           onClick={handleDelete}
//           className="bg-red-500 px-2 py-1 text-white"
//         >
//           Usuń
//         </button> */}
//       </td>
//     </tr>
//   );
// };

// export default UserRow;
