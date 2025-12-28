// components/video/VideoUploader.tsx
import React, { useState, useEffect, useRef } from "react";

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
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
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
  const pollingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Funkcja do sprawdzania statusu
  const checkStatus = async (videoId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/vbp/stream/webhook/bunny/${videoId}`
      );
      const data = await response.json();

      if (data.success && data.video) {
        const newStatus = data.video;
        setVideoStatus(newStatus);
        console.log("Polled video status:", newStatus);

        // FIX: Jeśli progress 100%, ustaw status "ready"
        const displayStatus =
          newStatus.status === "processing" &&
          newStatus.processingProgress >= 100
            ? "ready"
            : newStatus.status;

        // Aktualizuj status w UI
        switch (displayStatus) {
          case "uploading":
            setStatus(`📤 Wysyłanie: ${newStatus.processingProgress}%`);
            break;
          case "processing":
            setStatus(`🔄 Przetwarzanie: ${newStatus.processingProgress}%`);
            break;
          case "ready":
            setStatus("✅ Video gotowe do odtwarzania");
            stopPolling();

            //console.log("Video is ready:", newStatus);

            // Powiadom parent component
            if (onUploaded && newStatus.bunnyGuid && newStatus._id) {
              onUploaded(newStatus._id, newStatus.bunnyGuid);
            }
            console.log("Created Video ID:", newStatus._id);
            console.log("Bunny GUID:", newStatus.bunnyGuid);

            // if (onUploaded && newStatus.bunnyGuid && createdVideoId) {
            //   // Użyj newStatus._id jako videoId jeśli jest prawidłowy
            //   const finalVideoId = /^[0-9a-fA-F]{24}$/.test(newStatus._id || "")
            //     ? newStatus._id
            //     : createdVideoId;

            //   onUploaded(finalVideoId, newStatus.bunnyGuid);
            // }
            break;
          case "error":
            setStatus(`❌ Błąd: ${newStatus.errorMessage || "Nieznany błąd"}`);
            stopPolling();
            break;
        }
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  // Rozpocznij polling statusu
  const startStatusPolling = (videoId: string) => {
    // Najpierw zatrzymaj istniejący
    stopPolling();

    // Sprawdź od razu
    checkStatus(videoId);

    // Sprawdzaj co 3 sekundy
    pollingIntervalRef.current = setInterval(() => {
      checkStatus(videoId);
    }, 3000);
  };

  // Zatrzymaj polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Cleanup przy unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // Jeśli mamy existingVideoId, rozpocznij polling
  useEffect(() => {
    if (existingVideoId && !createdVideoId) {
      setCreatedVideoId(existingVideoId);
      startStatusPolling(existingVideoId);
    }
  }, [createdVideoId]);

  const createVideo = async (title?: string) => {
    setStatus("Tworzenie obiektu wideo...");
    const resp = await fetch("http://localhost:3000/api/stream/create-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || file?.name || "untitled" }),
    });
    if (!resp.ok) throw new Error("create-video failed");
    console.log("createVideo response:", resp.json); // DODAJ TEN LOG!
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
      //onUploaded?.(videoId, bunnyGuid);
      // if (onUploaded) {
      //   console.log("📤 Sending to parent:", { videoId, bunnyGuid });
      //   onUploaded(videoId || "pending", bunnyGuid || "pending");
      // }

      // 4. Wyślij plik
      await uploadToBackend(videoId, bunnyGuid, file);

      setStatus("📤 Plik wysłany - trwa przetwarzanie przez Bunny...");
    } catch (err: any) {
      console.error("Upload error:", err);
      setStatus("❌ Błąd: " + err.message);
      stopPolling();
    } finally {
      setUploading(false);
    }
  };

  // Progress bar komponent
  const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(progress, 100)}%` }}
      ></div>
    </div>
  );

  // Wyświetlanie miniaturki
  const Thumbnail = ({
    url,
    bunnyGuid,
  }: {
    url?: string;
    bunnyGuid: string;
  }) => {
    const [imgError, setImgError] = useState(false);

    if (imgError || !url) {
      return (
        <div className="w-32 h-20 bg-gray-200 rounded border flex items-center justify-center">
          <span className="text-xs text-gray-500">No thumbnail</span>
        </div>
      );
    }

    return (
      <img
        src={url}
        alt="Thumbnail"
        className="w-32 h-20 object-cover rounded border"
        onError={() => setImgError(true)}
      />
    );
  };

  // Oblicz wyświetlany status (fix dla progress 100%)
  const getDisplayStatus = () => {
    if (!videoStatus) return "checking";

    // Jeśli processing ale progress 100%, pokaż jako ready
    if (
      videoStatus.status === "processing" &&
      videoStatus.processingProgress >= 100
    ) {
      return "ready";
    }

    return videoStatus.status;
  };

  const displayStatus = getDisplayStatus();

  return (
    <div className="border p-4 rounded bg-gray-50 max-w-md">
      <h4 className="font-semibold mb-3 text-lg">Upload Wideo</h4>

      {/* KLUCZOWA ZMIANA: Używamy createdVideoId zamiast videoStatus */}
      {/* {createdVideoId ? ( */}
      {createdVideoId && videoStatus ? (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-lg ${
              displayStatus === "ready"
                ? "bg-green-50 border border-green-200"
                : displayStatus === "error"
                ? "bg-red-50 border border-red-200"
                : displayStatus === "processing"
                ? "bg-blue-50 border border-blue-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {displayStatus === "uploading"
                    ? "📤 Wysyłanie"
                    : displayStatus === "processing"
                    ? "🔄 Przetwarzanie"
                    : displayStatus === "ready"
                    ? "✅ Gotowe"
                    : "❌ Błąd"}
                </span>
                {(displayStatus === "uploading" ||
                  displayStatus === "processing") && (
                  <span className="text-sm font-bold bg-white px-2 py-1 rounded">
                    {videoStatus?.processingProgress || 0}%
                  </span>
                )}
              </div>

              {(displayStatus === "uploading" ||
                displayStatus === "processing") && (
                <div className="text-xs text-gray-500 animate-pulse">Live</div>
              )}
            </div>

            {(displayStatus === "uploading" ||
              displayStatus === "processing") && (
              <ProgressBar progress={videoStatus?.processingProgress || 0} />
            )}

            {displayStatus === "ready" && (
              <div className="mt-3">
                {videoStatus?.thumbnailUrl && (
                  <Thumbnail
                    url={videoStatus.thumbnailUrl}
                    bunnyGuid={videoStatus.bunnyGuid}
                  />
                )}
                <p className="text-sm text-green-600 mt-2">
                  Video jest gotowe do odtwarzania!
                </p>
                {videoStatus?.duration && (
                  <p className="text-xs text-gray-500">
                    Czas trwania: {videoStatus.duration}s
                  </p>
                )}
              </div>
            )}

            {videoStatus?.errorMessage && (
              <p className="text-sm text-red-600 mt-2 p-2 bg-red-100 rounded">
                {videoStatus.errorMessage}
              </p>
            )}

            <div className="text-xs text-gray-500 mt-3 space-y-1">
              <p>
                <span className="font-medium">Video ID:</span>{" "}
                {videoStatus?._id || createdVideoId}
              </p>
              <p>
                <span className="font-medium">Bunny GUID:</span>{" "}
                {videoStatus?.bunnyGuid || createdBunnyGuid}
              </p>
              <p>
                <span className="font-medium">Status:</span> {displayStatus}
              </p>
              <p>
                <span className="font-medium">Progress:</span>{" "}
                {videoStatus?.processingProgress || 0}%
              </p>
              {videoStatus?.updatedAt && (
                <p>
                  <span className="font-medium">Ostatnia aktualizacja:</span>{" "}
                  {new Date(videoStatus.updatedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {/* Przycisk resetu */}
          {(displayStatus === "ready" || displayStatus === "error") && (
            <button
              onClick={() => {
                setCreatedVideoId(null);
                setCreatedBunnyGuid(null);
                setVideoStatus(null);
                setFile(null);
                setStatus("Wybierz plik wideo");
                stopPolling();
              }}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
            >
              Wgraj kolejne video
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="video-upload"
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
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="video-upload" className="cursor-pointer block">
                <div className="text-4xl mb-2">📁</div>
                <p className="text-gray-600">
                  {file ? file.name : "Kliknij aby wybrać plik wideo"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  MP4, MOV, AVI, MKV (max 2GB)
                </p>
              </label>
            </div>

            {file && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Rozmiar: {Math.round(file.size / 1024 / 1024)}MB</p>
                <p>Typ: {file.type || "Nieznany"}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className={`px-4 py-3 rounded-lg w-full font-medium ${
              !file || uploading
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
            } transition-all duration-200`}
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Wysyłanie...
              </span>
            ) : (
              "Wyślij Wideo"
            )}
          </button>
        </form>
      )}

      {/* Status message */}
      {/* <div
        className={`mt-3 text-sm p-2 rounded ${
          status.includes("✅")
            ? "bg-green-100 text-green-700"
            : status.includes("❌")
            ? "bg-red-100 text-red-700"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        <div className="flex items-center">
          {status.includes("🔄") && (
            <span className="animate-spin mr-2">⟳</span>
          )}
          {status}
        </div>
      </div> */}
    </div>
  );
}
