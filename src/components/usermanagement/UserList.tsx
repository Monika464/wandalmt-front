import UserRow from "./UserRow";

const UserList = ({ users, onToggleStatus, onDelete }) => {
  return (
    <table className="table-auto w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 px-4 py-2">Imię</th>
          <th className="border border-gray-300 px-4 py-2">Email</th>
          <th className="border border-gray-300 px-4 py-2">Status</th>
          <th className="border border-gray-300 px-4 py-2">Akcje</th>
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

// const UserList = ({ users }) => {
//   return (
//     <table className="table-auto w-full">
//       <thead>
//         <tr>
//           <th>Imię</th>
//           <th>Email</th>
//           <th>Status</th>
//           <th>Akcje</th>
//         </tr>
//       </thead>
//       <tbody>
//         {users.map((user) => (
//           <UserRow key={user._id} user={user} />
//         ))}
//       </tbody>
//     </table>
//   );
// };

// export default UserList;
