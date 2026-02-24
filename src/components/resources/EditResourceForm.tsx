// components/resources/EditResourceForm.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import type { IResource, IChapter } from "../../types/types";
import {
  editResource,
  addChapter,
  editChapter,
  deleteChapter,
  fetchResourceById,
} from "../../store/slices/resourceSlice";
import VideoUploader from "../video/VideoUploader";
//import { useNavigate } from "react-router-dom";
import Thumbnail from "../video/Thumbnail";
import VideoTitle from "../video/VideoTitle";
import { useVideoNavigation } from "../../hooks/useVideoNavigation";
//import { useTranslation } from "react-i18next";

interface Props {
  resource: IResource;
  onClose: () => void;
}

const EditResourceForm: React.FC<Props> = ({ resource, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  //const navigate = useNavigate();
  //const { i18n } = useTranslation();
  const { handlePlayVideo } = useVideoNavigation();

  const [title, setTitle] = useState(resource.title);
  const [content, setContent] = useState(resource.content || "");
  const [language, setLanguage] = useState<"pl" | "en">(
    resource.language || "pl",
  );
  const selectedResource = useSelector(
    (state: RootState) => state.resources.selected,
  );

  const [chapters, setChapters] = useState<IChapter[]>([]);

  const [newChapter, setNewChapter] = useState<IChapter>({
    _id: "",
    number: chapters.length + 1,
    title: "",
    description: "",
    bunnyVideoId: "",
  });

  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [isEditingResource, setIsEditingResource] = useState(false);

  useEffect(() => {
    if (selectedResource?.chapters) {
      setChapters(
        selectedResource.chapters.map((ch, index) => ({
          ...ch,
          number: ch.number ?? index + 1,
        })),
      );
    }
  }, [selectedResource]);

  const handleSaveResource = async () => {
    try {
      await dispatch(
        editResource({
          id: resource._id!,
          resourceData: { title, content, language },
        }),
      ).unwrap();
      alert("Resource updated!");
      setIsEditingResource(false);
    } catch (err) {
      console.error(err);
      alert("Error updating resource");
    }
  };

  const handleAddChapter = async () => {
    console.log("Adding new chapter:", newChapter);
    if (!newChapter.title) {
      alert("Chapter title is required");
      return;
    }
    if (!newChapter.bunnyVideoId) {
      alert("Proszę najpierw wgrać wideo przed dodaniem rozdziału!");
      return;
    }

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(newChapter.videoId || "");

    const chapterData: any = {
      number: newChapter.number ?? chapters.length + 1,
      title: newChapter.title,
      description: newChapter.description || undefined,
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
        }),
      ).unwrap();

      // 🔥 Usuwamy nieużywane 'updatedResource'
      await dispatch(fetchResourceById(resource._id!)).unwrap();

      setChapters(selectedResource?.chapters || []);
      setNewChapter({
        number: (selectedResource?.chapters?.length || chapters.length) + 1,
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

  const handleEditChapter = async (chapterId: string, updated: IChapter) => {
    try {
      await dispatch(
        editChapter({
          resourceId: resource._id!,
          chapterId,
          chapterData: updated,
        }),
      ).unwrap();

      setEditingChapterId(null);
    } catch (err) {
      console.error(err);
      alert("Error editing chapter");
    }
  };

  const handleDeleteChapter = async (chapter: IChapter) => {
    if (!window.confirm("Na pewno chcesz usunąć ten rozdział?")) return;
    try {
      await dispatch(
        deleteChapter({
          resourceId: resource._id!,
          chapterId: chapter._id!,
          videoId: chapter.videoId!,
        }),
      ).unwrap();

      await dispatch(fetchResourceById(resource._id!)).unwrap();
      setChapters(selectedResource?.chapters || []);
    } catch (err) {
      console.error(err);
      alert("Error deleting chapter");
    }
  };

  const handleVideoUploaded = async (
    chapterId: string,
    videoId: string,
    bunnyGuid: string,
  ) => {
    console.log("Video uploaded for chapter:", chapterId, {
      videoId,
      bunnyGuid,
    });

    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(videoId);

    if (chapterId === "new") {
      setNewChapter((prev) => ({
        ...prev,
        bunnyVideoId: bunnyGuid,
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
          }),
        ).unwrap();

        await dispatch(fetchResourceById(resource._id!)).unwrap();
        setChapters(selectedResource?.chapters || []);
      } catch (err) {
        console.error("Error updating chapter with video:", err);
      }
    }
  };

  // 🔥 Poprawka dla VideoTitle - dodajemy sprawdzenie
  const getVideoId = (chapter: IChapter): string => {
    return chapter.videoId || chapter.bunnyVideoId || "";
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50 relative">
      <h2 className="text-xl font-bold mb-4">Editing Resource</h2>

      {/* Resource fields */}
      {isEditingResource ? (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
            <label className="block text-sm font-medium mb-2">
              Język resource
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="pl"
                  checked={language === "pl"}
                  onChange={(e) => setLanguage(e.target.value as "pl")}
                  className="form-radio"
                />
                <span>🇵🇱 Polski</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="en"
                  checked={language === "en"}
                  onChange={(e) => setLanguage(e.target.value as "en")}
                  className="form-radio"
                />
                <span>🇬🇧 English</span>
              </label>
            </div>
          </div>
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
                      editingChapterId === ch._id ? null : ch._id!,
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

            {/* Video Section */}
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
                          {/* 🔥 Poprawka: używamy getVideoId */}
                          <VideoTitle videoId={getVideoId(ch)} />
                        </code>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
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

            {/* Edit Chapter Form */}
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
                              : c2,
                          ),
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
                              : c2,
                          ),
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
                              : c2,
                          ),
                        )
                      }
                      className="border p-1 rounded mb-1 w-full"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        handleEditChapter(
                          ch._id!,
                          chapters.find((c) => c._id === ch._id)!,
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
