// components/video/VideoUploader.tsx
import React, { useState, useEffect } from "react";

interface Props {
  onUploaded?: (videoId: string, bunnyGuid: string) => void;
  existingVideoId?: string;
}

interface VideoStatus {
  _id: string;
  bunnyGuid: string;
  title: string;
  status: "uploading" | "processing" | "ready" | "error";
  processingProgress: number;
  thumbnailUrl?: string;
  errorMessage?: string;
}

export default function VideoUploader({ onUploaded, existingVideoId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("Wybierz plik wideo");
  const [uploading, setUploading] = useState(false);
  const [createdVideoId, setCreatedVideoId] = useState<string | null>(
    existingVideoId || null
  );
  const [createdBunnyGuid, setCreatedBunnyGuid] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null);
  const [pollingInterval, setPollingInterval] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Funkcja do sprawdzania statusu
  const checkStatus = async (videoId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/vbp/stream/webhook/bunny/${videoId}`
      );
      const data = await response.json();

      if (data.success && data.video) {
        setVideoStatus(data.video);

        // Aktualizuj status w UI
        if (data.video.status === "processing") {
          setStatus(`Przetwarzanie: ${data.video.processingProgress}%`);
        } else if (data.video.status === "ready") {
          setStatus("✅ Video gotowe do odtwarzania");
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        } else if (data.video.status === "error") {
          setStatus(`❌ Błąd: ${data.video.errorMessage}`);
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  // Rozpocznij polling statusu
  const startStatusPolling = (videoId: string) => {
    // Sprawdzaj co 5 sekund
    const interval = setInterval(() => checkStatus(videoId), 5000);
    setPollingInterval(interval);

    // Sprawdź od razu
    checkStatus(videoId);
  };

  // Cleanup przy unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const createVideo = async (title?: string) => {
    setStatus("Tworzenie obiektu wideo...");
    const resp = await fetch("http://localhost:3000/api/stream/create-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || file?.name || "untitled" }),
    });
    if (!resp.ok) throw new Error("create-video failed");
    return resp.json();
  };

  const uploadToBackend = async (
    videoId: string,
    bunnyGuid: string,
    f: File
  ) => {
    setStatus("Wysyłanie pliku...");
    const fd = new FormData();
    fd.append("file", f);

    const resp = await fetch(
      `http://localhost:3000/api/stream/upload/${bunnyGuid}`,
      {
        method: "POST",
        body: fd,
      }
    );

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error("upload failed: " + txt);
    }
    return resp.json();
  };

  const extractVideoData = (created: any) => {
    if (!created) return { videoId: null, bunnyGuid: null };

    return {
      videoId: created.video?._id || created.videoId || created.id,
      bunnyGuid: created.video?.bunnyGuid || created.guid || created.bunnyGuid,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setStatus("Wybierz plik wideo");

    setUploading(true);
    setStatus("Rozpoczynanie uploadu...");

    try {
      // 1. Stwórz video w systemie
      const created = await createVideo();
      const { videoId, bunnyGuid } = extractVideoData(created);

      if (!videoId || !bunnyGuid) {
        throw new Error("No videoId or bunnyGuid returned from create-video");
      }

      setCreatedVideoId(videoId);
      setCreatedBunnyGuid(bunnyGuid);

      // 2. Rozpocznij polling statusu
      startStatusPolling(videoId);

      // 3. Powiadom parent component
      onUploaded?.(videoId, bunnyGuid);

      // 4. Wyślij plik
      await uploadToBackend(videoId, bunnyGuid, file);

      setStatus("📤 Plik wysłany - trwa przetwarzanie przez Bunny...");
    } catch (err: any) {
      setStatus("❌ Błąd: " + err.message);
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    } finally {
      setUploading(false);
    }
  };

  // Progress bar komponent
  const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );

  return (
    <div className="border p-4 rounded bg-gray-50">
      <h4 className="font-semibold mb-2">Upload Wideo</h4>

      {createdVideoId && videoStatus ? (
        <div className="space-y-3">
          <div
            className={`p-3 rounded ${
              videoStatus.status === "ready"
                ? "bg-green-50 border border-green-200"
                : videoStatus.status === "error"
                ? "bg-red-50 border border-red-200"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">
                {videoStatus.status === "uploading"
                  ? "📤 Wysyłanie"
                  : videoStatus.status === "processing"
                  ? "🔄 Przetwarzanie"
                  : videoStatus.status === "ready"
                  ? "✅ Gotowe"
                  : "❌ Błąd"}
              </span>
              {videoStatus.status === "processing" && (
                <span className="text-sm font-bold">
                  {videoStatus.processingProgress}%
                </span>
              )}
            </div>

            {(videoStatus.status === "uploading" ||
              videoStatus.status === "processing") && (
              <ProgressBar progress={videoStatus.processingProgress} />
            )}

            {videoStatus.status === "ready" && videoStatus.thumbnailUrl && (
              <div className="mt-2">
                <img
                  src={videoStatus.thumbnailUrl}
                  alt="Thumbnail"
                  className="w-32 h-20 object-cover rounded border"
                />
              </div>
            )}

            {videoStatus.errorMessage && (
              <p className="text-sm text-red-600 mt-2">
                {videoStatus.errorMessage}
              </p>
            )}

            <div className="text-xs text-gray-500 mt-2 space-y-1">
              <p>Video ID: {videoStatus._id}</p>
              <p>Bunny GUID: {videoStatus.bunnyGuid}</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFile(file);
                  setStatus(
                    `Wybrano: ${file.name} (${Math.round(
                      file.size / 1024 / 1024
                    )}MB)`
                  );
                }
              }}
              className="border p-2 rounded w-full"
              disabled={uploading}
            />
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className={`px-4 py-2 rounded w-full ${
              !file || uploading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {uploading ? "Wysyłanie..." : "Wyślij Wideo"}
          </button>
        </form>
      )}

      <div
        className={`mt-2 text-sm ${
          status.includes("✅")
            ? "text-green-600"
            : status.includes("❌")
            ? "text-red-600"
            : "text-blue-600"
        }`}
      >
        {status}
      </div>

      {file && !createdVideoId && (
        <div className="text-xs text-gray-500 mt-2">
          <p>Rozmiar: {Math.round(file.size / 1024 / 1024)}MB</p>
          <p>Typ: {file.type}</p>
        </div>
      )}
    </div>
  );
}
// import React, { useState } from "react";

// interface Props {
//   onUploaded?: (videoId: string) => void;
//   existingVideoId?: string;
// }

// export default function VideoUploader({ onUploaded, existingVideoId }: Props) {
//   const [file, setFile] = useState<File | null>(null);
//   const [status, setStatus] = useState<string | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [createdVideoId, setCreatedVideoId] = useState<string | null>(
//     existingVideoId || null
//   );

//   const createVideo = async (title?: string) => {
//     setStatus("Creating video object...");
//     const resp = await fetch("http://localhost:3000/api/stream/create-video", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ title: title || file?.name || "untitled" }),
//     });
//     if (!resp.ok) throw new Error("create-video failed");
//     return resp.json();
//   };

//   const uploadToBackend = async (videoId: string, f: File) => {
//     setStatus("Uploading file...");
//     const fd = new FormData();
//     fd.append("file", f);

//     const resp = await fetch(
//       `http://localhost:3000/api/stream/upload/${videoId}`,
//       {
//         method: "POST",
//         body: fd,
//       }
//     );

//     if (!resp.ok) {
//       const txt = await resp.text();
//       throw new Error("upload failed: " + txt);
//     }
//     return resp.json();
//   };

//   const extractVideoId = (created: any) => {
//     if (!created) return null;
//     if (created.video?.bunnyGuid) return created.video.bunnyGuid;
//     if (created.guid) return created.guid;
//     if (created.id) return created.id;
//     if (created.videoId) return created.videoId;
//     if (created.video?.guid) return created.video.guid;
//     return null;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!file) return setStatus("Select file first");

//     setUploading(true);
//     try {
//       const created = await createVideo();
//       const id = extractVideoId(created);

//       if (!id) throw new Error("no videoId returned from create-video");

//       setCreatedVideoId(id);
//       onUploaded?.(id);

//       await uploadToBackend(id, file);
//       setStatus("✅ Upload complete - video is processing");
//     } catch (err: any) {
//       setStatus("❌ Error: " + err.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="border p-4 rounded bg-gray-50">
//       <h4 className="font-semibold mb-2">Upload Video</h4>

//       {createdVideoId ? (
//         <div className="text-green-600 mb-2">
//           <p>✅ Video uploaded successfully!</p>
//           <p className="text-sm">ID: {createdVideoId}</p>
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit} className="space-y-3">
//           <div>
//             <input
//               type="file"
//               accept="video/*"
//               onChange={(e) => setFile(e.target.files?.[0] ?? null)}
//               className="border p-2 rounded w-full"
//               disabled={uploading}
//             />
//           </div>

