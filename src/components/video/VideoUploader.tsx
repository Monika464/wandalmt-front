// components/video/VideoUploader.tsx
import axios, { AxiosError } from "axios";
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

// 🔥 Helper do sprawdzania typu błędu
const isAxiosError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error);
};

// 🔥 Helper do sprawdzania czy błąd ma response.data
const hasResponseData = (error: any): error is { response: { data: any } } => {
  return error?.response?.data !== undefined;
};

export default function VideoUploader({ onUploaded, existingVideoId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("Wybierz plik wideo");
  const [uploading, setUploading] = useState(false);
  const [createdVideoId, setCreatedVideoId] = useState<string | null>(
    existingVideoId || null,
  );
  // 🔥 Usunięto createdBunnyGuid - nieużywane
  const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [uploadCancelled, setUploadCancelled] = useState(false);
  const [videoTitle, setVideoTitle] = useState<string>("");

  const pollingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCancelUpload = () => {
    if (abortController) {
      abortController.abort();
      setUploadCancelled(true);
      setStatus("⏹️ Upload został przerwany przez użytkownika");
      stopPolling();
      setUploading(false);
    }
  };

  // Funkcja do sprawdzania statusu
  const checkStatus = async (videoId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/vbp/stream/webhook/bunny/${videoId}`,
        { timeout: 10000 },
      );

      if (response.data.success && response.data.video) {
        const newStatus = response.data.video;
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

            // Powiadom parent component
            if (onUploaded && newStatus.bunnyGuid && newStatus._id) {
              onUploaded(newStatus._id, newStatus.bunnyGuid);
            }
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
    stopPolling();
    checkStatus(videoId);

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
  }, [existingVideoId, createdVideoId]);

  const createVideo = async (title?: string) => {
    setStatus("Tworzenie obiektu wideo...");
    const videoTitle = title || file?.name || "untitled";

    try {
      const response = await axios.post(
        "http://localhost:3000/api/stream/create-video",
        {
          title: videoTitle,
          description: `Uploaded ${new Date().toLocaleString()}`,
          fileName: file?.name,
        },
        { timeout: 300000 },
      );

      if (response.data?.video) {
        response.data.video.title = response.data.video.title || videoTitle;
      }

      return response.data;
    } catch (error) {
      // 🔥 Poprawiona obsługa błędów z type guard
      if (isAxiosError(error)) {
        console.error("Server error:", error.response?.data);

        if (error.response?.status === 429) {
          throw new Error("Too many requests. Please wait and try again.");
        }
        if (error.code === "ECONNABORTED") {
          throw new Error(
            "Request timeout. Bunny.net may be experiencing delays.",
          );
        }
      }

      if (axios.isCancel(error)) {
        throw new Error("Request cancelled");
      }

      throw error;
    }
  };

  const uploadToBackend = async (
    _videoId: string, // 🔥 Prefix z _ oznacza że jest celowo nieużywane
    bunnyGuid: string,
    f: File,
  ) => {
    setStatus("Wysyłanie pliku...");
    const controller = new AbortController();
    setAbortController(controller);

    const fd = new FormData();
    fd.append("file", f);

    try {
      const response = await axios.post(
        `http://localhost:3000/api/stream/upload/${bunnyGuid}`,
        fd,
        {
          timeout: 600000,
          signal: controller.signal,
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setStatus(`📤 Wysyłanie: ${percent}%`);
            }
          },
        },
      );

      setAbortController(null);
      return response.data;
    } catch (error) {
      setAbortController(null);
      if (axios.isCancel(error)) {
        throw new Error("Upload cancelled by user");
      }
      throw error;
    }
  };

  const extractVideoData = (created: any) => {
    if (!created) return { videoId: null, bunnyGuid: null };

    return {
      videoId: created.video?._id || created.videoId || created.id,
      bunnyGuid: created.video?.bunnyGuid || created.guid || created.bunnyGuid,
    };
  };

  const uploadWithRetry = async (
    videoId: string,
    bunnyGuid: string,
    f: File,
    maxRetries = 2,
  ) => {
    let lastError: unknown;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await uploadToBackend(videoId, bunnyGuid, f);
      } catch (error) {
        lastError = error;

        if (axios.isCancel(error)) {
          throw error;
        }

        // 🔥 Poprawiona obsługa błędów z type guard
        if (i < maxRetries) {
          let shouldRetry = false;

          if (isAxiosError(error)) {
            shouldRetry =
              error.code === "ECONNABORTED" ||
              error.message?.includes("network") ||
              error.message?.includes("timeout");
          } else if (error instanceof Error) {
            shouldRetry =
              error.message.includes("network") ||
              error.message.includes("timeout");
          }

          if (shouldRetry) {
            const delay = 1000 * Math.pow(2, i);
            setStatus(
              `Upload failed, retrying in ${delay / 1000}s... (${
                i + 1
              }/${maxRetries})`,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        break;
      }
    }

    throw lastError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return setStatus("Wybierz plik wideo");

    setUploading(true);
    setUploadCancelled(false);
    setStatus("Rozpoczynanie uploadu...");

    try {
      // Ustaw tytuł z nazwy pliku (bez rozszerzenia)
      const title = file.name.replace(/\.[^/.]+$/, "");
      setVideoTitle(title);

      // 1. Stwórz video w systemie
      const created = await createVideo(title);
      const { videoId, bunnyGuid } = extractVideoData(created);

      if (!videoId || !bunnyGuid) {
        throw new Error("No videoId or bunnyGuid returned from create-video");
      }

      setCreatedVideoId(videoId);
      startStatusPolling(videoId);

      // 2. Wyślij plik
      await uploadWithRetry(videoId, bunnyGuid, file, 2);

      if (!uploadCancelled) {
        setStatus("📤 Plik wysłany - trwa przetwarzanie przez Bunny...");
      }
    } catch (err: unknown) {
      if (!uploadCancelled) {
        // 🔥 Poprawiona obsługa błędów
        if (err instanceof Error) {
          console.error("Upload error:", err.message);
          setStatus("❌ Błąd: " + err.message);
        } else if (typeof err === "string") {
          console.error("Upload error:", err);
          setStatus("❌ Błąd: " + err);
        } else {
          console.error("Upload error:", err);
          setStatus("❌ Błąd: Nieznany błąd");
        }
      }
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

  // Oblicz wyświetlany status
  const getDisplayStatus = () => {
    if (!videoStatus) return "checking";

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

      {/* Stan 1: Upload został przerwany */}
      {uploadCancelled && (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⏹️</span>
            <div>
              <p className="font-medium text-yellow-700">Upload przerwany</p>
              <p className="text-sm text-yellow-600">
                Możesz spróbować ponownie.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setUploadCancelled(false);
              setStatus("Wybierz plik wideo");
            }}
            className="mt-3 px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Spróbuj ponownie
          </button>
        </div>
      )}

      {/* Stan 2: Formularz uploadu (kiedy nie ma videoId) */}
      {!createdVideoId && !uploadCancelled && (
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
                        file.size / 1024 / 1024,
                      )}MB)`,
                    );
                    // Ustaw tytuł z nazwy pliku
                    setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
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
                <p className="font-medium mt-1">
                  Tytuł: {videoTitle || file.name.replace(/\.[^/.]+$/, "")}
                </p>
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

      {/* Stan 3: Ładowanie (videoId istnieje, ale brak statusu) */}
      {createdVideoId && !videoStatus && !uploadCancelled && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <p className="font-medium text-blue-700">
                Inicjalizacja wideo...
              </p>
              <p className="text-sm text-blue-600">
                {videoTitle ? `"${videoTitle}"` : "Tworzenie obiektu wideo"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Proszę czekać...</p>
            </div>
          </div>
        </div>
      )}

      {/* Stan 4: Pełne informacje o wideo */}
      {createdVideoId && videoStatus && !uploadCancelled && (
        <div className="space-y-4">
          {/* Karta z informacjami o wideo */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h5 className="font-medium text-gray-800 mb-2">
              Informacje o wideo
            </h5>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Tytuł:</span>{" "}
                <span className="text-blue-600">
                  {videoStatus.title || videoTitle || "Bez tytułu"}
                </span>
              </p>
              {file && (
                <p className="text-sm">
                  <span className="font-medium">Plik:</span> {file.name}
                </p>
              )}
              {videoStatus.createdAt && (
                <p className="text-xs text-gray-500">
                  Utworzono: {new Date(videoStatus.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Karta ze statusem */}
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
                    {videoStatus.processingProgress}%
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
              <ProgressBar progress={videoStatus.processingProgress} />
            )}

            {displayStatus === "ready" && (
              <div className="mt-3">
                <div className="flex items-start space-x-4">
                  {videoStatus.thumbnailUrl && (
                    <Thumbnail
                      url={videoStatus.thumbnailUrl}
                      bunnyGuid={videoStatus.bunnyGuid}
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-green-600 font-medium">
                      ✅ Video gotowe do odtwarzania
                    </p>
                    {videoStatus.duration && (
                      <p className="text-sm text-gray-600">
                        Czas trwania: {Math.round(videoStatus.duration)} sekund
                      </p>
                    )}
                    {file && (
                      <p className="text-xs text-gray-500 mt-1">
                        Rozmiar: {Math.round(file.size / 1024 / 1024)}MB
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {videoStatus.errorMessage && (
              <p className="text-sm text-red-600 mt-2 p-2 bg-red-100 rounded">
                {videoStatus.errorMessage}
              </p>
            )}

            <div className="text-xs text-gray-500 mt-3 space-y-1">
              <p>
                <span className="font-medium">Postęp:</span>{" "}
                {videoStatus.processingProgress}%
              </p>
              <p>
                <span className="font-medium">Status:</span> {displayStatus}
              </p>
              {videoStatus.updatedAt && (
                <p>
                  <span className="font-medium">Ostatnia aktualizacja:</span>{" "}
                  {new Date(videoStatus.updatedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {/* Przyciski akcji */}
          <div className="flex space-x-2 pt-2">
            {displayStatus === "ready" && onUploaded && (
              <button
                onClick={() => {
                  if (onUploaded && videoStatus.bunnyGuid && videoStatus._id) {
                    onUploaded(videoStatus._id, videoStatus.bunnyGuid);
                  }
                }}
                className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                Zapisz video
              </button>
            )}
            <button
              onClick={() => {
                setCreatedVideoId(null);
                setVideoStatus(null);
                setFile(null);
                setVideoTitle("");
                setStatus("Wybierz plik wideo");
                stopPolling();
              }}
              className="px-3 py-2 text-sm border rounded hover:bg-gray-100"
            >
              {displayStatus === "ready" ? "Zamknij" : "Anuluj"}
            </button>
          </div>
        </div>
      )}

      {/* Przycisk przerwania uploadu (pokazuje się tylko podczas uploadu) */}
      {uploading && !uploadCancelled && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={handleCancelUpload}
            className="px-4 py-2 text-sm w-full border border-red-300 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center space-x-2"
          >
            <span>⏹️</span>
            <span>Przerwij upload</span>
          </button>
          <p className="text-xs text-gray-500 text-center mt-1">
            Upload w toku...
          </p>
        </div>
      )}

      {/* Status message (na dole) */}
      <div className="mt-3">
        <div
          className={`text-sm p-3 rounded-lg ${
            status.includes("✅")
              ? "bg-green-100 text-green-700 border border-green-200"
              : status.includes("❌")
                ? "bg-red-100 text-red-700 border border-red-200"
                : status.includes("⏹️")
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  : status.includes("🔄") || status.includes("📤")
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
          }`}
        >
          <div className="flex items-center">
            {status.includes("🔄") && (
              <span className="animate-spin mr-2">⟳</span>
            )}
            <span>{status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// // components/video/VideoUploader.tsx
// import axios from "axios";
// import React, { useState, useEffect, useRef } from "react";

// interface Props {
//   onUploaded?: (videoId: string, bunnyGuid: string) => void;
//   existingVideoId?: string;
// }

// interface VideoStatus {
//   _id: string;
//   bunnyGuid: string;
//   title: string;
//   status: "uploading" | "processing" | "ready" | "error";
//   processingProgress: number;
//   thumbnailUrl?: string;
//   errorMessage?: string;
//   duration?: number;
//   createdAt?: string;
//   updatedAt?: string;
// }

// export default function VideoUploader({ onUploaded, existingVideoId }: Props) {
//   const [file, setFile] = useState<File | null>(null);
//   const [status, setStatus] = useState<string>("Wybierz plik wideo");
//   const [uploading, setUploading] = useState(false);
//   const [createdVideoId, setCreatedVideoId] = useState<string | null>(
//     existingVideoId || null,
//   );
//   const [createdBunnyGuid, setCreatedBunnyGuid] = useState<string | null>(null);
//   const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null);
//   const [abortController, setAbortController] =
//     useState<AbortController | null>(null);
//   const [uploadCancelled, setUploadCancelled] = useState(false);
//   const [videoTitle, setVideoTitle] = useState<string>("");

//   const pollingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const handleCancelUpload = () => {
//     if (abortController) {
//       abortController.abort();
//       setUploadCancelled(true);
//       setStatus("⏹️ Upload został przerwany przez użytkownika");
//       stopPolling();
//       setUploading(false);
//     }
//   };

//   // Funkcja do sprawdzania statusu
//   const checkStatus = async (videoId: string) => {
//     try {
//       const response = await axios.get(
//         `http://localhost:3000/vbp/stream/webhook/bunny/${videoId}`,
//         { timeout: 10000 },
//       );

//       if (response.data.success && response.data.video) {
//         const newStatus = response.data.video;
//         setVideoStatus(newStatus);
//         console.log("Polled video status:", newStatus);

//         // FIX: Jeśli progress 100%, ustaw status "ready"
//         const displayStatus =
//           newStatus.status === "processing" &&
//           newStatus.processingProgress >= 100
//             ? "ready"
//             : newStatus.status;

//         // Aktualizuj status w UI
//         switch (displayStatus) {
//           case "uploading":
//             setStatus(`📤 Wysyłanie: ${newStatus.processingProgress}%`);
//             break;
//           case "processing":
//             setStatus(`🔄 Przetwarzanie: ${newStatus.processingProgress}%`);
//             break;
//           case "ready":
//             setStatus("✅ Video gotowe do odtwarzania");
//             stopPolling();

//             // Powiadom parent component
//             if (onUploaded && newStatus.bunnyGuid && newStatus._id) {
//               onUploaded(newStatus._id, newStatus.bunnyGuid);
//             }
//             break;
//           case "error":
//             setStatus(`❌ Błąd: ${newStatus.errorMessage || "Nieznany błąd"}`);
//             stopPolling();
//             break;
//         }
//       }
//     } catch (error) {
//       console.error("Error checking status:", error);
//     }
//   };

//   // Rozpocznij polling statusu
//   const startStatusPolling = (videoId: string) => {
//     stopPolling();
//     checkStatus(videoId);

//     pollingIntervalRef.current = setInterval(() => {
//       checkStatus(videoId);
//     }, 3000);
//   };

//   // Zatrzymaj polling
//   const stopPolling = () => {
//     if (pollingIntervalRef.current) {
//       clearInterval(pollingIntervalRef.current);
//       pollingIntervalRef.current = null;
//     }
//   };

//   // Cleanup przy unmount
//   useEffect(() => {
//     return () => {
//       stopPolling();
//     };
//   }, []);

//   // Jeśli mamy existingVideoId, rozpocznij polling
//   useEffect(() => {
//     if (existingVideoId && !createdVideoId) {
//       setCreatedVideoId(existingVideoId);
//       startStatusPolling(existingVideoId);
//     }
//   }, [existingVideoId]);

//   const createVideo = async (title?: string) => {
//     setStatus("Tworzenie obiektu wideo...");
//     const videoTitle = title || file?.name || "untitled";

//     try {
//       const response = await axios.post(
//         "http://localhost:3000/api/stream/create-video",
//         {
//           title: videoTitle,
//           description: `Uploaded ${new Date().toLocaleString()}`,
//           fileName: file?.name,
//         },
//         { timeout: 300000 },
//       );

//       if (response.data?.video) {
//         response.data.video.title = response.data.video.title || videoTitle;
//       }

//       return response.data;
//     } catch (error) {
//       console.error("Server error:", error.response?.data);

//       if (error.response?.status === 429) {
//         throw new Error("Too many requests. Please wait and try again.");
//       }
//       if (axios.isCancel(error)) {
//         throw new Error("Request cancelled");
//       }
//       if (error.code === "ECONNABORTED") {
//         throw new Error(
//           "Request timeout. Bunny.net may be experiencing delays.",
//         );
//       }

//       throw error;
//     }
//   };

//   const uploadToBackend = async (
//     videoId: string,
//     bunnyGuid: string,
//     f: File,
//   ) => {
//     setStatus("Wysyłanie pliku...");
//     const controller = new AbortController();
//     setAbortController(controller);

//     const fd = new FormData();
//     fd.append("file", f);

//     try {
//       const response = await axios.post(
//         `http://localhost:3000/api/stream/upload/${bunnyGuid}`,
//         fd,
//         {
//           timeout: 600000,
//           signal: controller.signal,
//           headers: { "Content-Type": "multipart/form-data" },
//         },
//       );

//       setAbortController(null);
//       return response.data;
//     } catch (error) {
//       setAbortController(null);
//       if (axios.isCancel(error)) {
//         throw new Error("Upload cancelled by user");
//       }
//       throw error;
//     }
//   };

//   const extractVideoData = (created: any) => {
//     if (!created) return { videoId: null, bunnyGuid: null };

//     return {
//       videoId: created.video?._id || created.videoId || created.id,
//       bunnyGuid: created.video?.bunnyGuid || created.guid || created.bunnyGuid,
//     };
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!file) return setStatus("Wybierz plik wideo");

