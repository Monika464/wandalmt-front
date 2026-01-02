// components/resources/EditResourceForm.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import type { IResource, IChapter } from "../../types"; // Zaktualizowany import
import {
  editResource,
  addChapter,
  editChapter,
  deleteChapter,
  //deleteChapterVideo,
  fetchResourceById,
} from "../../store/slices/resourceSlice";

import VideoUploader from "../video/VideoUploader";
import { useNavigate } from "react-router-dom";

import Thumbnail from "../video/Thumbnail";
import VideoTitle from "../video/VideoTitle";
import { useVideoNavigation } from "../../hooks/useVideoNavigation";

interface Props {
  resource: IResource;
  onClose: () => void;
}

const EditResourceForm: React.FC<Props> = ({ resource, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { handlePlayVideo } = useVideoNavigation();

  const [title, setTitle] = useState(resource.title);
  const [content, setContent] = useState(resource.content || "");
  // const [chapters, setChapters] = useState<IChapter[]>(
  //   (resource.chapters || []).map((ch, index) => ({
  //     ...ch,
  //     number: ch.number ?? index + 1,
  //   }))
  // );
  // Pobierz aktualny resource z Redux
  const selectedResource = useSelector(
    (state: RootState) => state.resources.selected
  );
  const selecteddVideo = useSelector((state: RootState) => state.video);
  const videoIdforTitle = selecteddVideo.video
    ? selecteddVideo.video._id
    : null;

  const [chapters, setChapters] = useState<IChapter[]>([]);
  const [activeUploads, setActiveUploads] = useState<
    Record<string, { videoId: string | null; bunnyGuid: string | null }>
  >({});
  // UWAGA: Teraz używamy bunnyVideoId zamiast videoId
  const [newChapter, setNewChapter] = useState<IChapter>({
    _id: "",
    number: chapters.length + 1,
    title: "",
    description: "",
    bunnyVideoId: "", // ZMIANA: z videoId na bunnyVideoId
  });

  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [isEditingResource, setIsEditingResource] = useState(true);

  useEffect(() => {
    if (selectedResource?.chapters) {
      setChapters(
        selectedResource.chapters.map((ch, index) => ({
          ...ch,
          number: ch.number ?? index + 1,
        }))
      );
    }
  }, [selectedResource]);

  const handleSaveResource = async () => {
    try {
      await dispatch(
        editResource({
          id: resource._id!,
          resourceData: { title, content },
        })
      ).unwrap();
      alert("Resource updated!");
      setIsEditingResource(false);
    } catch (err) {
      console.error(err);
      alert("Error updating resource");
    }
  };

  // Add new chapter - ZAKTUALIZOWANE
  const handleAddChapter = async () => {
    console.log("Adding new chapter:", newChapter);
    if (!newChapter.title) {
      alert("Chapter title is required");
      return;
    }
    // Sprawdź czy mamy bunnyVideoId (musi być!)
    if (!newChapter.bunnyVideoId) {
      alert("Proszę najpierw wgrać wideo przed dodaniem rozdziału!");
      return;
    }

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(newChapter.videoId || "");

    // Używamy bunnyVideoId zamiast videoId
    const chapterData: any = {
      number: newChapter.number ?? chapters.length + 1,
      title: newChapter.title,
      description: newChapter.description || undefined,
      //bunnyVideoId: newChapter.bunnyVideoId || undefined,
      bunnyVideoId: newChapter.bunnyVideoId,
    };

    if (isValidObjectId) {
      chapterData.videoId = newChapter.videoId;
    }

    try {
      await dispatch(
        addChapter({
          resourceId: resource._id!,
          chapterData,
        })
      ).unwrap();

      // Refresh chapters list
      const updatedResource = await dispatch(
        fetchResourceById(resource._id!)
      ).unwrap();

      setChapters(updatedResource.chapters || []);
      setNewChapter({
        number: (updatedResource.chapters?.length || chapters.length) + 1,
        title: "",
        description: "",
        bunnyVideoId: "",
        videoId: "",
        _id: "",
      });
    } catch (err) {
      console.error(err);
      alert("Error adding chapter");
    }
  };

  // Edit chapter - ZAKTUALIZOWANE
  const handleEditChapter = async (chapterId: string, updated: IChapter) => {
    try {
      const updatedResource = await dispatch(
        editChapter({
          resourceId: resource._id!,
          chapterId,
          chapterData: updated,
        })
      ).unwrap();

      //setChapters(updatedResource.chapters || []);
      setEditingChapterId(null);
    } catch (err) {
      console.error(err);
      alert("Error editing chapter");
    }
  };

  // Delete chapter video - ZAKTUALIZOWANE
  // const handleDeleteChapterVideo = async (chapterId: string) => {
  //   if (!window.confirm("Na pewno chcesz usunąć wideo z tego rozdziału?"))
  //     return;

  //   try {
  //     await dispatch(
  //       deleteChapterVideo({
  //         resourceId: resource._id!,
  //         chapterId,
  //       })
  //     ).unwrap();

  //     // Refresh chapter data
  //     const updatedResource = await dispatch(
  //       fetchResourceById(resource._id!)
  //     ).unwrap();

  //     setChapters(updatedResource.chapters || []);
  //     alert("Wideo zostało usunięte");
  //   } catch (err) {
  //     console.error(err);
  //     alert("Error deleting video");
  //   }
  // };

  // Delete chapter
  const handleDeleteChapter = async (chapter: IChapter) => {
    if (!window.confirm("Na pewno chcesz usunąć ten rozdział?")) return;
    try {
      await dispatch(
        deleteChapter({
          resourceId: resource._id!,
          chapterId: chapter._id,
          videoId: chapter.videoId,
        })
      ).unwrap();

      // Refresh chapters list
      const updatedResource = await dispatch(
        fetchResourceById(resource._id!)
      ).unwrap();

      setChapters(updatedResource.chapters || []);
    } catch (err) {
      console.error(err);
      alert("Error deleting chapter");
    }
  };

  // Handle video uploaded - ZAKTUALIZOWANE
  const handleVideoUploaded = async (
    chapterId: string,
    videoId: string,
    bunnyGuid: string
  ) => {
    console.log("Video uploaded for chapter:", chapterId, {
      videoId,
      bunnyGuid,
    });

    // Ustaw aktywny upload dla tego rozdziału
    setActiveUploads((prev) => ({
      ...prev,
      [chapterId]: { videoId, bunnyGuid },
    }));
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(videoId);

    if (!isValidObjectId) {
      console.warn("Invalid videoId format:", videoId);
      // Możesz tutaj wywołać API żeby znaleźć video po bunnyGuid
      // i uzyskać prawidłowe videoId
    }

    if (chapterId === "new") {
      // For new chapter - zapisujemy TYLKO bunnyGuid jako bunnyVideoId
      setNewChapter((prev) => ({
        ...prev,
        bunnyVideoId: bunnyGuid,
        //videoId: videoId,
        videoId: videoId === "pending" ? "" : videoId,
      }));
    } else {
      try {
        const chapterData: any = {
          bunnyVideoId: bunnyGuid,
        };

        if (isValidObjectId) {
          chapterData.videoId = videoId;
        }

        await dispatch(
          editChapter({
            resourceId: resource._id!,
            chapterId,
            chapterData,
          })
        ).unwrap();

        // Odśwież dane
        const updatedResource = await dispatch(
          fetchResourceById(resource._id!)
        ).unwrap();
        setChapters(updatedResource.chapters || []);
      } catch (err) {
        console.error("Error updating chapter with video:", err);
      }
    }
  };

  // const handlePlayVideo = useCallback(
  //   (chapter: IChapter) => {
  //     if (chapter.videoId) {
  //       console.log("Navigating to video:", chapter.videoId);
  //       navigate(`/watch/${chapter.videoId}`);
  //     } else {
  //       alert("No video available for this chapter");
  //     }
  //   },
  //   [navigate]
  // );

  // const handlePlayVideo = (chapter: IChapter) => {
  //   console.log("handlePlayVideo called with chapter:", chapter);
  //   if (chapter.videoId) {
  //     console.log("Navigating to video:", chapter.videoId);
  //     navigate(`/watch/${chapter.videoId}`);
  //   } else {
  //     alert("No video available for this chapter");
  //   }
  // };

  return (
    <div className="p-4 border rounded-md bg-gray-50 relative">
      <h2 className="text-xl font-bold mb-4">Edit Resource</h2>

      {/* Resource fields - bez zmian */}
      {isEditingResource ? (
        <>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded mb-2 w-full"
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border p-2 rounded mb-2 w-full"
          />

          <button
            onClick={handleSaveResource}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          >
            Save Resource
          </button>
        </>
      ) : (
        <>
          <p>
            <strong>Title:</strong> {title}
          </p>
          <p>
            <strong>Content:</strong> {content}
          </p>

          <button
            onClick={() => setIsEditingResource(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded mb-4"
          >
            Edit Resource
          </button>
        </>
      )}

      <hr className="my-4" />

      {/* Chapter list - ZAKTUALIZOWANE: używamy bunnyVideoId */}
      <h3 className="text-lg font-semibold mb-2">Chapters</h3>
      {chapters && chapters.length > 0 ? (
        chapters.map((ch) => (
          <div key={ch._id} className="border p-2 rounded mb-2 relative">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-bold text-gray-700">#{ch.number}</span>
                <h4 className="text-lg font-semibold">{ch.title}</h4>
                {ch.description && (
                  <p className="text-gray-600 mt-1">{ch.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setEditingChapterId(
                      editingChapterId === ch._id ? null : ch._id!
                    )
                  }
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  {editingChapterId === ch._id ? "Close" : "Edit Chapter"}
                </button>
                <button
                  onClick={() => handleDeleteChapter(ch)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Delete Chapter
                </button>
              </div>
            </div>

            {/* Video Section - ZAKTUALIZOWANE: używamy bunnyVideoId */}
            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <h5 className="font-semibold mb-2">Video</h5>

              {ch.bunnyVideoId || ch.videoId ? (
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-shrink-0">
                    <Thumbnail bunnyVideoId={ch.bunnyVideoId || ""} />
                  </div>

                  <div className="flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Video:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {/* {ch.videoId} */}{" "}
                          <VideoTitle videoId={ch.videoId} />
                        </code>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      {/* <button
                        onClick={() => handleDeleteChapterVideo(ch._id!)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        🗑️ Delete Video
                      </button> */}
                      <button
                        onClick={() => handlePlayVideo(ch)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        ▶️ Play Video
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-2">No video assigned</p>
                  <VideoUploader
                    key={`uploader-${ch._id}`}
                    onUploaded={(videoId, bunnyGuid) =>
                      handleVideoUploaded(ch._id!, videoId, bunnyGuid)
                    }
                  />
                </div>
              )}
            </div>

            {/* Formularz edycji chaptera - ZAKTUALIZOWANE */}
            {editingChapterId === ch._id && (
              <div className="mt-4 p-4 border-t border-gray-200">
                <h5 className="font-semibold mb-3">Edit Chapter Details</h5>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Number
                    </label>
                    <input
                      type="number"
                      placeholder="Number"
                      value={ch.number ?? ""}
                      onChange={(e) =>
                        setChapters((prev) =>
                          prev.map((c2) =>
                            c2._id === ch._id
                              ? { ...c2, number: Number(e.target.value) }
                              : c2
                          )
                        )
                      }
                      className="border p-2 rounded mb-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={ch.title}
                      onChange={(e) =>
                        setChapters((prev) =>
                          prev.map((c2) =>
                            c2._id === ch._id
                              ? { ...c2, title: e.target.value }
                              : c2
                          )
                        )
                      }
                      className="border p-1 rounded mb-1 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={ch.description || ""}
                      onChange={(e) =>
                        setChapters((prev) =>
                          prev.map((c2) =>
                            c2._id === ch._id
                              ? { ...c2, description: e.target.value }
                              : c2
                          )
                        )
                      }
                      className="border p-1 rounded mb-1 w-full"
                      rows={3}
                    />
                  </div>
                  {/* 
                  {ch.bunnyVideoId && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Bunny Video ID
                      </label>
                      <input
                        type="text"
                        value={ch.bunnyVideoId || ""}
                        readOnly
                        className="border p-2 rounded w-full bg-gray-50"
                      />
                    </div>
                  )} */}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        handleEditChapter(
                          ch._id!,
                          chapters.find((c) => c._id === ch._id)!
                        );
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Save changes
                    </button>
                    <button
                      onClick={() => setEditingChapterId(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No chapters yet.</p>
      )}

      {/* Add New Chapter - ZAKTUALIZOWANE */}
      <div className="mt-8 p-4 border rounded-md bg-white">
        <h4 className="text-lg font-semibold mt-4">Add New Chapter</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Number</label>
              <input
                type="number"
                placeholder="Number"
                value={newChapter.number}
                onChange={(e) =>
                  setNewChapter({
                    ...newChapter,
                    number: Number(e.target.value),
                  })
                }
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                placeholder="Chapter Title"
                value={newChapter.title}
                onChange={(e) =>
                  setNewChapter({ ...newChapter, title: e.target.value })
                }
                className="border p-2 rounded w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              placeholder="Chapter Description"
              value={newChapter.description}
              onChange={(e) =>
                setNewChapter({ ...newChapter, description: e.target.value })
              }
              className="border p-2 rounded w-full"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Video</label>
            {newChapter.bunnyVideoId ? (
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    Bunny Video ID gotowe: {newChapter.bunnyVideoId}
                  </span>{" "}
                  <button
                    onClick={() =>
                      setNewChapter({
                        ...newChapter,
                        bunnyVideoId: "",
                      })
                    }
                    className="text-red-500 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <VideoUploader
                onUploaded={(videoId, bunnyGuid) =>
                  handleVideoUploaded("new", videoId, bunnyGuid)
                }
              />
            )}
          </div>

          <button
            onClick={handleAddChapter}
            disabled={!newChapter.title}
            className={`px-4 py-2 rounded ${
              newChapter.title
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Add Chapter
          </button>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="mt-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
      >
        Close Resource
      </button>
    </div>
  );
};

export default EditResourceForm;