//           {file && (
//             <div className="text-sm text-gray-600">
//               Selected: {file.name} ({Math.round(file.size / 1024 / 1024)}MB)
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={!file || uploading}
//             className={`px-4 py-2 rounded ${
//               !file || uploading
//                 ? "bg-gray-300 cursor-not-allowed"
//                 : "bg-blue-500 hover:bg-blue-600 text-white"
//             }`}
//           >
//             {uploading ? "Uploading..." : "Upload Video"}
//           </button>
//         </form>
//       )}

//       {status && (
//         <div
//           className={`mt-2 text-sm ${
//             status.includes("✅")
//               ? "text-green-600"
//               : status.includes("❌")
//               ? "text-red-600"
//               : "text-blue-600"
//           }`}
//         >
//           {status}
//         </div>
//       )}
//     </div>
//   );
//}
//////////////////////////////////////////////////
// import React, { useState } from "react";

// interface Props {
//   onUploaded?: (videoId: string) => void;
// }

// export default function VideoUploader({ onUploaded }: Props) {
//   const [file, setFile] = useState<File | null>(null);
//   const [status, setStatus] = useState<string | null>(null);
//   //const [videoId, setVideoId] = useState<string | null>(null);

//   const createVideo = async (title?: string) => {
//     setStatus("Creating video object...");
//     const resp = await fetch("http://localhost:3000/api/stream/create-video", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ title: title || file?.name || "untitled" }),
//     });
//     if (!resp.ok) throw new Error("create-video failed");
//     return resp.json();
//   };

