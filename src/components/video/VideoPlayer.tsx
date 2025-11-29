// import { useEffect, useRef } from "react";

// interface Props {
//   guid: string; // bunnyGuid
//   libraryId: string;
// }

// export default function BunnyPlayer({ guid, libraryId }: Props) {
//   const divRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (!divRef.current) return;

//     // Bunny auto-replaces this div with the player
//     (window as any).bunny?.Player?.create(divRef.current, {
//       libraryId,
//       videoId: guid,
//       responsive: true,
//       autoplay: false,
//       controls: true,
//     });
//   }, [guid, libraryId]);

//   return (
//     <div
//       ref={divRef}
//       style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}
//     ></div>
//   );
// }
