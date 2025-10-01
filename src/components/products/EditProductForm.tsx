import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { editProduct } from "../../store/slices/productSlice";

import type { Product } from "../../types";

interface Props {
  product: Product;
  onClose: () => void;
}

const EditProductForm: React.FC<Props> = ({ product, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [content, setContent] = useState(product.content);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || price <= 0 || !imageUrl || !content) {
      alert("Wypełnij wszystkie pola poprawnie");
      return;
    }

    try {
      await dispatch(
        editProduct({
          id: product._id,
          productData: {
            title,
            description,
            price,
            imageUrl,
            content,
            _id: "",
          },
        })
      ).unwrap();

      alert("Produkt został zaktualizowany!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Błąd podczas edycji produktu");
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
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Zapisz zmiany
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-400 text-white p-2 rounded"
        >
          Anuluj
        </button>
      </div>
    </form>
  );
};

export default EditProductForm;
