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
      console.log("⏳ Czekam na playerjs...");
      return;
    }

    let isMounted = true;

    // Inicjalizacja playera po załadowaniu iframe
    const initPlayer = () => {
      if (!isMounted) return;

      console.log("🎮 Inicjalizacja playerjs...");

      try {
        const player = new window.playerjs.Player(iframe);
        playerRef.current = player;

        player.on("ready", () => {
          if (!isMounted) return;
          console.log("✅ Player ready (playerjs)");

          player.on("play", () => {
            if (!isMounted) return;
            console.log("▶️ PLAY (playerjs)");
          });

          player.on("pause", () => {
            if (!isMounted) return;
            console.log("⏸️ PAUSE (playerjs)");
          });

          player.on("ended", () => {
            if (!isMounted) return;
            console.log("🏁 ENDED (playerjs)");
            if (onEnded) {
              onEnded();
            }
          });

          player.on("timeupdate", (data: any) => {
            if (!isMounted) return;
            // Opcjonalnie - loguj co 30 sekund
            if (data && Math.floor(data.seconds) % 30 === 0) {
              console.log(`⏱️ TIMEUPDATE: ${data.seconds}s`);
            }
          });
        });

        // Zapisz funkcję czyszczącą
        cleanupRef.current = () => {
          if (playerRef.current) {
            try {
              // Sprawdź czy iframe nadal istnieje i ma contentWindow
              if (iframe && iframe.contentWindow) {
                playerRef.current.off("play");
                playerRef.current.off("pause");
                playerRef.current.off("ended");
                playerRef.current.off("timeupdate");
              }
            } catch (e) {
              console.log(
                "🧹 Błąd podczas czyszczenia playera (ignorowany):",
                e,
              );
            }
            playerRef.current = null;
          }
        };
      } catch (e) {
        console.error("❌ Błąd inicjalizacji playera:", e);
      }
    };

    // Jeśli iframe jest już załadowany
    if (iframe.contentWindow) {
      initPlayer();
    } else {
      // Jeśli nie, czekamy na load
      iframe.addEventListener("load", initPlayer);
    }

    return () => {
      isMounted = false;

      // Usuń listener load
      if (iframe) {
        iframe.removeEventListener("load", initPlayer);
      }

      // Wywołaj czyszczenie
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

// BunnyPlayer.tsx - POPRAWIONA WERSJA
////////////////////////////////////////////////////////////////////////
// import { useEffect, useRef } from "react";

// interface BunnyPlayerProps {
//   guid: string;
//   libraryId: string;
//   className?: string;
//   onEnded?: () => void;
// }

// const BunnyPlayer: React.FC<BunnyPlayerProps> = ({
//   guid,
//   libraryId,
//   className = "",
//   onEnded,
// }) => {
//   const iframeRef = useRef<HTMLIFrameElement>(null);

//   useEffect(() => {
//     if (!guid || !libraryId) return;

//     const iframe = iframeRef.current;
//     if (iframe) {
//       console.log(
//         "🎯 Setting iframe src:",
//         `https://player.mediadelivery.net/embed/${libraryId}/${guid}?autoplay=false`,
//       );
//       iframe.src = `https://player.mediadelivery.net/embed/${libraryId}/${guid}?autoplay=false&metrics=false`;
//     }
//   }, [guid, libraryId]);

//   useEffect(() => {
//     console.log("👂 Setting up message listener for Bunny player");

//     const handleMessage = (event: MessageEvent) => {
//       // Sprawdź origin
//       if (event.origin !== "https://player.mediadelivery.net") {
//         return;
//       }

//       console.log("✅ Raw message from Bunny player:", event.data);

//       // 🔥 NAJWAŻNIEJSZE: Sparsuj dane jeśli są stringiem
//       let data = event.data;

//       // Jeśli data jest stringiem, spróbuj sparsować do JSON
//       if (typeof data === "string") {
//         try {
//           data = JSON.parse(data);
//           console.log("📦 Parsed JSON data:", data);
//         } catch (e) {
//           console.log("❌ Failed to parse JSON:", e);
//           return;
//         }
//       }

//       // Teraz data jest obiektem
//       console.log("🎬 Event received:", data?.event);

//       // Szczególne logowanie dla ended
//       if (data?.event === "ended") {
//         console.log("🏁🏁🏁 ENDED EVENT DETECTED! 🏁🏁🏁");
//         console.log("📞 Calling onEnded, exists?", !!onEnded);

//         if (onEnded) {
//           console.log("🎯 Calling onEnded NOW");
//           onEnded();
//         }
//       }

//       switch (data?.event) {
//         case "play":
//           console.log("▶️ Video started playing");
//           break;
//         case "pause":
//           console.log("⏸️ Video paused");
//           break;
//         case "ended":
//           console.log("🏁 VIDEO ENDED!");
//           if (onEnded) {
//             console.log("🎬 Calling onEnded callback");
//             onEnded();
//           }
//           break;
//         case "ready":
//           console.log("✅ Player ready");
//           break;
//         case "timeupdate":
//           // Ignoruj, żeby nie spamować
//           break;
//         default:
//           if (data?.event) {
//             console.log("🤔 Other event:", data.event);
//           }
//           break;
//       }
//     };

//     window.addEventListener("message", handleMessage);

//     return () => {
//       console.log("🧹 Cleaning up");
//       window.removeEventListener("message", handleMessage);
//     };
//   }, [onEnded]);

//   return (
//     <div style={{ width: "100%", aspectRatio: "16/9" }} className={className}>
//       <iframe
//         ref={iframeRef}
//         title="Bunny Stream Player"
//         width="100%"
//         height="100%"
//         allow="autoplay; encrypted-media; fullscreen"
//         style={{ border: 0, borderRadius: 8 }}
//       />
//     </div>
//   );
// };

// export default BunnyPlayer;
/////////////////////////////////////////////////////////////////////////////////

// import { useEffect, useRef } from "react";

// interface BunnyPlayerProps {
//   guid: string;
//   libraryId: string;
//   className?: string;
//   onEnded?: () => void;
// }

// const BunnyPlayer: React.FC<BunnyPlayerProps> = ({
//   guid,
//   libraryId,
//   className = "",
//   onEnded,
// }) => {
//   // console.log(
//   //   "Initializing BunnyPlayer with guid:",
//   //   guid,
//   //   "and libraryId:",
//   //   libraryId,
//   // );
//   const iframeRef = useRef<HTMLIFrameElement>(null);

//   useEffect(() => {
//     if (!guid || !libraryId) return;

//     const iframe = iframeRef.current;
//     if (iframe) {
//       console.log(
//         "🎯 Setting iframe src:",
//         `https://player.mediadelivery.net/embed/${libraryId}/${guid}?autoplay=false`,
//       );
//       iframe.src = `https://player.mediadelivery.net/embed/${libraryId}/${guid}?autoplay=false`;
//     }
//   }, [guid, libraryId]);

//   // useEffect(() => {
//   //   const handleMessage = (event: MessageEvent) => {
//   //     if (event.origin !== "https://player.mediadelivery.net") return;

//   //     if (event.data?.event === "ended" && onEnded) {
//   //       console.log("🎬 Video ended, calling onEnded");
//   //       onEnded();
//   //     }
//   //   };

//   //   window.addEventListener("message", handleMessage);

//   //   return () => {
//   //     window.removeEventListener("message", handleMessage);
//   //   };
//   // }, [onEnded]);

//   useEffect(() => {
//     const handleMessage = (event: MessageEvent) => {
//       //if (event.origin !== "https://player.mediadelivery.net") return;
//       // Sprawdźmy czy to w ogóle nasz player
//       if (event.origin !== "https://player.mediadelivery.net") {
//         console.log("❌ Wrong origin, ignoring:", event.origin);
//         return;
//       }

//       console.log("✅ Message from Bunny player:", event.data);
//       const data = event.data;
//       //console.log("Bunny player event:", data);

//       // Sprawdźmy strukturę danych
//       console.log("📊 Data structure:", {
//         hasEvent: "event" in (data || {}),
//         eventValue: data?.event,
//         hasData: "data" in (data || {}),
//         fullData: data,
//       });

//       switch (data?.event) {
//         case "play":
//           console.log("Video started playing");
//           break;
//         case "pause":
//           console.log("Video paused");
//           break;
//         case "ended":
//           if (onEnded) {
//             console.log("🎬 Video ended, calling onEnded");
//             onEnded();
//           }
//           break;
//         case "timeupdate":
//           break;
//         default:
//           break;
//       }
//     };

//     window.addEventListener("message", handleMessage);
//     return () => window.removeEventListener("message", handleMessage);
//   }, [onEnded]);

//   return (
//     <div style={{ width: "100%", aspectRatio: "16/9" }} className={className}>
//       <iframe
//         ref={iframeRef}
//         title="Bunny Stream Player"
//         width="100%"
//         height="100%"
//         allow="autoplay; encrypted-media"
//         style={{ border: 0, borderRadius: 8 }}
//       />
//     </div>
//   );
// };

// export default BunnyPlayer;
