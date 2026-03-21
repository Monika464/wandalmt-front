import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ThumbnailProps {
  bunnyVideoId: string;
  width?: number;
  height?: number;
  className?: string;
}

function Thumbnail({
  bunnyVideoId,
  width = 96,
  height = 64,
  className = "",
}: ThumbnailProps) {
  const [imgSrc, setImgSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!bunnyVideoId) {
      setError(true);
      setLoading(false);
      return;
    }

    const fetchThumbnail = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/stream/proxy-thumbnail/${bunnyVideoId}?width=${width}&height=${height}`,
          { responseType: "blob" },
        );

        // Convert blob to URL
        const imageUrl = URL.createObjectURL(response.data);
        setImgSrc(imageUrl);
        setError(false);
      } catch (error) {
        console.error("Failed to load thumbnail:", error);
        setError(true);
        // Fallback to direct URL
        setImgSrc(
          `https://vz-b1e17e22-226.b-cdn.net/${bunnyVideoId}/thumbnail.jpg`,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchThumbnail();

    // Cleanup URL while unmounting
    return () => {
      if (imgSrc && imgSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imgSrc);
      }
    };
  }, [bunnyVideoId, width, height]);

  if (loading) {
    return (
      <div
        className={`w-${width} h-${height} bg-gray-200 rounded animate-pulse flex items-center justify-center`}
      >
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  if (error && !imgSrc) {
    return (
      <div
        className={`w-${width} h-${height} bg-gray-100 rounded flex items-center justify-center`}
      >
        <span className="text-xs text-gray-400">No thumbnail</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt="Video thumbnail"
      className={`object-cover rounded border ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        target.src = "https://placehold.co/192x128?text=No+Thumbnail";
        target.onerror = null; // Prevents infinite loop
      }}
    />
  );
}

export default Thumbnail;
