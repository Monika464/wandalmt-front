import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { createResource } from "../../store/slices/resourceSlice";

interface Props {
  productId: string; // resource będzie powiązany z tym produktem
  onClose: () => void;
  onSuccess: () => void;
}

const CreateResourceForm: React.FC<Props> = ({
  productId,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  //const [imageUrl, setImageUrl] = useState("");
  //const [videoId, setVideoId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) {
      alert("Wypełnij wszystkie wymagane pola (title, content, imageUrl)");
      return;
    }

    try {
      await dispatch(createResource({ productId, title, content })).unwrap();

      alert("Resource został utworzony!");
      setTitle("");
      setContent("");
      // setImageUrl("");
      //setVideoUrl("");
      onClose();
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Błąd podczas tworzenia resource");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded-md flex flex-col gap-3 bg-gray-50 max-w-md"
    >
      <h3 className="text-lg font-semibold">Create Resource</h3>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border p-2 rounded w-full"
      />
      {/* <input
        type="text"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border p-2 rounded w-full"
      /> */}
      {/* <input
        type="text"
        placeholder="Video URL (opcjonalnie)"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="border p-2 rounded w-full"
      /> */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Create
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreateResourceForm;
