import React, { useState } from "react";

export default function VideoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  const createVideo = async (title?: string) => {
    setStatus("Creating video object...");
    const resp = await fetch("/api/stream/create-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || file?.name || "untitled" }),
    });
    if (!resp.ok) throw new Error("create-video failed");
    return resp.json();
  };

  const uploadToBackend = async (videoId: string, f: File) => {
    setStatus("Uploading file to backend -> Bunny...");
    const fd = new FormData();
    fd.append("file", f);

    const resp = await fetch(`/api/stream/upload/${videoId}`, {
      method: "POST",
      body: fd,
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error("upload failed: " + txt);
    }
    return resp.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setStatus("Select file first");
    try {
      const created = await createVideo();
      const id =
        created.videoId || created.guid || created.id || created.videoId;
      if (!id) throw new Error("no videoId returned from create-video");
      setVideoId(id);
      await uploadToBackend(id, file);
      setStatus("Upload complete — video is processing on Bunny");
    } catch (err: any) {
      setStatus("Error: " + err.message);
    }
  };

  return (
    <div>
      <h3>Video uploader (Bunny Stream, backend proxy)</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button type="submit">Upload</button>
      </form>
      <div>{status}</div>
      {videoId && <div>videoId: {videoId}</div>}
    </div>
  );
}
