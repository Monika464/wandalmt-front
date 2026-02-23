import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { createResource } from "../../store/slices/resourceSlice";
import { useTranslation } from "react-i18next";

interface Props {
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateResourceForm: React.FC<Props> = ({
  productId,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { i18n } = useTranslation();

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
      await dispatch(
        createResource({
          productId,
          title,
          content,
          language: i18n.language as "pl" | "en",
        }),
      ).unwrap();

      alert("Resource został utworzony!");
      setTitle("");
      setContent("");
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
      {/* 🔥 Informacja o języku */}
      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm">
        <span className="font-medium">Język resource:</span> {currentLanguage}
      </div>

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
