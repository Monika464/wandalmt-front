import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import type { IResource, IChapter } from "../../types";
import {
  editResource,
  addChapter,
  editChapter,
  deleteChapter,
  deleteChapterVideo,
  fetchChapterWithVideo,
  fetchResourceById,
} from "../../store/slices/resourceSlice";
import VideoUploader from "../video/VideoUploader";
import { useNavigate } from "react-router-dom";

interface Props {
  resource: IResource;
  onClose: () => void;
  //onUpdated?: (updated: IResource) => void;
}

const EditResourceForm: React.FC<Props> = ({ resource, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [title, setTitle] = useState(resource.title);
  const [content, setContent] = useState(resource.content || "");
  const [chapters, setChapters] = useState<IChapter[]>(
    (resource.chapters || []).map((ch, index) => ({
      ...ch,
      number: ch.number ?? index + 1,
    }))
  );

  const [newChapter, setNewChapter] = useState<IChapter>({
    _id: "",
    number: chapters.length + 1,
    title: "",
    description: "",
    videoId: "",
  });

  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [isEditingResource, setIsEditingResource] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState<
    Record<string, boolean>
  >({});

  const navigate = useNavigate();

  // Załaduj szczegóły video dla chaptera
  // const loadChapterVideoDetails = async (chapterId: string) => {
  //   const chapter = chapters.find((ch) => ch._id === chapterId);
  //   if (chapter?.videoId && !chapter.video) {
  //     setLoadingChapters((prev) => ({ ...prev, [chapterId]: true }));
  //     try {
  //       await dispatch(
  //         fetchChapterWithVideo({
  //           resourceId: resource._id!,
  //           chapterId,
  //         })
  //       ).unwrap();
  //     } catch (err) {
  //       console.error("Error loading video details:", err);
  //     } finally {
  //       setLoadingChapters((prev) => ({ ...prev, [chapterId]: false }));
  //     }
  //   }
  // };

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

  // Add new chapter
  const handleAddChapter = async () => {
    if (!newChapter.title) {
      alert("Chapter title is required");
      return;
    }
    const chapterWithNumber = {
      ...newChapter,
      number: newChapter.number ?? chapters.length + 1,
    };
    try {
      const added = await dispatch(
        addChapter({
          resourceId: resource._id!,
          chapterData: chapterWithNumber,
        })
      ).unwrap();

      // Refresh chapters list
      const updatedResource = await dispatch(
        fetchResourceById(resource._id!)
      ).unwrap();

      //setChapters([...chapters, added.chapters[added.chapters.length - 1]]);
      setChapters(updatedResource.chapters);
      setNewChapter({
        number: chapters.length + 2,
        title: "",
        description: "",
        videoId: "",
      });
    } catch (err) {
      console.error(err);
      alert("Error adding chapter");
    }
  };

  // Edit chapter
  const handleEditChapter = async (chapterId: string, updated: IChapter) => {
    if (!resource?._id) {
      alert("Resource ID is missing");
      return;
    }

    try {
      const updatedResource = await dispatch(
        editChapter({
          resourceId: resource._id!,
          chapterId,
          chapterData: updated,
        })
      ).unwrap();

      if (updatedResource && updatedResource.chapters) {
        setChapters(updatedResource.chapters);
      }
      //setChapters(updatedResource.chapters);
      setEditingChapterId(null);
    } catch (err) {
      console.error(err);
      alert("Error editing chapter");
    }
  };
  // Delete chapter video
  const handleDeleteChapterVideo = async (chapterId: string) => {
    if (!window.confirm("Na pewno chcesz usunąć wideo z tego rozdziału?"))
      return;

    try {
      await dispatch(
        deleteChapterVideo({
          resourceId: resource._id!,
          chapterId,
        })
      ).unwrap();

      // Refresh chapter data
      const updatedResource = await dispatch(
        fetchResourceById(resource._id!)
      ).unwrap();

      setChapters(updatedResource.chapters);
      alert("Wideo zostało usunięte");
    } catch (err) {
      console.error(err);
      alert("Error deleting video");
    }
  };

  // Delete chapter
  const handleDeleteChapter = async (chapterId: string) => {
    if (!window.confirm("Na pewno chcesz usunąć ten rozdział?")) return;
    try {
      await dispatch(
        deleteChapter({ resourceId: resource._id!, chapterId })
      ).unwrap();

      // Refresh chapters list
      const updatedResource = await dispatch(
        fetchResourceById(resource._id!)
      ).unwrap();

      setChapters(updatedResource.chapters);
    } catch (err) {
      console.error(err);
      alert("Error deleting chapter");
    }
  };

  // Handle video uploaded
  const handleVideoUploaded = (chapterId: string, videoId: string) => {
    console.log("Video uploaded for chapter:", chapterId, videoId);
    if (chapterId === "new") {
      // For new chapter
      setNewChapter((prev) => ({ ...prev, videoId }));
    } else {
      // For existing chapter
      setChapters((prev) =>
        prev.map((ch) => (ch._id === chapterId ? { ...ch, videoId } : ch))
      );
    }
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50 relative">
      <h2 className="text-xl font-bold mb-4">Edit Resource</h2>

      {/* Resource fields */}
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

      {/* Chapter list */}
      <h3 className="text-lg font-semibold mb-2">Chapters</h3>
      {chapters && chapters.length > 0 ? (
        chapters.slice().map((ch) => (
          <div key={ch._id} className="border p-2 rounded mb-2 relative">
            <div className="flex justify-between items-start mb-2">
              {/* {`${console.log("Rendering chapter:", ch)}`} */}
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
                  onClick={() => handleDeleteChapter(ch._id!)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Delete Chapter
                </button>
              </div>
            </div>

            {/* Video Section */}
            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <h5 className="font-semibold mb-2">Video</h5>

              {ch.videoId ? (
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-shrink-0">
                    {/* <img
                      src={`https://video.bunnycdn.com/library/${
                        import.meta.env.VITE_BUNNY_LIBRARY_ID
                      }/videos/${ch.videoId}/thumbnail`}
                      alt="video thumbnail"
                      className="w-48 h-32 object-cover rounded border"
                    /> */}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Video ID:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {ch.videoId}
                      </code>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleDeleteChapterVideo(ch._id!)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        🗑️ Delete Video
                      </button>
                      <button
                        onClick={() => navigate(`/watch/${ch.videoId}`)}
                        className="px-3 py-1 bg-blue-500 text-white rounded"
                      >
                        {ch.title} video
                      </button>
                      {/* <a
                        href={`https://video.bunnycdn.com/library/${
                          import.meta.env.VITE_BUNNY_LIBRARY_ID
                        }/videos/${ch.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Open in Bunny
                      </a> */}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-2">No video assigned</p>
                  <VideoUploader
                    onUploaded={(videoId) =>
                      handleVideoUploaded(ch._id!, videoId)
                    }
                  />
                </div>
              )}
            </div>

            {/* Formularz edycji chaptera */}
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

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Video ID
                    </label>
                    <input
                      type="text"
                      placeholder="Video ID (will be set automatically when uploading)"
                      value={ch.videoId || ""}
                      readOnly
                      className="border p-2 rounded w-full bg-gray-50"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        handleEditChapter(
                          ch._id!,
                          chapters.find((c) => c._id === ch._id)!
                        );
                        //setEditingChapterId(null);
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

      {/* Add New Chapter */}
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
            {newChapter.videoId ? (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">Video ID: {newChapter.videoId}</span>
                <button
                  onClick={() => setNewChapter({ ...newChapter, videoId: "" })}
                  className="text-red-500 text-sm"
                >
                  Clear
                </button>
              </div>
            ) : (
              <VideoUploader
                onUploaded={(videoId) => handleVideoUploaded("new", videoId)}
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
