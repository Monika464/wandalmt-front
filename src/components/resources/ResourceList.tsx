import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import {
  fetchResources,
  deleteResource,
} from "../../store/slices/resourceSlice";
import VideoTitle from "../video/VideoTitle";
import Thumbnail from "../video/Thumbnail";
import type { IChapter } from "../../types/types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ResourceListComponent() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items, total, loading, error, page, pageSize } = useSelector(
    (state: RootState) => state.resources,
  );

  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  );
  const [deleteInput, setDeleteInput] = useState("");

  const handlePlayVideo = (chapter: IChapter) => {
    console.log("handlePlayVideo called with chapter:", chapter);
    if (chapter.videoId) {
      console.log("Navigating to video:", chapter.videoId);
      navigate(`/watch/${chapter.videoId}`);
    } else {
      alert(t("resource.noVideo"));
    }
  };

  useEffect(() => {
    dispatch(fetchResources({ page, pageSize, q: search }));
  }, [dispatch, page, pageSize, search]);

  const toggleChapters = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleDelete = (id: string) => {
    if (confirmingDeleteId !== id) {
      setConfirmingDeleteId(id);
      setDeleteInput("");
      return;
    }

    if (deleteInput.trim().toLowerCase() === "delete") {
      dispatch(deleteResource(id));
      setConfirmingDeleteId(null);
      setDeleteInput("");
    } else {
      alert(t("resource.deleteConfirmationMessage")); // 👈 Tłumaczenie
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">{t("resource.listTitle")}</h1>{" "}
      {/* search */}
      <div className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("common.searchPlaceholder")}
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
          {t("common.search")}
        </button>
      </div>
      {/* errors */}
      {error && <div className="text-red-500 mb-3">{error}</div>}
      {/* table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">
                {t("resource.title")}
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium">
                {t("resource.product")}
              </th>
              <th className="px-4 py-2 text-right text-sm font-medium">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  {t("common.loading")} {/* 👈 Tłumaczenie */}
                </td>
              </tr>
            ) : items && items.length > 0 ? (
              items.map((r) => (
                <React.Fragment key={r._id}>
                  <tr>
                    <td className="px-4 py-3 text-sm">{r.title}</td>
                    <td className="px-4 py-3 text-sm">{r.productId}</td>
                    <td className="px-4 py-3 text-right text-sm flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => toggleChapters(r._id!)}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        {expandedId === r._id
                          ? t("resource.hideChapters")
                          : t("resource.showChapters")}
                      </button>

                      {confirmingDeleteId === r._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            placeholder={t("resource.typeDelete")}
                            className="border rounded px-2 py-1 text-sm w-28"
                            autoFocus
                          />
                          <button
                            onClick={() => handleDelete(r._id!)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            {t("common.confirm")}
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteId(null)}
                            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                          >
                            {t("common.cancel")}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDelete(r._id!)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          {t("common.delete")}
                        </button>
                      )}
                    </td>
                  </tr>

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
                                <p>{ch.number}</p>
                                <p>{ch.title}</p>
                              </div>
                              {ch.description && (
                                <div className="text-sm text-gray-600">
                                  {ch.description}
                                </div>
                              )}
                              <div className="flex flex-col md:flex-row gap-4 items-start">
                                <div className="flex-shrink-0">
                                  <Thumbnail
                                    bunnyVideoId={ch.bunnyVideoId || ""}
                                  />
                                </div>

                                <div className="flex-1">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">
                                        {t("resource.video")}:
                                      </span>
                                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                        {ch.videoId ? (
                                          <VideoTitle videoId={ch.videoId} />
                                        ) : (
                                          <span className="text-gray-400">
                                            {t("resource.noVideo")}
                                          </span>
                                        )}
                                      </code>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={() => handlePlayVideo(ch)}
                                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                    >
                                      ▶️ {t("resource.playVideo")}
                                    </button>
                                  </div>
                                </div>
                              </div>
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
                          {t("resource.noChapters")}
                        </td>
                      </tr>
                    )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  {t("common.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
        <p className="text-sm text-gray-600">
          {t("resource.total")}: {total}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() =>
              dispatch(
                fetchResources({ page: page > 1 ? page - 1 : 1, pageSize }),
              )
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page <= 1}
          >
            {t("pagination.previous")}
          </button>
          <span className="text-sm px-2">{page}</span>
          <button
            onClick={() =>
              dispatch(fetchResources({ page: page + 1, pageSize }))
            }
            className="px-3 py-1 border rounded"
          >
            {t("pagination.next")}
          </button>
        </div>
      </div>
    </div>
  );
}