//     setUploading(true);
//     setUploadCancelled(false);
//     setStatus("Rozpoczynanie uploadu...");

//     try {
//       // Ustaw tytuł z nazwy pliku (bez rozszerzenia)
//       const title = file.name.replace(/\.[^/.]+$/, "");
//       setVideoTitle(title);

//       // 1. Stwórz video w systemie
//       const created = await createVideo(title);
//       const { videoId, bunnyGuid } = extractVideoData(created);

//       if (!videoId || !bunnyGuid) {
//         throw new Error("No videoId or bunnyGuid returned from create-video");
//       }

//       setCreatedVideoId(videoId);
//       setCreatedBunnyGuid(bunnyGuid);
//       startStatusPolling(videoId);

//       // 2. Wyślij plik
//       await uploadWithRetry(videoId, bunnyGuid, file, 2);

//       if (!uploadCancelled) {
//         setStatus("📤 Plik wysłany - trwa przetwarzanie przez Bunny...");
//       }
//     } catch (err: any) {
//       if (!uploadCancelled) {
//         console.error("Upload error:", err);
//         setStatus("❌ Błąd: " + err.message);
//       }
//       stopPolling();
//     } finally {
//       setUploading(false);
//     }
//   };

//   const uploadWithRetry = async (
//     videoId: string,
//     bunnyGuid: string,
//     f: File,
//     maxRetries = 2,
//   ) => {
//     let lastError;

