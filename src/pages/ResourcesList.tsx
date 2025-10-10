// import { useEffect } from "react";
// import { fetchResource } from "../../store/slices/resourceSlice";
// import type { AppDispatch, RootState } from "../store";
// import { useDispatch, useSelector } from "react-redux";

// export const ResourcesList: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();

//   const { products, loading, error } = useSelector(
//     (state: RootState) => state.products
//   );

//   useEffect(() => {
//     dispatch(fetchResource());
//   }, [dispatch]);

//   return <div></div>;
// };
