import React from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { deleteProduct } from "../../store/slices/productSlice";
import { formatCurrency } from "../../utils/formatcurremcy";
import type { IResource } from "../../types";

interface Props {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  onEdit: () => void; // edycja produktu
  onCreateResource: () => void; // tworzenie zasobu
  onEditResource: (resource: IResource) => void; // edycja zasobu
  onViewResource: (resource: IResource) => void; // podgląd zasobu
  resource?: IResource | null; // opcjonalnie powiązany zasób
}

const ProductItem: React.FC<Props> = ({
  _id,
  title,
  description,
  price,
  imageUrl,
  onEdit,
  onCreateResource,
  onEditResource,
  onViewResource,
  resource,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  console.log("ProductItem resource:", resource);

  const handleDelete = () => {
    if (window.confirm("Na pewno chcesz usunąć ten produkt?")) {
      dispatch(deleteProduct(_id));
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow-md flex flex-col gap-2">
      <img
        src={imageUrl}
        alt={title}
        className="h-40 object-cover rounded-md"
      />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="font-bold">{formatCurrency(price)}</p>

      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={onEdit}
          className="bg-blue-500 text-white px-3 py-1 rounded-md"
        >
          Edytuj produkt
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-3 py-1 rounded-md"
        >
          Usuń produkt
        </button>

        {!resource ? (
          <button
            onClick={onCreateResource}
            className="bg-green-500 text-white px-3 py-1 rounded-md"
          >
            Dodaj zasób 1
          </button>
        ) : (
          <>
            <button
              onClick={() => onEditResource(resource)}
              className="bg-yellow-500 text-white px-3 py-1 rounded-md"
            >
              Edytuj zasób 2
            </button>
            <button
              onClick={() => onViewResource(resource)}
              className="bg-purple-500 text-white px-3 py-1 rounded-md"
            >
              Podgląd zasobu 3
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductItem;

// import React from "react";
// import { useDispatch } from "react-redux";
// import type { AppDispatch } from "../../store";
// import { deleteProduct } from "../../store/slices/productSlice";
// import { formatCurrency } from "../../utils/formatcurremcy";
// import type { IResource } from "../../types";

// interface Props {
//   _id: string;
//   title: string;
//   description: string;
//   price: number;
//   imageUrl: string;
//   onEdit: () => void; // teraz bez parametru, wywołujemy state w ProductList
//   onCreateResource: () => void;
//   onEditResource: (resource: IResource) => void;
// }

// const ProductItem: React.FC<Props> = ({
//   _id,
//   title,
//   description,
//   price,
//   imageUrl,
//   onEdit,
//   onCreateResource,
//   onEditResource,
// }) => {
//   const dispatch = useDispatch<AppDispatch>();

//   const handleDelete = () => {
//     if (window.confirm("Na pewno chcesz usunąć ten produkt?")) {
//       dispatch(deleteProduct(_id));
//     }
//   };

//   return (
//     <div className="border p-4 rounded-lg shadow-md flex flex-col gap-2">
//       <img
//         src={imageUrl}
//         alt={title}
//         className="h-40 object-cover rounded-md"
//       />
//       <h2 className="text-lg font-semibold">{title}</h2>
//       <p className="text-sm text-gray-600">{description}</p>
//       <p className="font-bold">{formatCurrency(price)}</p>
//       <div className="flex gap-2 mt-2">
//         <button
//           onClick={onEdit}
//           className="bg-blue-500 text-white px-3 py-1 rounded-md"
//         >
//           Edytuj
//         </button>
//         <button
//           onClick={handleDelete}
//           className="bg-red-500 text-white px-3 py-1 rounded-md"
//         >
//           Usuń
//         </button>
//         <button
//           onClick={() => onCreateResource()}
//           className="bg-green-500 text-white px-3 py-1 rounded-md"
//         >
//           Dodaj zasób
//         </button>

//         <button
//           onClick={() => onEditResource()}
//           className="bg-blue-500 text-white px-3 py-1 rounded-md"
//         >
//           Edytuj zasób
//         </button>

//         <button
//           onClick={() => onViewResource()}
//           className="bg-purple-500 text-white px-3 py-1 rounded-md"
//         >
//           Podgląd zasobu
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ProductItem;

// // // src/components/ProductItem.tsx
// // import React from "react";
// // import { useDispatch } from "react-redux";
// // import type { AppDispatch } from "../../store/index";
// // import { deleteProduct } from "../../store/slices/productSlice";
// // import { formatCurrency } from "../../utils/formatcurremcy";

// // interface Props {
// //   _id: string;
// //   title: string;
// //   description: string;
// //   price: number;
// //   imageUrl: string;
// //   onEdit: (id: string) => void;
// //   onViewResource: (id: string) => void;
// // }

// // const ProductItem: React.FC<Props> = ({
// //   _id,
// //   title,
// //   description,
// //   price,
// //   imageUrl,
// //   onEdit,
// //   onViewResource,
// // }) => {
// //   const dispatch = useDispatch<AppDispatch>();

// //   const handleDelete = () => {
// //     if (window.confirm("Na pewno chcesz usunąć ten produkt?")) {
// //       dispatch(deleteProduct(_id));
// //     }
// //   };

// //   return (
// //     <div className="border p-4 rounded-lg shadow-md flex flex-col gap-2">
// //       <img
// //         src={imageUrl}
// //         alt={title}
// //         className="h-40 object-cover rounded-md"
// //       />
// //       <h2 className="text-lg font-semibold">{title}</h2>
// //       <p className="text-sm text-gray-600">{description}</p>
// //       <p className="font-bold">{formatCurrency(price)}</p>
// //       <div className="flex gap-2 mt-2">
// //         <button
// //           onClick={() => onEdit(_id)}
// //           className="bg-blue-500 text-white px-3 py-1 rounded-md"
// //         >
// //           Edytuj
// //         </button>
// //         <button
// //           onClick={handleDelete}
// //           className="bg-red-500 text-white px-3 py-1 rounded-md"
// //         >
// //           Usuń
// //         </button>
// //         <button
// //           onClick={() => onViewResource(_id)}
// //           className="bg-green-500 text-white px-3 py-1 rounded-md"
// //         >
// //           Zasób
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ProductItem;
