import React, { useState } from "react";

interface Props {
  onUploaded?: (videoId: string) => void;
}

export default function VideoUploader({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  //const [videoId, setVideoId] = useState<string | null>(null);

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
    setStatus("Uploading file to backend");
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
    // sprawdzamy możliwe miejsca
    if (!created) return null;

    // 1) backend zwraca shape { success: true, video: { bunnyGuid, ... } }
    if (created.video?.bunnyGuid) return created.video.bunnyGuid;

    // 2) backend zwraca directly Bunny shape { guid: '...' }
    if (created.guid) return created.guid;

    // 3) legacy id fields
    if (created.id) return created.id;
    if (created.videoId) return created.videoId;

    // 4) czasem backend mógł zwrócić video: {..., guid: '...'}
    if (created.video?.guid) return created.video.guid;

    // nic nie znaleziono
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setStatus("Select file first");
    try {
      const created = await createVideo();
      const id = extractVideoId(created);
      // const id =
      //   created.videoId || created.guid || created.id || created.videoId;
      if (!id) throw new Error("no videoId returned from create-video");
      //console.log("Created video with id:", id);
      //setVideoId(id);
      onUploaded?.(id);
      await uploadToBackend(id, file);
      setStatus("Upload complete — video is processing on Bunny");
    } catch (err: any) {
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div>
      <h3>Video uploader</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button type="submit">Upload</button>
      </form>

      {/* {videoId && ( */}
      {file && status && (
        <div>
          {file?.name} - {status}
        </div>
      )}
    </div>
  );
}
