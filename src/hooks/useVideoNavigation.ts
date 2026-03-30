import { useNavigate } from "react-router-dom";
import type { IChapter } from "../types/types";

export const useVideoNavigation = () => {
  const navigate = useNavigate();

  const handlePlayVideo = (chapter: IChapter): void => {
    try {
      if (!chapter?.videoId) {
        alert("No video available for this chapter");
        return;
      }

      //console.log("Navigating to video:", chapter.videoId);
      navigate(`/watch/${chapter.videoId}`);
    } catch (error) {
      console.error("Failed to navigate to video:", error);
      alert("An error occurred while trying to play the video");
    }
  };

  return { handlePlayVideo };
};
