import { useEffect, useRef } from "react";

interface BunnyPlayerProps {
  guid: string;
  libraryId: string;
  className?: string;
  onEnded?: () => void;
}

declare global {
  interface Window {
    playerjs: any;
  }
}

const BunnyPlayer: React.FC<BunnyPlayerProps> = ({
  guid,
  libraryId,
  className = "",
  onEnded,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!guid || !libraryId) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    // Ustaw source iframe
    iframe.src = `https://player.mediadelivery.net/embed/${libraryId}/${guid}?autoplay=false`;
  }, [guid, libraryId]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !window.playerjs) {
      console.log("⏳ Waiting for player...");
      return;
    }

    let isMounted = true;

    // Inicjalizacja playera po załadowaniu iframe
    const initPlayer = () => {
      if (!isMounted) return;

      try {
        const player = new window.playerjs.Player(iframe);
        playerRef.current = player;

        player.on("ready", () => {
          if (!isMounted) return;

          player.on("play", () => {
            if (!isMounted) return;
          });

          player.on("pause", () => {
            if (!isMounted) return;
          });

          player.on("ended", () => {
            if (!isMounted) return;

            if (onEnded) {
              onEnded();
            }
          });

          player.on("timeupdate", (data: any) => {
            if (!isMounted) return;
            // Optional - log every 30 seconds
            // if (data && Math.floor(data.seconds) % 30 === 0) {
            //   console.log(`⏱️ TIMEUPDATE: ${data.seconds}s`);
            // }
          });
        });

        // Save cleanup function
        cleanupRef.current = () => {
          if (playerRef.current) {
            try {
              // Check if the iframe still exists and has a contentWindow
              if (iframe && iframe.contentWindow) {
                playerRef.current.off("play");
                playerRef.current.off("pause");
                playerRef.current.off("ended");
                playerRef.current.off("timeupdate");
              }
            } catch (e) {
              console.log("🧹 Error clearing player (ignored):", e);
            }
            playerRef.current = null;
          }
        };
      } catch (e) {
        console.error("❌ Error initializing player:", e);
      }
    };

    // If the iframe is already loaded
    if (iframe.contentWindow) {
      initPlayer();
    } else {
      // If not, wait for the load event
      iframe.addEventListener("load", initPlayer);
    }

    return () => {
      isMounted = false;

      // Remove load listener
      if (iframe) {
        iframe.removeEventListener("load", initPlayer);
      }

      // Call cleanup function
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [onEnded]);

  return (
    <div style={{ width: "100%", aspectRatio: "16/9" }} className={className}>
      <iframe
        ref={iframeRef}
        title="Bunny Stream Player"
        width="100%"
        height="100%"
        allow="autoplay; encrypted-media; fullscreen"
        style={{ border: 0, borderRadius: 8 }}
      />
    </div>
  );
};

export default BunnyPlayer;
