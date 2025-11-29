import { useEffect, useRef } from "react";

interface Props {
  guid: string;
  libraryId: string;
}

export default function BunnyPlayer({ guid, libraryId }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!guid || !libraryId) return;

    // Wstawiamy iframe Bunny Player dynamicznie
    const iframe = iframeRef.current;
    if (iframe) {
      //iframe.src = `https://iframe.mediadelivery.net/player?video=${guid}&library=${libraryId}&autoplay=false`;
      iframe.src = `https://player.mediadelivery.net/embed/${libraryId}/${guid}?autoplay=false`;
    }
  }, [guid, libraryId]);

  return (
    <div style={{ width: "100%", aspectRatio: "16/9" }}>
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
}
