import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { editProduct } from "../../store/slices/productSlice";
//import { useTranslation } from "react-i18next";
import type { Product } from "../../types/types";

interface Props {
  product: Product;
  onClose: () => void;
}

const EditProductForm: React.FC<Props> = ({ product, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  //const { i18n } = useTranslation();

  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [language, setLanguage] = useState<"pl" | "en">(product.language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || price <= 0 || !imageUrl) {
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
            //_id: "",
            _id: product._id,
            language,
          },
        }),
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
      <h2 className="text-xl font-bold mb-2">Edytuj produkt</h2>

      {/* 🔥 Dodajemy wybór języka */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <label className="block text-sm font-medium mb-2">Język produktu</label>
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
      {/* <textarea
        placeholder="Treść"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border p-2 rounded"
      /> */}
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
