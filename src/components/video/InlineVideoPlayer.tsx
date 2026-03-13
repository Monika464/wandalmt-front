// components/video/InlineVideoPlayer.tsx
import React, { useState } from "react";
import BunnyPlayer from "./BunnyPlayer";
import { Maximize } from "lucide-react";

interface InlineVideoPlayerProps {
  videoGuid?: string;
  title?: string;
  className?: string;
  onNext?: () => void;
  onPrev?: () => void;
  showControls?: boolean;
  onEnded?: () => void;
}

const InlineVideoPlayer: React.FC<InlineVideoPlayerProps> = ({
  videoGuid,
  title,
  className = "",
  onNext,
  onPrev,
  showControls = true,
  onEnded,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const libraryId = import.meta.env.VITE_BUNNY_LIBRARY_ID;

  const handleFullscreen = () => {
    const element = document.getElementById("video-player-container");
    if (!element) return;

    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  if (!videoGuid) {
    return (
      <div
        id="video-player-container"
        className={`bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden ${className}`}
      >
        <div className="relative pt-[56.25%]">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold mb-2">Select a Chapter</h3>
            <p className="text-gray-400 text-center">
              Choose a chapter from the sidebar to start watching
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="video-player-container"
      className={`bg-black rounded-xl overflow-hidden shadow-2xl ${className} ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
      }`}
    >
      {/* Video player */}
      <div className="relative pt-[56.25%] bg-black">
        <div className="absolute inset-0">
          <BunnyPlayer
            guid={videoGuid}
            libraryId={libraryId}
            className="w-full h-full"
            onEnded={onEnded}
          />
        </div>
      </div>

      {/* Title and basic controls */}
      {(title || showControls) && (
        <div className="bg-gray-900 text-white p-4">
          {title && (
            <div className="mb-3">
              <h3 className="font-semibold text-lg">{title}</h3>
            </div>
          )}

          {showControls && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={onPrev}
                  className="p-2 hover:bg-gray-800 rounded transition-colors"
                  title="Previous chapter"
                >
                  ←
                </button>
                <button
                  onClick={onNext}
                  className="p-2 hover:bg-gray-800 rounded transition-colors"
                  title="Next chapter"
                >
                  →
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleFullscreen}
                  className="p-2 hover:bg-gray-800 rounded transition-colors"
                  title="Fullscreen"
                >
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineVideoPlayer;
