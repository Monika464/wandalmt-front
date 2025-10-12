import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import {
  fetchResources,
  deleteResource,
} from "../../store/slices/resourceSlice";

export default function ResourceListComponent() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, total, loading, error, page, pageSize } = useSelector(
    (state: RootState) => state.resources
  );

  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null
  );
  const [deleteInput, setDeleteInput] = useState("");

  //console.log("serach", search);

  useEffect(() => {
    dispatch(fetchResources({ page, pageSize, q: search }));
    // .unwrap()
    // .then(() => console.log("✅ Thunk resolved"))
    // .catch((e) => console.error("❌ Thunk rejected", e));
  }, [dispatch, page, pageSize, search]);

  const toggleChapters = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDelete = (id: string) => {
    // włączenie trybu potwierdzenia
    if (confirmingDeleteId !== id) {
      setConfirmingDeleteId(id);
      setDeleteInput("");
      return;
    }

    // jeśli wpisano "delete" — usuń
    if (deleteInput.trim().toLowerCase() === "delete") {
      dispatch(deleteResource(id));
      setConfirmingDeleteId(null);
      setDeleteInput("");
    } else {
      alert('Aby usunąć zasób, wpisz dokładnie "delete".');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Lista zasobów</h1>

      {/* wyszukiwarka */}
      <div className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj..."
          className="border rounded px-3 py-2 text-sm w-64"
        />
        <button
          onClick={() =>
            dispatch(fetchResources({ q: search, page: 1 }))
              .unwrap()
              .then(() => console.log("✅ thunk resolved"))
              .catch((e) => console.error("❌ thunk rejected", e))
          }
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Szukaj
        </button>
      </div>

      {/* błędy */}
      {error && <div className="text-red-500 mb-3">{error}</div>}

      {/* tabela */}
      <div className="bg-white shadow rounded">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">Tytuł</th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                Produkt
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  Ładowanie...
                </td>
              </tr>
            ) : items && items.length > 0 ? (
              items.map((r) => (
                <React.Fragment key={r._id}>
                  <tr>
                    <td className="px-4 py-3 text-sm">{r.title}</td>
                    <td className="px-4 py-3 text-sm">{r.productId}</td>
                    <td className="px-4 py-3 text-right text-sm flex justify-end gap-2">
                      <button
                        onClick={() => toggleChapters(r._id)}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        {expandedId === r._id
                          ? "Ukryj rozdziały"
                          : "Pokaż rozdziały"}
                      </button>

                      {confirmingDeleteId === r._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            placeholder='Wpisz "delete"'
                            className="border rounded px-2 py-1 text-sm w-28"
                            autoFocus
                          />
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Potwierdź
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteId(null)}
                            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                          >
                            Anuluj
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Usuń
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Sekcja rozdziałów */}
                  {expandedId === r._id && r.chapters?.length > 0 && (
                    <tr>
                      <td colSpan={3} className="bg-gray-50 p-4">
                        <ul className="space-y-2">
                          {r.chapters.map((ch) => (
                            <li
                              key={ch._id || ch.title}
                              className="border rounded p-2 bg-white shadow-sm"
                            >
                              <div className="font-semibold text-gray-800">
                                {ch.title}
                              </div>
                              {ch.description && (
                                <div className="text-sm text-gray-600">
                                  {ch.description}
                                </div>
                              )}
                              {ch.videoUrl && (
                                <a
                                  href={ch.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 text-sm underline"
                                >
                                  Zobacz wideo
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}

                  {expandedId === r._id &&
                    (!r.chapters || r.chapters.length === 0) && (
                      <tr>
                        <td
                          colSpan={3}
                          className="bg-gray-50 p-4 text-center text-gray-500 italic"
                        >
                          Brak rozdziałów
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  Brak danych
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* paginacja */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">Łącznie: {total}</p>
        <div className="flex gap-2">
          <button
            onClick={() =>
              dispatch(
                fetchResources({ page: page > 1 ? page - 1 : 1, pageSize })
              )
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page <= 1}
          >
            Poprzednia
          </button>
          <span className="text-sm px-2">{page}</span>
          <button
            onClick={() =>
              dispatch(fetchResources({ page: page + 1, pageSize }))
            }
            className="px-3 py-1 border rounded"
          >
            Następna
          </button>
        </div>
      </div>
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import type { AppDispatch, RootState } from "../../store";
// import {
//   fetchResources,
//   deleteResource,
// } from "../../store/slices/resourceSlice";

// export default function ResourceListComponent() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { items, total, loading, error, page, pageSize } = useSelector(
//     (state: RootState) => state.resources
//   );

//   const [search, setSearch] = useState("");
//   const [expandedId, setExpandedId] = useState<string | null>(null); // 👈 zapamiętuje który zasób ma pokazane rozdziały

//   useEffect(() => {
//     dispatch(fetchResources({ page, pageSize, q: search }))
//       .unwrap()
//       .then(() => console.log("✅ Thunk resolved"))
//       .catch((e) => console.error("❌ Thunk rejected", e));
//   }, [dispatch, page, pageSize, search]);

//   const toggleChapters = (id: string) => {
//     setExpandedId((prev) => (prev === id ? null : id));
//   };

//   return (
//     <div className="p-6 max-w-5xl mx-auto">
//       <h1 className="text-2xl font-semibold mb-4">Lista zasobów</h1>

//       {/* wyszukiwarka */}
//       <div className="flex gap-2 mb-4">
//         <input
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Szukaj..."
//           className="border rounded px-3 py-2 text-sm w-64"
//         />
//         <button
//           onClick={() => dispatch(fetchResources({ q: search, page: 1 }))}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//         >
//           Szukaj
//         </button>
//       </div>

//       {/* błędy */}
//       {error && <div className="text-red-500 mb-3">{error}</div>}

//       {/* tabela */}
//       <div className="bg-white shadow rounded">
//         <table className="min-w-full divide-y">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-2 text-left text-sm font-medium">Tytuł</th>
//               <th className="px-4 py-2 text-left text-sm font-medium">
//                 Produkt
//               </th>
//               <th className="px-4 py-2 text-right text-sm font-medium">
//                 Akcje
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y">
//             {loading ? (
//               <tr>
//                 <td colSpan={3} className="p-4 text-center text-gray-500">
//                   Ładowanie...
//                 </td>
//               </tr>
//             ) : items && items.length > 0 ? (
//               items.map((r) => (
//                 <React.Fragment key={r._id}>
//                   <tr>
//                     <td className="px-4 py-3 text-sm">{r.title}</td>
//                     <td className="px-4 py-3 text-sm">{r.productId}</td>
//                     <td className="px-4 py-3 text-right text-sm flex justify-end gap-2">
//                       <button
//                         onClick={() => toggleChapters(r._id)}
//                         className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
//                       >
//                         {expandedId === r._id
//                           ? "Ukryj rozdziały"
//                           : "Pokaż rozdziały"}
//                       </button>
//                       <button
//                         onClick={() => dispatch(deleteResource(r._id))}
//                         className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
//                       >
//                         Usuń
//                       </button>
//                     </td>
//                   </tr>

//                   {/* Sekcja rozdziałów */}
//                   {expandedId === r._id && r.chapters?.length > 0 && (
//                     <tr>
//                       <td colSpan={3} className="bg-gray-50 p-4">
//                         <ul className="space-y-2">
//                           {r.chapters.map((ch) => (
//                             <li
//                               key={ch._id || ch.title}
//                               className="border rounded p-2 bg-white shadow-sm"
//                             >
//                               <div className="font-semibold text-gray-800">
//                                 {ch.title}
//                               </div>
//                               {ch.description && (
//                                 <div className="text-sm text-gray-600">
//                                   {ch.description}
//                                 </div>
//                               )}
//                               {ch.videoUrl && (
//                                 <a
//                                   href={ch.videoUrl}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                   className="text-blue-600 text-sm underline"
//                                 >
//                                   Zobacz wideo
//                                 </a>
//                               )}
//                             </li>
//                           ))}
//                         </ul>
//                       </td>
//                     </tr>
//                   )}

//                   {/* Gdy brak rozdziałów */}
//                   {expandedId === r._id &&
//                     (!r.chapters || r.chapters.length === 0) && (
//                       <tr>
//                         <td
//                           colSpan={3}
//                           className="bg-gray-50 p-4 text-center text-gray-500 italic"
//                         >
//                           Brak rozdziałów
//                         </td>
//                       </tr>
//                     )}
//                 </React.Fragment>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={3} className="p-4 text-center text-gray-500">
//                   Brak danych
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* paginacja */}
//       <div className="flex justify-between items-center mt-4">
//         <p className="text-sm text-gray-600">Łącznie: {total}</p>
//         <div className="flex gap-2">
//           <button
//             onClick={() =>
//               dispatch(
//                 fetchResources({ page: page > 1 ? page - 1 : 1, pageSize })
//               )
//             }
//             className="px-3 py-1 border rounded disabled:opacity-50"
//             disabled={page <= 1}
//           >
//             Poprzednia
//           </button>
//           <span className="text-sm px-2">{page}</span>
//           <button
//             onClick={() =>
//               dispatch(fetchResources({ page: page + 1, pageSize }))
//             }
//             className="px-3 py-1 border rounded"
//           >
//             Następna
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
