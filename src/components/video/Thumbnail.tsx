import { useEffect, useState } from "react";
import axios from "axios";

function Thumbnail({ bunnyVideoId }) {
  const [imgSrc, setImgSrc] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThumbnail = async () => {
      try {
        const response = await axios.get(
          // `http://localhost:3000/api/stream/proxy-thumbnail/${bunnyVideoId}`,
          `http://localhost:3000/api/stream/proxy-thumbnail/${bunnyVideoId}?width=96&height=64`,
          { responseType: "blob" }
        );

        // Konwertuj blob na URL
        const imageUrl = URL.createObjectURL(response.data);
        setImgSrc(imageUrl);
      } catch (error) {
        console.error("Failed to load thumbnail:", error);
        setImgSrc(
          `https://vz-b1e17e22-226.b-cdn.net/${bunnyVideoId}/thumbnail.jpg`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchThumbnail();
  }, [bunnyVideoId]);

  if (loading)
    return <div className="w-48 h-32 bg-gray-200 rounded">Loading...</div>;

  //   // Test 1: Sprawdź rozmiar blobu
  //   const testBlob = async () => {
  //     const response = await fetch(
  //       "http://localhost:3000/api/stream/proxy-thumbnail/427be2ab-0d6f-4950-b351-eeb257a29775?width=96&height=64"
  //     );
  //     const blob = await response.blob();
  //     console.log("Rozmiar blobu:", blob.size, "bajtów");

  //     // Stwórz tymczasowy obrazek
  //     const img = new Image();
  //     img.onload = function () {
  //       console.log("Obrazek ma:", this.naturalWidth, "x", this.naturalHeight);
  //     };
  //     img.src = URL.createObjectURL(blob);
  //   };

  //   // Test 2: Sprawdź nagłówki
  //   const testHeaders = async () => {
  //     const response = await fetch(
  //       "http://localhost:3000/api/stream/proxy-thumbnail/427be2ab-0d6f-4950-b351-eeb257a29775"
  //     );
  //     console.log("Content-Type:", response.headers.get("content-type"));
  //     console.log("Content-Length:", response.headers.get("content-length"));
  //   };

  //   testBlob();
  //   testHeaders();

  return (
    <img
      src={imgSrc}
      alt="thumbnail"
      //className="w-24 h-16 md:w-32 md:h-20 lg:w-48 lg:h-32"
      className="w-full max-w-[6rem] h-16 object-cover rounded border"
      onError={(e) => {
        e.target.src = "https://placehold.co/192x128?text=No+Thumbnail";
      }}
    />
  );
}

export default Thumbnail;
