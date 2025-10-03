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

interface Props {
  resource: IResource;
  onClose: () => void;
}

const EditResourceForm: React.FC<Props> = ({ resource, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [title, setTitle] = useState(resource.title);
  const [content, setContent] = useState(resource.content || "");
  //const [imageUrl, setImageUrl] = useState(resource.imageUrl || "");
  const [videoUrl, setVideoUrl] = useState(resource.videoUrl || "");

  const [chapters, setChapters] = useState<IChapter[]>(resource.chapters || []);

  const [newChapter, setNewChapter] = useState<IChapter>({
    title: "",
    description: "",
    videoUrl: "",
  });

  // Save resource changes
  const handleSaveResource = async () => {
    try {
      await dispatch(
        editResource({
          id: resource._id,
          resourceData: { title, content, videoUrl },
        })
      ).unwrap();
      alert("Resource updated!");
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
    try {
      const added = await dispatch(
        addChapter({ resourceId: resource._id, chapterData: newChapter })
      ).unwrap();
      setChapters([...chapters, added.chapters[added.chapters.length - 1]]);
      setNewChapter({ title: "", description: "", videoUrl: "" });
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
          resourceId: resource._id,
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
      const updatedResource = await dispatch(
        deleteChapter({ resourceId: resource._id, chapterId })
      ).unwrap();
      setChapters(updatedResource.chapters);
    } catch (err) {
      console.error(err);
      alert("Error deleting chapter");
    }
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Edit Resource</h2>

      {/* Resource fields */}
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
      </button>

      <hr className="my-4" />

      {/* Chapter list */}
      <h3 className="text-lg font-semibold mb-2">Chapters</h3>
      {chapters.map((ch) => (
        <div key={ch._id} className="border p-2 rounded mb-2">
          <input
            type="text"
            value={ch.title}
            onChange={(e) =>
              handleEditChapter(ch._id!, { ...ch, title: e.target.value })
            }
            className="border p-1 rounded mb-1 w-full"
          />
          <textarea
            value={ch.description || ""}
            onChange={(e) =>
              handleEditChapter(ch._id!, { ...ch, description: e.target.value })
            }
            className="border p-1 rounded mb-1 w-full"
          />
          <input
            type="text"
            value={ch.videoUrl || ""}
            onChange={(e) =>
              handleEditChapter(ch._id!, { ...ch, videoUrl: e.target.value })
            }
            className="border p-1 rounded mb-1 w-full"
          />
          <button
            onClick={() => handleDeleteChapter(ch._id!)}
            className="bg-red-500 text-white px-2 py-1 rounded"
          >
            Delete Chapter
          </button>
        </div>
      ))}

      {/* Add new chapter */}
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
      <input
        type="text"
        placeholder="Video URL"
        value={newChapter.videoUrl}
        onChange={(e) =>
          setNewChapter({ ...newChapter, videoUrl: e.target.value })
        }
        className="border p-1 rounded mb-2 w-full"
      />
      <button
        onClick={handleAddChapter}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Add Chapter
      </button>

      <button
        onClick={onClose}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
      >
        Close
      </button>
    </div>
  );
};

export default EditResourceForm;
