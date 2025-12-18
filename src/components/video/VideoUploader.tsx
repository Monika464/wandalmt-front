// components/video/VideoUploader.tsx
import React, { useState } from "react";

interface Props {
  onUploaded?: (videoId: string) => void;
  existingVideoId?: string;
}

export default function VideoUploader({ onUploaded, existingVideoId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [createdVideoId, setCreatedVideoId] = useState<string | null>(
    existingVideoId || null
  );

  const createVideo = async (title?: string) => {
    setStatus("Creating video object...");
    const resp = await fetch("http://localhost:3000/api/stream/create-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || file?.name || "untitled" }),
    });
    if (!resp.ok) throw new Error("create-video failed");
    return resp.json();
  };

  const uploadToBackend = async (videoId: string, f: File) => {
    setStatus("Uploading file...");
    const fd = new FormData();
    fd.append("file", f);

    const resp = await fetch(
      `http://localhost:3000/api/stream/upload/${videoId}`,
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

  const extractVideoId = (created: any) => {
    if (!created) return null;
    if (created.video?.bunnyGuid) return created.video.bunnyGuid;
    if (created.guid) return created.guid;
    if (created.id) return created.id;
    if (created.videoId) return created.videoId;
    if (created.video?.guid) return created.video.guid;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setStatus("Select file first");

    setUploading(true);
    try {
      const created = await createVideo();
      const id = extractVideoId(created);

      if (!id) throw new Error("no videoId returned from create-video");

      setCreatedVideoId(id);
      onUploaded?.(id);

      await uploadToBackend(id, file);
      setStatus("✅ Upload complete - video is processing");
    } catch (err: any) {
      setStatus("❌ Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border p-4 rounded bg-gray-50">
      <h4 className="font-semibold mb-2">Upload Video</h4>

      {createdVideoId ? (
        <div className="text-green-600 mb-2">
          <p>✅ Video uploaded successfully!</p>
          <p className="text-sm">ID: {createdVideoId}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="border p-2 rounded w-full"
              disabled={uploading}
            />
          </div>

          {file && (
            <div className="text-sm text-gray-600">
              Selected: {file.name} ({Math.round(file.size / 1024 / 1024)}MB)
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className={`px-4 py-2 rounded ${
              !file || uploading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {uploading ? "Uploading..." : "Upload Video"}
          </button>
        </form>
      )}

      {status && (
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
      )}
    </div>
  );
}

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
