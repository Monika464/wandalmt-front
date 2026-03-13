import { useEffect, useRef } from "react";

interface BunnyPlayerProps {
  guid: string;
  libraryId: string;
  className?: string;
  onEnded?: () => void;
}

const BunnyPlayer: React.FC<BunnyPlayerProps> = ({
  guid,
  libraryId,
  className = "",
  onEnded,
}) => {
  // console.log(
  //   "Initializing BunnyPlayer with guid:",
  //   guid,
  //   "and libraryId:",
  //   libraryId,
  // );
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!guid || !libraryId) return;

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.src = `https://player.mediadelivery.net/embed/${libraryId}/${guid}?autoplay=false`;
    }
  }, [guid, libraryId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://player.mediadelivery.net") return;

      if (event.data?.event === "ended" && onEnded) {
        console.log("🎬 Video ended, calling onEnded");
        onEnded();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onEnded]);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://player.mediadelivery.net") return;

      const data = event.data;
      //console.log("Bunny player event:", data);

      switch (data?.event) {
        case "play":
          console.log("Video started playing");
          break;
        case "pause":
          console.log("Video paused");
          break;
        case "ended":
          if (onEnded) {
            console.log("🎬 Video ended, calling onEnded");
            onEnded();
          }
          break;
        case "timeupdate":
          break;
        default:
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onEnded]);

  return (
    <div style={{ width: "100%", aspectRatio: "16/9" }} className={className}>
      <iframe
        ref={iframeRef}
        title="Bunny Stream Player"
        width="100%"
        height="100%"
        allow="autoplay; encrypted-media"
        style={{ border: 0, borderRadius: 8 }}
      />
    </div>
  );
};

export default BunnyPlayer;
