// src/components/products/CreateProductForm.tsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { createProduct } from "../../store/slices/productSlice";
import type { NewProduct } from "../../types/types";
import { useTranslation } from "react-i18next";

const CreateProductForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { i18n, t } = useTranslation(); // 👈 Dodaj t

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || price <= 0 || !imageUrl) {
      alert(t("form.fillAllFields")); // 👈 Tłumaczenie
      return;
    }

    try {
      const productData: NewProduct = {
        title,
        description,
        price,
        imageUrl,
        language: i18n.language as "pl" | "en",
      };

      await dispatch(createProduct(productData)).unwrap();

      // Reset formularza
      setTitle("");
      setDescription("");
      setPrice(0);
      setImageUrl("");

      alert(t("form.productAdded")); // 👈 Tłumaczenie
    } catch (err) {
      console.error("❌ Błąd podczas dodawania produktu:", err);
      alert(t("form.productAddError")); // 👈 Tłumaczenie
    }
  };

  const currentLanguage =
    i18n.language === "pl"
      ? `🇵🇱 ${t("languages.polish")}`
      : `🇬🇧 ${t("languages.english")}`;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 border rounded-md flex flex-col gap-4 bg-white shadow-md"
    >
      <h2 className="text-xl font-bold mb-2">{t("form.addNewProduct")}</h2>{" "}
      {/* 👈 Tłumaczenie */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
        <span className="font-medium">{t("form.productLanguage")}:</span>{" "}
        {currentLanguage}
      </div>
      <input
        type="text"
        placeholder={t("form.titlePlaceholder")} // 👈 Tłumaczenie
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        placeholder={t("form.descriptionPlaceholder")} // 👈 Tłumaczenie
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <input
        type="number"
        step="0.01"
        placeholder={t("form.pricePlaceholder")} // 👈 Tłumaczenie
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder={t("form.imageUrlPlaceholder")}
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors font-medium"
      >
        {t("form.addProduct")} {/* 👈 Tłumaczenie */}
      </button>
    </form>
  );
};

export default CreateProductForm;

// // src/components/products/CreateProductForm.tsx
// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import type { AppDispatch } from "../../store";
// import { createProduct } from "../../store/slices/productSlice";
// import type { NewProduct } from "../../types/types";
// import { useTranslation } from "react-i18next";

// const CreateProductForm: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { i18n } = useTranslation();

//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState<number>(0);
//   const [imageUrl, setImageUrl] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!title || !description || price <= 0 || !imageUrl) {
//       alert("Wypełnij wszystkie pola");
//       return;
//     }

//     try {
//       const productData: NewProduct = {
//         title,
//         description,
//         price,
//         imageUrl,
//         language: i18n.language as "pl" | "en",
//       };

//       await dispatch(createProduct(productData)).unwrap();

//       // Reset formularza
//       setTitle("");
//       setDescription("");
//       setPrice(0);
//       setImageUrl("");
//       //setContent("");

//       alert("Produkt został dodany!");
//     } catch (err) {
//       console.error("❌ Błąd podczas dodawania produktu:", err);
//       alert("Błąd podczas tworzenia produktu");
//     }
//   };

//   const currentLanguage = i18n.language === "pl" ? "🇵🇱 Polski" : "🇬🇧 English";

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="max-w-md mx-auto p-4 border rounded-md flex flex-col gap-4"
//     >
//       <h2 className="text-xl font-bold mb-2">Dodaj nowy produkt</h2>

//       <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
//         <span className="font-medium">Język produktu:</span> {currentLanguage}
//       </div>

//       <input
//         type="text"
//         placeholder="Tytuł"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         className="border p-2 rounded"
//       />
//       <textarea
//         placeholder="Opis"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         className="border p-2 rounded"
//       />
//       <input
//         type="number"
//         step="0.01"
//         placeholder="Cena"
//         value={price}
//         onChange={(e) => setPrice(Number(e.target.value))}
//         className="border p-2 rounded"
//       />
//       <input
//         type="text"
//         placeholder="URL obrazka"
//         value={imageUrl}
//         onChange={(e) => setImageUrl(e.target.value)}
//         className="border p-2 rounded"
//       />

//       <button type="submit" className="bg-green-500 text-white p-2 rounded">
//         Dodaj produkt
//       </button>
//     </form>
//   );
// };

// export default CreateProductForm;