//   const uploadToBackend = async (videoId: string, f: File) => {
//     setStatus("Uploading file to backend");
//     const fd = new FormData();
//     fd.append("file", f);

//     const resp = await fetch(
//       `http://localhost:3000/api/stream/upload/${videoId}`,
//       {
//         method: "POST",
//         body: fd,
//       }
//     );

//     if (!resp.ok) {
//       const txt = await resp.text();
//       throw new Error("upload failed: " + txt);
//     }
//     return resp.json();
//   };

//   const extractVideoId = (created: any) => {
//     // sprawdzamy możliwe miejsca
//     if (!created) return null;

//     // 1) backend zwraca shape { success: true, video: { bunnyGuid, ... } }
//     if (created.video?.bunnyGuid) return created.video.bunnyGuid;

//     // 2) backend zwraca directly Bunny shape { guid: '...' }
//     if (created.guid) return created.guid;

//     // 3) legacy id fields
//     if (created.id) return created.id;
//     if (created.videoId) return created.videoId;

//     // 4) czasem backend mógł zwrócić video: {..., guid: '...'}
//     if (created.video?.guid) return created.video.guid;

//     // nic nie znaleziono
//     return null;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!file) return setStatus("Select file first");
//     try {
//       const created = await createVideo();
//       const id = extractVideoId(created);
//       // const id =
//       //   created.videoId || created.guid || created.id || created.videoId;
//       if (!id) throw new Error("no videoId returned from create-video");
//       //console.log("Created video with id:", id);
//       //setVideoId(id);
//       onUploaded?.(id);
//       await uploadToBackend(id, file);
//       setStatus("Upload complete — video is processing on Bunny");
//     } catch (err: any) {
//       setStatus("Error: " + err.message);
//     }
//   };

//   return (
//     <div>
//       <h3>Video uploader</h3>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="file"
//           accept="video/*"
//           onChange={(e) => setFile(e.target.files?.[0] ?? null)}
//         />
//         <button type="submit">Upload</button>
//       </form>

//       {/* {videoId && ( */}
//       {file && status && (
//         <div>
//           {file?.name} - {status}
//         </div>
//       )}
//     </div>
//   );
// }