//     for (let i = 0; i <= maxRetries; i++) {
//       try {
//         return await uploadToBackend(videoId, bunnyGuid, f);
//       } catch (error) {
//         lastError = error;

//         if (axios.isCancel(error)) {
//           throw error; // Nie ponawiaj jeśli użytkownik przerwał
//         }

//         if (
//           i < maxRetries &&
//           (error.code === "ECONNABORTED" ||
//             error.message.includes("network") ||
//             error.message.includes("timeout"))
//         ) {
//           const delay = 1000 * Math.pow(2, i);
//           setStatus(
//             `Upload failed, retrying in ${delay / 1000}s... (${
//               i + 1
//             }/${maxRetries})`,
//           );
//           await new Promise((resolve) => setTimeout(resolve, delay));
//           continue;
//         }

//         break;
//       }
//     }

//     throw lastError;
//   };

//   // Progress bar komponent
//   const ProgressBar = ({ progress }: { progress: number }) => (
//     <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
//       <div
//         className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
//         style={{ width: `${Math.min(progress, 100)}%` }}
//       ></div>
//     </div>
//   );

//   // Wyświetlanie miniaturki
//   const Thumbnail = ({
//     url,
//     bunnyGuid,
//   }: {
//     url?: string;
//     bunnyGuid: string;
//   }) => {
//     const [imgError, setImgError] = useState(false);

