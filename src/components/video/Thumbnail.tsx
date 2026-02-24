import { useEffect, useState } from "react";
import axios from "axios";

// 🔥 Dodaj interfejs dla props
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
          `http://localhost:3000/api/stream/proxy-thumbnail/${bunnyVideoId}?width=${width}&height=${height}`,
          { responseType: "blob" },
        );

        // Konwertuj blob na URL
        const imageUrl = URL.createObjectURL(response.data);
        setImgSrc(imageUrl);
        setError(false);
      } catch (error) {
        console.error("Failed to load thumbnail:", error);
        setError(true);
        // Fallback do bezpośredniego URL
        setImgSrc(
          `https://vz-b1e17e22-226.b-cdn.net/${bunnyVideoId}/thumbnail.jpg`,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchThumbnail();

    // Cleanup URL przy odmontowaniu
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
        target.onerror = null; // Zapobiega nieskończonej pętli
      }}
    />
  );
}

export default Thumbnail;

// import { useEffect, useState } from "react";
// import axios from "axios";

// interface ThumbnailProps {
//   bunnyVideoId: string;
//   width?: number;
//   height?: number;
//   className?: string;
// }

// const Thumbnail = ({
//   bunnyVideoId,
//   width = 96,
//   height = 64,
//   className = "",
// }: ThumbnailProps) => {
//   const [imgSrc, setImgSrc] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     const fetchThumbnail = async () => {
//       try {
//         const response = await axios.get(
//           // `http://localhost:3000/api/stream/proxy-thumbnail/${bunnyVideoId}`,
//           `http://localhost:3000/api/stream/proxy-thumbnail/${bunnyVideoId}?width=96&height=64`,
//           { responseType: "blob" },
//         );

//         // Konwertuj blob na URL
//         const imageUrl = URL.createObjectURL(response.data);
//         setImgSrc(imageUrl);
//       } catch (error) {
//         console.error("Failed to load thumbnail:", error);
//         setImgSrc(
//           `https://vz-b1e17e22-226.b-cdn.net/${bunnyVideoId}/thumbnail.jpg`,
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchThumbnail();
//   }, [bunnyVideoId]);

//   if (loading)
//     return <div className="w-48 h-32 bg-gray-200 rounded">Loading...</div>;

//   return (
//     <img
//       src={imgSrc}
//       alt="thumbnail"
//       //className="w-24 h-16 md:w-32 md:h-20 lg:w-48 lg:h-32"
//       className="w-full max-w-[6rem] h-16 object-cover rounded border"
//       onError={(e) => {
//         e.target.src = "https://placehold.co/192x128?text=No+Thumbnail";
//       }}
//     />
//   );
// };

// export default Thumbnail;
