import { useEffect, useState } from "react";
import { fetchResource } from "../../store/slices/resourceSlice";
import CreateResourceForm from "../resources/CreateResourceForm";
import EditResourceForm from "../resources/EditResourceForm";
import ViewResource from "../resources/ViewResource";
import EditProductForm from "./EditProductForm";
import ProductItem from "./ProductItem";
import { fetchProducts } from "../../store/slices/productSlice";
import type { Product } from "../../types";
import type { IResource } from "../../types";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";

// ...
const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { products, loading, error } = useSelector(
    (state: RootState) => state.products
  );
  // const { selected: viewingResource } = useSelector(
  //   (state: RootState) => state.resources
  // );
  const { resourcesByProductId, selected: viewingResource } = useSelector(
    (state: RootState) => state.resources
  );
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [creatingResourceProduct, setCreatingResourceProduct] =
    useState<Product | null>(null);
  const [editingResource, setEditingResource] = useState<IResource | null>(
    null
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleCloseEditProduct = () => setEditingProductId(null);
  const handleCloseCreateResource = () => setCreatingResourceProduct(null);
  const handleCloseEditResource = () => setEditingResource(null);
  const handleCloseViewResource = () => {
    // możesz dać action np. clearSelectedResource()
    // albo ustawić selected na null w slice
    // dispatch(clearSelectedResource());
  };
  useEffect(() => {
    products.forEach((p) => dispatch(fetchResource(p._id)));
  }, [products, dispatch]);

  const handleViewResource = (productId: string) => {
    dispatch(fetchResource(productId));
    console.log("Viewing resource for productId:", productId);
  };

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      {products.map((product) => {
        const resource = resourcesByProductId[product._id];
        console.log("Resource dla produktu:", product._id, resource);

        return (
          <div key={product._id} className="relative">
            <ProductItem
              {...product}
              resource={resource || null}
              onEdit={() => setEditingProductId(product._id)}
              onCreateResource={() => setCreatingResourceProduct(product)}
              onEditResource={(resource) => setEditingResource(resource)}
              onViewResource={() => handleViewResource(product._id)}
            />

            {editingProductId === product._id && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <EditProductForm
                  product={product}
                  onClose={handleCloseEditProduct}
                />
              </div>
            )}

            {creatingResourceProduct?._id === product._id && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <CreateResourceForm
                  productId={creatingResourceProduct._id}
                  onClose={handleCloseCreateResource}
                />
              </div>
            )}

            {editingResource && editingResource.productId === product._id && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <EditResourceForm
                  resource={editingResource}
                  onClose={handleCloseEditResource}
                />
              </div>
            )}

            {viewingResource && viewingResource.productId === product._id && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-100">
                <ViewResource
                  resource={viewingResource}
                  onClose={handleCloseViewResource}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
    // <div>
    //   <h1 className="text-2xl font-bold mb-4">Lista produktów</h1>
    //   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //     {products.map((product) => (

    //       <div key={product._id} className="relative">
    //         <ProductItem
    //           {...product}
    //           resource={resourcesByProductId[product._id] || null} // ← przekazujesz resource
    //           onEdit={() => setEditingProductId(product._id)}
    //           onCreateResource={() => setCreatingResourceProduct(product)}
    //           onEditResource={(resource) => setEditingResource(resource)}
    //           onViewResource={() => handleViewResource(product._id)}
    //         />

    //         {editingProductId === product._id && (
    //           <div className="mt-4 p-4 border rounded-lg bg-gray-50">
    //             <EditProductForm
    //               product={product}
    //               onClose={handleCloseEditProduct}
    //             />
    //           </div>
    //         )}

    //         {creatingResourceProduct?._id === product._id && (
    //           <div className="mt-4 p-4 border rounded-lg bg-gray-50">
    //             <CreateResourceForm
    //               productId={creatingResourceProduct._id}
    //               onClose={handleCloseCreateResource}
    //             />
    //           </div>
    //         )}

    //         {editingResource && editingResource.productId === product._id && (
    //           <div className="mt-4 p-4 border rounded-lg bg-gray-50">
    //             <EditResourceForm
    //               resource={editingResource}
    //               onClose={handleCloseEditResource}
    //             />
    //           </div>
    //         )}

    //         {/* Podgląd zasobu */}
    //         {viewingResource && viewingResource.productId === product._id && (
    //           <div className="mt-4 p-4 border rounded-lg bg-gray-100">
    //             <ViewResource
    //               resource={viewingResource}
    //               onClose={handleCloseViewResource}
    //             />
    //           </div>
    //         )}
    //       </div>
    //     ))}
    //   </div>
    // </div>
  );
};

export default ProductList;

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import type { AppDispatch, RootState } from "../../store";
// import { fetchProducts } from "../../store/slices/productSlice";
// import { fetchResource } from "../../store/slices/resourceSlice";
// import ProductItem from "./ProductItem";
// import EditProductForm from "./EditProductForm";
// import CreateResourceForm from "../resources/CreateResourceForm";
// import EditResourceForm from "../resources/EditResourceForm";
// import type { IResource, Product } from "../../types";
// import ViewResource from "../resources/ViewResource";

// const ProductList: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { products, loading, error } = useSelector(
//     (state: RootState) => state.products
//   );

//   const { selected: viewingResource } = useSelector(
//     (state: RootState) => state.resources
//   );

//   // Stany do formularzy
//   const [editingProductId, setEditingProductId] = useState<string | null>(null);
//   const [creatingResourceProduct, setCreatingResourceProduct] =
//     useState<Product | null>(null);
//   const [editingResource, setEditingResource] = useState<IResource | null>(
//     null
//   );
//   // const [viewingResource, setViewingResource] = useState<IResource | null>(
//   //   null
//   // );

//   useEffect(() => {
//     dispatch(fetchProducts());
//   }, [dispatch]);

//   const handleCloseEditProduct = () => setEditingProductId(null);
//   const handleCloseCreateResource = () => setCreatingResourceProduct(null);
//   const handleCloseEditResource = () => setEditingResource(null);
//   //const handleCloseViewResource = () => setViewingResource(null);

//   if (loading) return <p>Ładowanie...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Lista produktów</h1>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {products.map((product) => (
//           <div key={product._id} className="relative">
//             <ProductItem
//               {...product}
//               //resource={product.resource || null} // jeśli masz powiązany zasób w produkcie
//               onEdit={() => setEditingProductId(product._id)}
//               onCreateResource={() => setCreatingResourceProduct(product)}
//               onEditResource={(resource) => setEditingResource(resource)}
//               onViewResource={(resource) => setViewingResource(resource)}
//             />

//             {/* Formularz edycji produktu */}
//             {editingProductId === product._id && (
//               <div className="mt-4 p-4 border rounded-lg bg-gray-50">
//                 <EditProductForm
//                   product={product}
//                   onClose={handleCloseEditProduct}
//                 />
//               </div>
//             )}

//             {/* Formularz tworzenia zasobu */}
//             {creatingResourceProduct?._id === product._id && (
//               <div className="mt-4 p-4 border rounded-lg bg-gray-50">
//                 <CreateResourceForm
//                   productId={creatingResourceProduct._id}
//                   onClose={handleCloseCreateResource}
//                 />
//               </div>
//             )}

//             {/* Formularz edycji zasobu */}
//             {editingResource && editingResource.productId === product._id && (
//               <div className="mt-4 p-4 border rounded-lg bg-gray-50">
//                 <EditResourceForm
//                   resource={editingResource}
//                   onClose={handleCloseEditResource}
//                 />
//               </div>
//             )}

//             {/* Podgląd zasobu */}

//             <ViewResource
//               resource={undefined}
//               onClose={function (): void {
//                 throw new Error("Function not implemented.");
//               }}
//             />
//             {/* {viewingResource && viewingResource.productId === product._id && (
//               <div className="mt-4 p-4 border rounded-lg bg-gray-100">
//                 <h3 className="font-semibold text-lg mb-2">Podgląd zasobu</h3>
//                 <p>
//                   <strong>Tytuł:</strong> {viewingResource.title}
//                 </p>
//                 <p>
//                   <strong>Opis:</strong> {viewingResource.description}
//                 </p>
//                 <button
//                   onClick={handleCloseViewResource}
//                   className="mt-2 bg-gray-600 text-white px-3 py-1 rounded-md"
//                 >
//                   Zamknij
//                 </button>
//               </div>
//             )} */}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ProductList;
