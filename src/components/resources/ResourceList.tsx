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

  useEffect(() => {
    dispatch(fetchResources({ page, pageSize, q: search }));
  }, [dispatch, page, pageSize, search]);

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
          onClick={() => dispatch(fetchResources({ q: search, page: 1 }))}
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
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  Brak danych
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r._id.toString()}>
                  <td className="px-4 py-3 text-sm">{r.title}</td>
                  <td className="px-4 py-3 text-sm">
                    {r.productId.toString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => dispatch(deleteResource(r._id.toString()))}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import type { RootState } from "../../store";
// import { fetchResource } from "../../store/slices/resourceSlice";

// // ResourceListComponent.jsx
// // Single-file React component (default export) that fetches resources from
// // an API, displays them in a responsive list/table, and allows deleting
// // individual resources with confirmation, optimistic UI update and error handling.
// // Tailwind CSS classes are used for styling.

// export default function ResourceListComponent({ apiBase = "/api/resources" }) {
//   const [resources, setResources] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [deletingId, setDeletingId] = useState(null); // id currently being deleted
//   const [confirmId, setConfirmId] = useState(null); // id for which modal shows
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [pageSize] = useState(20);
//   const [totalCount, setTotalCount] = useState(0);

//   // Helper: get token from storage (adjust if you use cookies instead)
//   function getAuthHeader() {
//     const token = localStorage.getItem("token") || localStorage.getItem("jwt");
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   }

//   // Fetch resources with optional pagination and search

//   export const ResourcesList: React.FC = () => {
//     const dispatch = useDispatch<AppDispatch>();

//     const { products, loading, error } = useSelector(
//       (state: RootState) => state.products
//     );

//     useEffect(() => {
//       dispatch(fetchResource());
//     }, [dispatch]);

//     return <div></div>;
//   };

//   async function fetchResources() {
//     setLoading(true);
//     setError(null);
//     try {
//       const params = new URLSearchParams();
//       params.set("page", page);
//       params.set("pageSize", pageSize);
//       if (search) params.set("q", search);

//       const res = await fetch(`${apiBase}?${params.toString()}`, {
//         headers: {
//           "Content-Type": "application/json",
//           ...getAuthHeader(),
//         },
//       });

//       if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
//       const data = await res.json();

//       // Expecting { items: [..], total: number }
//       setResources(data.items || data);
//       setTotalCount(
//         typeof data.total === "number"
//           ? data.total
//           : (data.items || data).length
//       );
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Wystąpił błąd podczas pobierania zasobów.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchResources();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, search]);

//   // Delete handler with optimistic update
//   async function handleDelete(id) {
//     // Close confirm modal
//     setConfirmId(null);

//     // Save snapshot for rollback
//     const snapshot = resources;

//     // Optimistic UI: remove locally
//     setResources((prev) => prev.filter((r) => r._id !== id && r.id !== id));
//     setDeletingId(id);

//     try {
//       const res = await fetch(`${apiBase}/${id}`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           ...getAuthHeader(),
//         },
//       });

//       if (!res.ok) {
//         // rollback
//         setResources(snapshot);
//         const text = await res.text();
//         throw new Error(`Usuwanie nie powiodło się: ${res.status} ${text}`);
//       }

//       // successful: optionally show toast (not included)
//       // refetch to keep counts accurate (optional)
//       fetchResources();
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Błąd przy usuwaniu zasobu.");
//     } finally {
//       setDeletingId(null);
//     }
//   }

