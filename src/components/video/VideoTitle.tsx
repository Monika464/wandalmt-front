// components/video/VideoTitle.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { fetchVideoUrl } from "../../store/slices/videoSlice"; // lub resourceSlice

interface VideoTitleProps {
  videoId: string;
  short?: boolean;
}

const VideoTitle: React.FC<VideoTitleProps> = ({ videoId, short = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchTitle = async () => {
      if (!videoId) return;

      setLoading(true);
      try {
        const result = await dispatch(fetchVideoUrl(videoId)).unwrap();
        //console.log("Fetched video title data:", result.video.title);
        setTitle(result.video.title);
      } catch (err) {
        console.error("Error fetching video title:", err);
        setError("Failed to load title");
        setTitle(`Video ${videoId.substring(0, 8)}...`);
      } finally {
        setLoading(false);
      }
    };

    fetchTitle();
  }, [videoId, dispatch]);

  if (!videoId) {
    return <span className="text-gray-500">No video</span>;
  }

  if (loading) {
    return <span className="text-gray-500 italic">Loading...</span>;
  }

  if (error) {
    return <span className="text-red-500">{error}</span>;
  }

  const displayTitle =
    short && title.length > 30 ? `${title.substring(0, 30)}...` : title;

  return (
    <span className="font-medium text-gray-800" title={title}>
      {displayTitle}
    </span>
  );
};

export default VideoTitle;
