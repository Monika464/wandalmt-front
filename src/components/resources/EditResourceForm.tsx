import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import type { IResource, IChapter } from "../../types";
import {
  editResource,
  addChapter,
  editChapter,
  deleteChapter,
} from "../../store/slices/resourceSlice";
import VideoUploader from "../video/VideoUploader";

// interface Props {
//   resource: IResource;
//   onClose: () => void;
// }

interface Props {
  resource: IResource;
  onClose: () => void;

  onUpdated?: (updated: IResource) => void;
}

const EditResourceForm: React.FC<Props> = ({ resource, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [title, setTitle] = useState(resource.title);
  const [content, setContent] = useState(resource.content || "");
  //const [videoUrl, setVideoUrl] = useState(resource.videoUrl || "");
  const [videoId, setVideoId] = useState("");

  const [chapters, setChapters] = useState<IChapter[]>(resource.chapters || []);
  const [newChapter, setNewChapter] = useState<IChapter>({
    _id: "",
    title: "",
    description: "",
    videoId: "",
  });

  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [isEditingResource, setIsEditingResource] = useState(true);
  // Save resource changes
  // Save resource changes and close form
  const handleSaveResource = async () => {
    try {
      await dispatch(
        editResource({
          id: resource._id!,
          resourceData: { title, content },
        })
      ).unwrap();
      alert("Resource updated!");
      // onClose(); // <--- zamyka edycję tego resource

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
    const chapterWithOrder = {
      ...newChapter,
      order: chapters.length, // ← nadajemy numer
    };
    try {
      const added = await dispatch(
        addChapter({ resourceId: resource._id!, chapterData: chapterWithOrder })
      ).unwrap();
      setChapters([...chapters, added.chapters[added.chapters.length - 1]]);
      setNewChapter({ title: "", description: "", videoId: "" });
    } catch (err) {
      console.error(err);
      alert("Error adding chapter");
    }
  };

  // Edit chapter
  const handleEditChapter = async (chapterId: string, updated: IChapter) => {
    try {
      const updatedResource = await dispatch(
        editChapter({
          resourceId: resource._id!,
          chapterId,
          chapterData: updated,
        })
      ).unwrap();

      setChapters(updatedResource.chapters);
    } catch (err) {
      console.error(err);
      alert("Error editing chapter");
    }
  };

  // Delete chapter
  const handleDeleteChapter = async (chapterId: string) => {
    if (!window.confirm("Na pewno chcesz usunąć ten rozdział?")) return;
    try {
      await dispatch(
        deleteChapter({ resourceId: resource._id!, chapterId })
      ).unwrap();

      // upewniamy się, że chapters to tablica
      //setChapters(updatedResource.chapters || []);
      // setChapters((prev) => prev.filter((ch) => ch._id !== chapterId));
      // setChapters((prev) => {
      //   const filtered = prev.filter((ch) => ch._id !== chapterId);

      //   // przebuduj numery: 0,1,2,3...
      //   return filtered.map((ch, i) => ({ ...ch, order: i }));
      // });
      setChapters((prev) => {
        const filtered = prev.filter((ch) => ch._id !== chapterId);

        // 1. aktualizacja numerów w stanie
        const renumbered = filtered.map((ch, i) => ({ ...ch, order: i }));

        // 2. aktualizacja numerów w backendzie
        renumbered.forEach((ch, i) => {
          dispatch(
            editChapter({
              resourceId: resource._id!,
              chapterId: ch._id!,
              chapterData: { order: i },
            })
          );
        });

        return renumbered;
      });
    } catch (err) {
      console.error(err);
      alert("Error deleting chapter");
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
          {/* <input
            type="text"
            placeholder="Video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="border p-2 rounded mb-2 w-full"
          /> */}

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
          {/* <p>
            <strong>Video URL:</strong> {videoUrl}
          </p> */}
          <button
            onClick={() => setIsEditingResource(true)}
            className="bg-yellow-500 text-white px-4 py-2 rounded mb-4"
          >
            Edit Resource
          </button>
        </>
      )}

      {/* <input
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
      <input
        type="text"
        placeholder="Video URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="border p-2 rounded mb-2 w-full"
      />
      <button
        onClick={handleSaveResource}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Save Resource
      </button> */}

      <hr className="my-4" />

      {/* Chapter list */}
      <h3 className="text-lg font-semibold mb-2">Chapters</h3>
      {chapters && chapters.length > 0 ? (
        chapters
          .slice()
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((ch) => (
            <div key={ch._id} className="border p-2 rounded mb-2 relative">
              {`${console.log("Rendering chapter:", ch)}`}
              <p className="font-semibold">{ch.title}</p>
              <p>{ch.description}</p>
              <VideoUploader
                onUploaded={(id) =>
                  setChapters((prev) =>
                    prev.map((c) =>
                      c._id === ch._id ? { ...c, videoId: id } : c
                    )
                  )
                }
              />
              <button
                onClick={() =>
                  setEditingChapterId(
                    editingChapterId === ch._id ? null : ch._id!
                  )
                }
                className="absolute top-2 right-2 bg-gray-400 text-white px-2 py-1 rounded"
              >
                {editingChapterId === ch._id ? "Close" : "Edit Chapter"}
              </button>
              <button
                onClick={() => handleDeleteChapter(ch._id!)}
                className="absolute top-2 right-20 bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete Chapter
              </button>

              {/* Formularz edycji chaptera */}
              {editingChapterId === ch._id && (
                <div className="mt-4 p-2 border-t">
                  {/* pola edycji */}
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
                  />
                  {/* MINIATURKA WIDEO */}
                  <div className="mb-2">
                    {ch.videoId ? (
                      <img
                        src={`https://video.bunnycdn.com/library/${
                          import.meta.env.VITE_BUNNY_LIBRARY_ID
                        }/videos/${ch.videoId}/thumbnail`}
                        alt="video thumbnail"
                        className="w-40 h-24 object-cover rounded border mb-2"
                      />
                    ) : (
                      <p className="text-sm text-gray-500">Brak filmu</p>
                    )}
                  </div>

                  {/* INPUT NA VIDEO ID – opcjonalna edycja ręczna */}
                  <input
                    type="text"
                    placeholder="Video ID"
                    value={ch.videoId || ""}
                    onChange={(e) =>
                      setChapters((prev) =>
                        prev.map((c2) =>
                          c2._id === ch._id
                            ? { ...c2, videoId: e.target.value }
                            : c2
                        )
                      )
                    }
                    className="border p-1 rounded mb-2 w-full"
                  />
                  {/* <input
                    type="text"
                    value={
                      ch.videoId ? (
                        <img
                          src={`https://video.bunnycdn.com/library/${
                            import.meta.env.VITE_BUNNY_LIBRARY_ID
                          }/videos/${ch.videoId}/thumbnail`}
                          alt="video thumbnail"
                          className="w-40 h-24 object-cover rounded border mb-2"
                        />
                      ) : (
                        <p className="text-sm text-gray-500">Brak filmu</p>
                      )
                    }
                    onChange={(e) =>
                      setChapters((prev) =>
                        prev.map((c2) =>
                          c2._id === ch._id
                            ? { ...c2, videoId: e.target.value }
                            : c2
                        )
                      )
                    }
                    className="border p-1 rounded mb-2 w-full"
                  /> */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        handleEditChapter(ch._id!, ch);
                        setEditingChapterId(null);
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingChapterId(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
      ) : (
        <p>No chapters yet.</p>
      )}

      {/* Add new chapter – TYLKO raz, poniżej listy */}
      <h4 className="text-md font-semibold mt-4">Add New Chapter</h4>
      <input
        type="text"
        placeholder="Title"
        value={newChapter.title}
        onChange={(e) =>
          setNewChapter({ ...newChapter, title: e.target.value })
        }
        className="border p-1 rounded mb-1 w-full"
      />
      <textarea
        placeholder="Description"
        value={newChapter.description}
        onChange={(e) =>
          setNewChapter({ ...newChapter, description: e.target.value })
        }
        className="border p-1 rounded mb-1 w-full"
      />
      <VideoUploader
        onUploaded={(id) => setNewChapter({ ...newChapter, videoId: id })}
      />
      {/* <input
        type="text"
        placeholder="Video URL"
        value={newChapter.videoId}
        onChange={(e) =>
          setNewChapter({ ...newChapter, videoId: e.target.value })
        }
        className="border p-1 rounded mb-2 w-full"
      /> */}
      <button
        onClick={handleAddChapter}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Add Chapter
      </button>

      {/* Close resource – TYLKO raz, poniżej wszystkiego */}
      <button
        onClick={onClose}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
      >
        Close Resource
      </button>
      {/* //ten przycisk zamykajac nie odswieza widoku z productresurcepage*/}
    </div>
  );
};

export default EditResourceForm;