//   // UI helpers
//   const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-2xl font-semibold">Zasoby</h2>
//         <div className="flex gap-2 items-center">
//           <input
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setPage(1);
//             }}
//             placeholder="Szukaj..."
//             className="border rounded px-3 py-2 text-sm w-64"
//           />
//           <button
//             onClick={() => fetchResources()}
//             className="px-3 py-2 rounded shadow-sm bg-slate-100 hover:bg-slate-200 text-sm"
//           >
//             Odśwież
//           </button>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       <div className="bg-white shadow rounded overflow-auto">
//         <table className="min-w-full divide-y">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-4 py-2 text-left text-sm font-medium">Nazwa</th>
//               <th className="px-4 py-2 text-left text-sm font-medium">Typ</th>
//               <th className="px-4 py-2 text-left text-sm font-medium">
//                 Właściciel
//               </th>
//               <th className="px-4 py-2 text-left text-sm font-medium">
//                 Utworzono
//               </th>
//               <th className="px-4 py-2 text-right text-sm font-medium">
//                 Akcje
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y">
//             {loading ? (
//               <tr>
//                 <td
//                   colSpan={5}
//                   className="p-6 text-center text-sm text-gray-500"
//                 >
//                   Ładowanie...
//                 </td>
//               </tr>
//             ) : resources.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={5}
//                   className="p-6 text-center text-sm text-gray-500"
//                 >
//                   Brak zasobów.
//                 </td>
//               </tr>
//             ) : (
//               resources.map((r) => (
//                 <tr key={r._id || r.id}>
//                   <td className="px-4 py-3 text-sm">
//                     {r.name || r.title || "-"}
//                   </td>
//                   <td className="px-4 py-3 text-sm">
//                     {r.type || r.category || "-"}
//                   </td>
//                   <td className="px-4 py-3 text-sm">
//                     {r.ownerName || r.owner || "-"}
//                   </td>
//                   <td className="px-4 py-3 text-sm">
//                     {new Date(
//                       r.createdAt || r.created || r.date || Date.now()
//                     ).toLocaleString()}
//                   </td>
//                   <td className="px-4 py-3 text-right text-sm">
//                     <div className="inline-flex gap-2">
//                       <button
//                         onClick={() =>
//                           window.open(`/resources/${r._id || r.id}`, "_blank")
//                         }
//                         className="px-3 py-1 rounded shadow-sm border text-sm hover:bg-slate-50"
//                       >
//                         Podgląd
//                       </button>

//                       <button
//                         onClick={() => setConfirmId(r._id || r.id)}
//                         className="px-3 py-1 rounded shadow-sm bg-red-600 text-white text-sm hover:bg-red-700"
//                         disabled={deletingId === (r._id || r.id)}
//                       >
//                         {deletingId === (r._id || r.id)
//                           ? "Usuwanie..."
//                           : "Usuń"}
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex items-center justify-between mt-4">
//         <div className="text-sm text-gray-600">Razem: {totalCount}</div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//             disabled={page <= 1}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Poprzednia
//           </button>
//           <div className="px-3 py-1">
//             {page} / {totalPages}
//           </div>
//           <button
//             onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//             disabled={page >= totalPages}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Następna
//           </button>
//         </div>
//       </div>

//       {/* Confirmation modal - simple implementation */}
//       {confirmId && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
//             <h3 className="text-lg font-semibold mb-3">Potwierdź usunięcie</h3>
//             <p className="text-sm text-gray-700 mb-4">
//               Na pewno chcesz usunąć ten zasób? Akcja jest nieodwracalna.
//             </p>
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setConfirmId(null)}
//                 className="px-3 py-2 rounded border"
//               >
//                 Anuluj
//               </button>
//               <button
//                 onClick={() => handleDelete(confirmId)}
//                 className="px-3 py-2 rounded bg-red-600 text-white"
//               >
//                 Usuń
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /*
// Backend suggestions (Express + Mongoose)

// // routes/resources.js
// const express = require('express');
// const router = express.Router();
// const Resource = require('../models/resource');
// const auth = require('../middleware/auth'); // JWT middleware

// // GET /api/resources?page=1&pageSize=20&q=search
// router.get('/', auth, async (req, res) => {
//   const page = parseInt(req.query.page || '1', 10);
//   const pageSize = parseInt(req.query.pageSize || '20', 10);
//   const q = req.query.q || '';

//   const filter = {};
//   if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { type: new RegExp(q, 'i') }];

//   const [items, total] = await Promise.all([
//     Resource.find(filter).skip((page-1)*pageSize).limit(pageSize).lean(),
//     Resource.countDocuments(filter),
//   ]);

//   res.json({ items, total });
// });

// // DELETE /api/resources/:id
// router.delete('/:id', auth, async (req, res) => {
//   const id = req.params.id;
//   // You may want to check permissions here
//   const doc = await Resource.findByIdAndDelete(id);
//   if (!doc) return res.status(404).send('Not found');
//   res.status(204).send();
// });

// module.exports = router;

// Mongoose model: models/resource.js
// const mongoose = require('mongoose');
// const schema = new mongoose.Schema({
//   name: String,
//   type: String,
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   createdAt: { type: Date, default: Date.now },
// });
// module.exports = mongoose.model('Resource', schema);
// */