//     if (imgError || !url) {
//       return (
//         <div className="w-32 h-20 bg-gray-200 rounded border flex items-center justify-center">
//           <span className="text-xs text-gray-500">No thumbnail</span>
//         </div>
//       );
//     }

//     return (
//       <img
//         src={url}
//         alt="Thumbnail"
//         className="w-32 h-20 object-cover rounded border"
//         onError={() => setImgError(true)}
//       />
//     );
//   };

//   // Oblicz wyświetlany status
//   const getDisplayStatus = () => {
//     if (!videoStatus) return "checking";

//     if (
//       videoStatus.status === "processing" &&
//       videoStatus.processingProgress >= 100
//     ) {
//       return "ready";
//     }

//     return videoStatus.status;
//   };

//   const displayStatus = getDisplayStatus();

//   return (
//     <div className="border p-4 rounded bg-gray-50 max-w-md">
//       <h4 className="font-semibold mb-3 text-lg">Upload Wideo</h4>

//       {/* Stan 1: Upload został przerwany */}
//       {uploadCancelled && (
//         <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 mb-4">
//           <div className="flex items-center space-x-2">
//             <span className="text-xl">⏹️</span>
//             <div>
//               <p className="font-medium text-yellow-700">Upload przerwany</p>
//               <p className="text-sm text-yellow-600">
//                 Możesz spróbować ponownie.
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={() => {
//               setUploadCancelled(false);
//               setStatus("Wybierz plik wideo");
//             }}
//             className="mt-3 px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
//           >
//             Spróbuj ponownie
//           </button>
//         </div>
//       )}

//       {/* Stan 2: Formularz uploadu (kiedy nie ma videoId) */}
//       {!createdVideoId && !uploadCancelled && (
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
//               <input
//                 type="file"
//                 id="video-upload"
//                 accept="video/*"
//                 onChange={(e) => {
//                   const file = e.target.files?.[0];
//                   if (file) {
//                     setFile(file);
//                     setStatus(
//                       `Wybrano: ${file.name} (${Math.round(
//                         file.size / 1024 / 1024,
//                       )}MB)`,
//                     );
//                     // Ustaw tytuł z nazwy pliku
//                     setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
//                   }
//                 }}
//                 className="hidden"
//                 disabled={uploading}
//               />
//               <label htmlFor="video-upload" className="cursor-pointer block">
//                 <div className="text-4xl mb-2">📁</div>
//                 <p className="text-gray-600">
//                   {file ? file.name : "Kliknij aby wybrać plik wideo"}
//                 </p>
//                 <p className="text-sm text-gray-500 mt-1">
//                   MP4, MOV, AVI, MKV (max 2GB)
//                 </p>
//               </label>
//             </div>

//             {file && (
//               <div className="mt-2 text-sm text-gray-600">
//                 <p>Rozmiar: {Math.round(file.size / 1024 / 1024)}MB</p>
//                 <p>Typ: {file.type || "Nieznany"}</p>
//                 <p className="font-medium mt-1">
//                   Tytuł: {videoTitle || file.name.replace(/\.[^/.]+$/, "")}
//                 </p>
//               </div>
//             )}
//           </div>

//           <button
//             type="submit"
//             disabled={!file || uploading}
//             className={`px-4 py-3 rounded-lg w-full font-medium ${
//               !file || uploading
//                 ? "bg-gray-300 cursor-not-allowed text-gray-500"
//                 : "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
//             } transition-all duration-200`}
//           >
//             {uploading ? (
//               <span className="flex items-center justify-center">
//                 <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
//                 Wysyłanie...
//               </span>
//             ) : (
//               "Wyślij Wideo"
//             )}
//           </button>
//         </form>
//       )}

//       {/* Stan 3: Ładowanie (videoId istnieje, ale brak statusu) */}
//       {createdVideoId && !videoStatus && !uploadCancelled && (
//         <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
//           <div className="flex items-center space-x-3">
//             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//             <div>
//               <p className="font-medium text-blue-700">
//                 Inicjalizacja wideo...
//               </p>
//               <p className="text-sm text-blue-600">
//                 {videoTitle ? `"${videoTitle}"` : "Tworzenie obiektu wideo"}
//               </p>
//               <p className="text-xs text-gray-500 mt-1">Proszę czekać...</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Stan 4: Pełne informacje o wideo */}
//       {createdVideoId && videoStatus && !uploadCancelled && (
//         <div className="space-y-4">
//           {/* Karta z informacjami o wideo */}
//           <div className="bg-white p-4 rounded-lg border shadow-sm">
//             <h5 className="font-medium text-gray-800 mb-2">
//               Informacje o wideo
//             </h5>
//             <div className="space-y-2">
//               <p className="text-sm">
//                 <span className="font-medium">Tytuł:</span>{" "}
//                 <span className="text-blue-600">
//                   {videoStatus.title || videoTitle || "Bez tytułu"}
//                 </span>
//               </p>
//               {file && (
//                 <p className="text-sm">
//                   <span className="font-medium">Plik:</span> {file.name}
//                 </p>
//               )}
//               {videoStatus.createdAt && (
//                 <p className="text-xs text-gray-500">
//                   Utworzono: {new Date(videoStatus.createdAt).toLocaleString()}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Karta ze statusem */}
//           <div
//             className={`p-4 rounded-lg ${
//               displayStatus === "ready"
//                 ? "bg-green-50 border border-green-200"
//                 : displayStatus === "error"
//                   ? "bg-red-50 border border-red-200"
//                   : displayStatus === "processing"
//                     ? "bg-blue-50 border border-blue-200"
//                     : "bg-yellow-50 border border-yellow-200"
//             }`}
//           >
//             <div className="flex justify-between items-center mb-3">
//               <div className="flex items-center space-x-2">
//                 <span className="font-medium">
//                   {displayStatus === "uploading"
//                     ? "📤 Wysyłanie"
//                     : displayStatus === "processing"
//                       ? "🔄 Przetwarzanie"
//                       : displayStatus === "ready"
//                         ? "✅ Gotowe"
//                         : "❌ Błąd"}
//                 </span>
//                 {(displayStatus === "uploading" ||
//                   displayStatus === "processing") && (
//                   <span className="text-sm font-bold bg-white px-2 py-1 rounded">
//                     {videoStatus.processingProgress}%
//                   </span>
//                 )}
//               </div>

//               {(displayStatus === "uploading" ||
//                 displayStatus === "processing") && (
//                 <div className="text-xs text-gray-500 animate-pulse">Live</div>
//               )}
//             </div>

//             {(displayStatus === "uploading" ||
//               displayStatus === "processing") && (
//               <ProgressBar progress={videoStatus.processingProgress} />
//             )}

//             {displayStatus === "ready" && (
//               <div className="mt-3">
//                 <div className="flex items-start space-x-4">
//                   {videoStatus.thumbnailUrl && (
//                     <Thumbnail
//                       url={videoStatus.thumbnailUrl}
//                       bunnyGuid={videoStatus.bunnyGuid}
//                     />
//                   )}
//                   <div className="flex-1">
//                     <p className="text-sm text-green-600 font-medium">
//                       ✅ Video gotowe do odtwarzania
//                     </p>
//                     {videoStatus.duration && (
//                       <p className="text-sm text-gray-600">
//                         Czas trwania: {Math.round(videoStatus.duration)} sekund
//                       </p>
//                     )}
//                     {file && (
//                       <p className="text-xs text-gray-500 mt-1">
//                         Rozmiar: {Math.round(file.size / 1024 / 1024)}MB
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {videoStatus.errorMessage && (
//               <p className="text-sm text-red-600 mt-2 p-2 bg-red-100 rounded">
//                 {videoStatus.errorMessage}
//               </p>
//             )}

//             <div className="text-xs text-gray-500 mt-3 space-y-1">
//               <p>
//                 <span className="font-medium">Postęp:</span>{" "}
//                 {videoStatus.processingProgress}%
//               </p>
//               <p>
//                 <span className="font-medium">Status:</span> {displayStatus}
//               </p>
//               {videoStatus.updatedAt && (
//                 <p>
//                   <span className="font-medium">Ostatnia aktualizacja:</span>{" "}
//                   {new Date(videoStatus.updatedAt).toLocaleTimeString()}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Przyciski akcji */}
//           <div className="flex space-x-2 pt-2">
//             {displayStatus === "ready" && onUploaded && (
//               <button
//                 onClick={() => {
//                   if (onUploaded && videoStatus.bunnyGuid && videoStatus._id) {
//                     onUploaded(videoStatus._id, videoStatus.bunnyGuid);
//                   }
//                 }}
//                 className="px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
//               >
//                 Zapisz video
//               </button>
//             )}
//             <button
//               onClick={() => {
//                 setCreatedVideoId(null);
//                 setCreatedBunnyGuid(null);
//                 setVideoStatus(null);
//                 setFile(null);
//                 setVideoTitle("");
//                 setStatus("Wybierz plik wideo");
//                 stopPolling();
//               }}
//               className="px-3 py-2 text-sm border rounded hover:bg-gray-100"
//             >
//               {displayStatus === "ready" ? "Zamknij" : "Anuluj"}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Przycisk przerwania uploadu (pokazuje się tylko podczas uploadu) */}
//       {uploading && !uploadCancelled && (
//         <div className="mt-4 pt-4 border-t">
//           <button
//             onClick={handleCancelUpload}
//             className="px-4 py-2 text-sm w-full border border-red-300 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center space-x-2"
//           >
//             <span>⏹️</span>
//             <span>Przerwij upload</span>
//           </button>
//           <p className="text-xs text-gray-500 text-center mt-1">
//             Upload w toku...
//           </p>
//         </div>
//       )}

//       {/* Status message (na dole) */}
//       <div className="mt-3">
//         <div
//           className={`text-sm p-3 rounded-lg ${
//             status.includes("✅")
//               ? "bg-green-100 text-green-700 border border-green-200"
//               : status.includes("❌")
//                 ? "bg-red-100 text-red-700 border border-red-200"
//                 : status.includes("⏹️")
//                   ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
//                   : status.includes("🔄") || status.includes("📤")
//                     ? "bg-blue-100 text-blue-700 border border-blue-200"
//                     : "bg-gray-100 text-gray-700 border border-gray-200"
//           }`}
//         >
//           <div className="flex items-center">
//             {status.includes("🔄") && (
//               <span className="animate-spin mr-2">⟳</span>
//             )}
//             <span>{status}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
