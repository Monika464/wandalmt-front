import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchResourceById, editResource } from "../store/slices/resourceSlice";

export default function ResourceEditPage() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const dispatch = useDispatch();

  const resource = useSelector((state: any) => state.resources.selected);

  useEffect(() => {
    if (resourceId) {
      dispatch(fetchResourceById(resourceId));
    }
  }, [resourceId, dispatch]);

  if (!resource) return <p>Ładowanie zasobu...</p>;

  const handleSave = () => {
    dispatch(
      editResource({ id: resource._id, resourceData: { title: "Nowy tytuł" } })
    );
  };

  return (
    <div>
      <h1>Edycja zasobu</h1>
      <p>{resource.title}</p>
      <button onClick={handleSave}>Zapisz zmiany</button>
    </div>
  );
}
