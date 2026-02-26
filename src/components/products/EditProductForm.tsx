import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { editProduct } from "../../store/slices/productSlice";
import { useTranslation } from "react-i18next"; // 👈 Odkomentuj import
import type { Product } from "../../types/types";

interface Props {
  product: Product;
  onClose: () => void;
}

const EditProductForm: React.FC<Props> = ({ product, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation(); // 👈 Użyj useTranslation

  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [language, setLanguage] = useState<"pl" | "en">(product.language);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || price <= 0 || !imageUrl) {
      alert(t("form.fillAllFields")); // 👈 Tłumaczenie
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
            _id: product._id,
            language,
          },
        }),
      ).unwrap();

      alert(t("form.productUpdated")); // 👈 Tłumaczenie
      onClose();
    } catch (err) {
      console.error(err);
      alert(t("form.productUpdateError")); // 👈 Tłumaczenie
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-4 border rounded-md flex flex-col gap-4 bg-white shadow-md"
    >
      <h2 className="text-xl font-bold mb-2">{t("form.editProduct")}</h2>{" "}
      {/* 👈 Tłumaczenie */}
      {/* 🔥 Wybór języka */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <label className="block text-sm font-medium mb-2">
          {t("form.productLanguage")} {/* 👈 Tłumaczenie */}
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="pl"
              checked={language === "pl"}
              onChange={(e) => setLanguage(e.target.value as "pl")}
              className="form-radio text-blue-500"
            />
            <span>🇵🇱 {t("languages.polish")}</span> {/* 👈 Tłumaczenie */}
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="en"
              checked={language === "en"}
              onChange={(e) => setLanguage(e.target.value as "en")}
              className="form-radio text-blue-500"
            />
            <span>🇬🇧 {t("languages.english")}</span> {/* 👈 Tłumaczenie */}
          </label>
        </div>
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
        placeholder={t("form.imageUrlPlaceholder")} // 👈 Tłumaczenie
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
        >
          {t("form.saveChanges")} {/* 👈 Tłumaczenie */}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-400 text-white p-2 rounded hover:bg-gray-500 transition-colors"
        >
          {t("form.cancel")} {/* 👈 Tłumaczenie */}
        </button>
      </div>
    </form>
  );
};

export default EditProductForm;

// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import type { AppDispatch } from "../../store";
// import { editProduct } from "../../store/slices/productSlice";
// //import { useTranslation } from "react-i18next";
// import type { Product } from "../../types/types";

// interface Props {
//   product: Product;
//   onClose: () => void;
// }

// const EditProductForm: React.FC<Props> = ({ product, onClose }) => {
//   const dispatch = useDispatch<AppDispatch>();
//   //const { i18n } = useTranslation();

//   const [title, setTitle] = useState(product.title);
//   const [description, setDescription] = useState(product.description);
//   const [price, setPrice] = useState(product.price);
//   const [imageUrl, setImageUrl] = useState(product.imageUrl);
//   const [language, setLanguage] = useState<"pl" | "en">(product.language);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!title || !description || price <= 0 || !imageUrl) {
//       alert("Wypełnij wszystkie pola poprawnie");
//       return;
//     }

//     try {
//       await dispatch(
//         editProduct({
//           id: product._id,
//           productData: {
//             title,
//             description,
//             price,
//             imageUrl,
//             //_id: "",
//             _id: product._id,
//             language,
//           },
//         }),
//       ).unwrap();

//       alert("Produkt został zaktualizowany!");
//       onClose();
//     } catch (err) {
//       console.error(err);
//       alert("Błąd podczas edycji produktu");
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="max-w-md mx-auto p-4 border rounded-md flex flex-col gap-4"
//     >
//       <h2 className="text-xl font-bold mb-2">Edytuj produkt</h2>

//       {/* 🔥 Dodajemy wybór języka */}
//       <div className="bg-blue-50 border border-blue-200 rounded p-3">
//         <label className="block text-sm font-medium mb-2">Język produktu</label>
//         <div className="flex gap-4">
//           <label className="flex items-center gap-2">
//             <input
//               type="radio"
//               value="pl"
//               checked={language === "pl"}
//               onChange={(e) => setLanguage(e.target.value as "pl")}
//               className="form-radio"
//             />
//             <span>🇵🇱 Polski</span>
//           </label>
//           <label className="flex items-center gap-2">
//             <input
//               type="radio"
//               value="en"
//               checked={language === "en"}
//               onChange={(e) => setLanguage(e.target.value as "en")}
//               className="form-radio"
//             />
//             <span>🇬🇧 English</span>
//           </label>
//         </div>
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
//       {/* <textarea
//         placeholder="Treść"
//         value={content}
//         onChange={(e) => setContent(e.target.value)}
//         className="border p-2 rounded"
//       /> */}
//       <div className="flex gap-2">
//         <button type="submit" className="bg-blue-500 text-white p-2 rounded">
//           Zapisz zmiany
//         </button>
//         <button
//           type="button"
//           onClick={onClose}
//           className="bg-gray-400 text-white p-2 rounded"
//         >
//           Anuluj
//         </button>
//       </div>
//     </form>
//   );
// };

// export default EditProductForm;
