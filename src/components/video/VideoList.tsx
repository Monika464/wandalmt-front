import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchVideosUrls } from "../../store/slices/videoSlice";
import { useNavigate } from "react-router-dom";

export default function VideoList() {
  const dispatch = useDispatch<AppDispatch>();

  const navigate = useNavigate();

  const { videos, loading } = useSelector((state: RootState) => state.video);

  useEffect(() => {
    dispatch(fetchVideosUrls());
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {videos &&
        videos.map((v: any) => (
          <div key={v._id}>
            <button
              onClick={() => navigate(`/watch/${v._id}`)}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              {v.title}
            </button>
          </div>
        ))}
    </div>
  );
}
