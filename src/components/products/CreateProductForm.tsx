// src/components/products/CreateProductForm.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { createProduct } from "../../store/slices/productSlice";

const CreateProductForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !price || !imageUrl || !content) {
      alert("Wypełnij wszystkie pola");
      return;
    }

    try {
      await dispatch(
        createProduct({
          title,
          description,
          price,
          imageUrl,
          content,
          _id: "",
        })
      ).unwrap();

      // Reset formularza
      setTitle("");
      setDescription("");
      setPrice(0);
      setImageUrl("");
      setContent("");

      alert("Produkt został dodany!");
    } catch (err) {
      console.error(err);
      alert("Błąd podczas tworzenia produktu");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 border rounded-md flex flex-col gap-4"
    >
      <input
        type="text"
        placeholder="Tytuł"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded"
      />
      <textarea
        placeholder="Opis"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="number"
        step="0.01"
        placeholder="Cena"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="URL obrazka"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border p-2 rounded"
      />
      <textarea
        placeholder="Treść"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border p-2 rounded"
      />
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Dodaj produkt
      </button>
    </form>
  );
};

export default CreateProductForm;
