import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import BunnyPlayer from "../components/video/BunnyPlayer";
import { fetchVideoUrl } from "../store/slices/videoSlice";
import type { AppDispatch } from "../store";

export default function WatchPage() {
  const { videoId } = useParams();

  const dispatch = useDispatch<AppDispatch>();
  const { video, loading, loaded } = useSelector((s: any) => s.video);

  if (!videoId) return;

  useEffect(() => {
    if (videoId) dispatch(fetchVideoUrl(videoId));
    console.log("Video ID from params watchcompo:", videoId);
  }, [dispatch, videoId]);

  if (loading) return <p>Ładowanie wideo...</p>;
  // if (!video && loaded) return <p>Brak wideo</p>;

  return (
    <BunnyPlayer
      guid={video.bunnyGuid}
      libraryId={import.meta.env.VITE_BUNNY_LIBRARY_ID}
    />
  );
}

// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchVideoUrl } from "../store/slices/videoSlice";
// import VideoPlayer from "../components/video/VideoPlayer";

// export default function WatchVideo() {
//   const dispatch = useDispatch<any>();
//   const url = useSelector((state: any) => state.video.url);
//   const loading = useSelector((state: any) => state.video.loading);

//   useEffect(() => {
//     dispatch(fetchVideoUrl("VIDEO_GUID_TUTAJ"));
//   }, []);

//   if (loading) return <p>Ładuję video...</p>;
//   if (!url) return <p>Brak video</p>;

//   return (
//     <div>
//       <h2>Odtwarzacz</h2>
//       <VideoPlayer src={url} />
//     </div>
//   );
// }
