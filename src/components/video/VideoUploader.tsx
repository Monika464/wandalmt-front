// components/video/VideoUploader.tsx
import axios, { AxiosError } from "axios";
import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

// Helper for checking error type
const isAxiosError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error);
};

export default function VideoUploader({ onUploaded, existingVideoId }: Props) {
  const { t } = useTranslation();

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>(t("videoUploader.selectVideo"));
  const [uploading, setUploading] = useState(false);
  const [createdVideoId, setCreatedVideoId] = useState<string | null>(
    existingVideoId || null,
  );

  const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [uploadCancelled, setUploadCancelled] = useState(false);
  const [videoTitle, setVideoTitle] = useState<string>("");

  const pollingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const errorCountRef = useRef(0);

  const handleCancelUpload = () => {
    if (abortController) {
      abortController.abort();
      setUploadCancelled(true);
      setStatus(t("videoUploader.uploadInterrupted"));
      stopPolling();
      setUploading(false);
    }
  };

  const checkStatus = async (videoId: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/stream/direct-status/${videoId}`,
        { timeout: 10000 },
      );

      if (response.data.success && response.data.video) {
        const newStatus = response.data.video;

        setVideoStatus(newStatus);

        const shouldStop =
          newStatus.status === "ready" ||
          newStatus.status === "error" ||
          (newStatus.status === "processing" &&
            newStatus.processingProgress >= 100);

        // Set display status
        const displayStatus =
          shouldStop && newStatus.processingProgress >= 100
            ? "ready"
            : newStatus.status;

        // Update status in UI
        switch (displayStatus) {
          case "uploading":
            setStatus(
              t("videoUploader.uploading", {
                progress: newStatus.processingProgress,
              }),
            );
            break;
          case "processing":
            setStatus(
              t("videoUploader.processing", {
                progress: newStatus.processingProgress,
              }),
            );
            break;
          case "ready":
            setStatus(t("videoUploader.videoReady"));
            stopPolling();
            if (onUploaded && newStatus.bunnyGuid && newStatus._id) {
              onUploaded(newStatus._id, newStatus.bunnyGuid);
            }
            break;
          case "error":
            setStatus(
              t("videoUploader.error", {
                message:
                  newStatus.errorMessage || t("videoUploader.unknownError"),
              }),
            );
            if (shouldStop) stopPolling();
            break;
        }
      }
    } catch (error) {
      console.error("Error checking status:", error);
      // On error - stop polling after 3 errors
      if (errorCountRef.current >= 3) {
        stopPolling();
        setStatus(t("videoUploader.connectionError"));
      }
      errorCountRef.current++;
    }
  };

  // Start status polling
  const startStatusPolling = (videoId: string) => {
    stopPolling();
    errorCountRef.current = 0; // reset error counter

    let attempts = 0;
    const MAX_ATTEMPTS = 120;

    const pollWithLimit = async () => {
      attempts++;
      if (attempts > MAX_ATTEMPTS) {
        console.log("⏱️ Attempt limit reached - stopping polling");
        stopPolling();
        setStatus(t("videoUploader.processingTimeout"));
        return;
      }
      await checkStatus(videoId);
    };

    // Run first check
    pollWithLimit();

    // Set interval
    pollingIntervalRef.current = setInterval(pollWithLimit, 3000);
  };

  // Stop polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    errorCountRef.current = 0; // reset error counter
  };

  const createVideo = async (title?: string) => {
    setStatus(t("videoUploader.creatingVideo"));
    const videoTitle = title || file?.name || "untitled";

    // Get token
    const token = localStorage.getItem("token");
    // if (token) {
    //   try {
    //     const payload = JSON.parse(atob(token.split(".")[1]));
    //     const exp = payload.exp * 1000;
    //     console.log("Token expires:", new Date(exp));
    //     console.log("Token expired:", Date.now() > exp);
    //   } catch (e) {
    //     console.error("Invalid token format:", e);
    //   }
    // }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/stream/create-video`,
        {
          title: videoTitle,
          description: t("videoUploader.uploadDescription", {
            date: new Date().toLocaleString(),
          }),
          fileName: file?.name,
        },
        {
          timeout: 300000,
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      //console.log("Create video response:", response.data);

      if (response.data?.video) {
        response.data.video.title = response.data.video.title || videoTitle;
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Create video error:", {
          status: error.response?.status,
          data: error.response?.data,
        });

        if (error.response?.status === 429) {
          throw new Error(t("videoUploader.tooManyRequests"));
        }
        if (error.code === "ECONNABORTED") {
          throw new Error(t("videoUploader.requestTimeout"));
        }

        const serverMessage = error.response?.data?.message || error.message;
        throw new Error(`Failed to create video: ${serverMessage}`);
      }

      if (axios.isCancel(error)) {
        throw new Error(t("videoUploader.requestCancelled"));
      }

      throw error;
    }
  };

  const uploadToBackend = async (
    _videoId: string,
    bunnyGuid: string,
    f: File,
  ) => {
    // Validate bunnyGuid format (should be UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(bunnyGuid)) {
      console.error("Invalid bunnyGuid format:", bunnyGuid);
      throw new Error(`Invalid bunnyGuid format: ${bunnyGuid}`);
    }

    setStatus(t("videoUploader.sendingFile"));
    const controller = new AbortController();
    setAbortController(controller);

    const fd = new FormData();
    fd.append("file", f);

    // Get token from localStorage
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/stream/upload/${bunnyGuid}`,
        fd,
        {
          timeout: 600000,
          signal: controller.signal,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : "",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              setStatus(t("videoUploader.uploadingPercent", { percent }));
            }
          },
        },
      );

      setAbortController(null);
      return response.data;
    } catch (error) {
      setAbortController(null);

      if (axios.isAxiosError(error)) {
        // Log full error details
        console.error("Upload error - Full details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });

        // Try to parse the error response
        let errorMessage = error.message;
        if (error.response?.data) {
          if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }

        throw new Error(`${t("videoUploader.uploadFailed")}: ${errorMessage}`);
      }

      if (axios.isCancel(error)) {
        throw new Error(t("videoUploader.uploadCancelled"));
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

        // Improved error handling with type guard
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
              t("videoUploader.uploadRetry", {
                delay: delay / 1000,
                attempt: i + 1,
                maxRetries,
              }),
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
    if (!file) return setStatus(t("videoUploader.selectVideo"));

    setUploading(true);
    setUploadCancelled(false);
    setStatus(t("videoUploader.startingUpload"));

    try {
      // Set title from filename (without extension)
      const title = file.name.replace(/\.[^/.]+$/, "");
      setVideoTitle(title);

      // 1. Create video in system
      const created = await createVideo(title);
      const { videoId, bunnyGuid } = extractVideoData(created);

      if (!videoId || !bunnyGuid) {
        throw new Error(t("videoUploader.missingVideoData"));
      }

      setCreatedVideoId(videoId);
      startStatusPolling(videoId);
      errorCountRef.current = 0;
      // 2. Send file
      await uploadWithRetry(videoId, bunnyGuid, file, 2);

      if (!uploadCancelled) {
        setStatus(t("videoUploader.fileSentProcessing"));
      }
    } catch (err: unknown) {
      if (!uploadCancelled) {
        // Improved error handling
        if (err instanceof Error) {
          console.error("Upload error:", err.message);
          setStatus(t("videoUploader.errorPrefix") + err.message);
        } else if (typeof err === "string") {
          console.error("Upload error:", err);
          setStatus(t("videoUploader.errorPrefix") + err);
        } else {
          console.error("Upload error:", err);
          setStatus(t("videoUploader.unknownError"));
        }
      }
      stopPolling();
    } finally {
      setUploading(false);
    }
  };

  // Progress bar component
  const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
      <div
        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(progress, 100)}%` }}
      ></div>
    </div>
  );

  // Thumbnail display
  const Thumbnail = ({ url }: { url?: string }) => {
    const [imgError, setImgError] = useState(false);

    if (imgError || !url) {
      return (
        <div className="w-32 h-20 bg-gray-200 rounded border flex items-center justify-center">
          <span className="text-xs text-gray-500">
            {t("videoUploader.noThumbnail")}
          </span>
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

  // Calculate display status
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
      <h4 className="font-semibold mb-3 text-lg">{t("videoUploader.title")}</h4>

      {/* State 1: Upload cancelled */}
      {uploadCancelled && (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⏹️</span>
            <div>
              <p className="font-medium text-yellow-700">
                {t("videoUploader.uploadCancelledTitle")}
              </p>
              <p className="text-sm text-yellow-600">
                {t("videoUploader.uploadCancelledMessage")}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setUploadCancelled(false);
              setStatus(t("videoUploader.selectVideo"));
            }}
            className="mt-3 px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            {t("videoUploader.tryAgain")}
          </button>
        </div>
      )}

      {/* State 2: Upload form (when no videoId) */}
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
                      t("videoUploader.fileSelected", {
                        name: file.name,
                        size: Math.round(file.size / 1024 / 1024),
                      }),
                    );
                    // Set title from filename
                    setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
                  }
                }}
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="video-upload" className="cursor-pointer block">
                <div className="text-4xl mb-2">📁</div>
                <p className="text-gray-600">
                  {file ? file.name : t("videoUploader.clickToSelect")}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {t("videoUploader.videoFormats")}
                </p>
              </label>
            </div>

            {file && (
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  {t("videoUploader.fileSize")}:{" "}
                  {Math.round(file.size / 1024 / 1024)}MB
                </p>
                <p>
                  {t("videoUploader.fileType")}:{" "}
                  {file.type || t("videoUploader.unknown")}
                </p>
                <p className="font-medium mt-1">
                  {t("videoUploader.titleLabel")}:{" "}
                  {videoTitle || file.name.replace(/\.[^/.]+$/, "")}
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
                {t("videoUploader.uploadingButton")}
              </span>
            ) : (
              t("videoUploader.uploadVideo")
            )}
          </button>
        </form>
      )}

      {/* State 3: Loading (videoId exists but no status) */}
      {createdVideoId && !videoStatus && !uploadCancelled && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <p className="font-medium text-blue-700">
                {t("videoUploader.initializingVideo")}
              </p>
              <p className="text-sm text-blue-600">
                {videoTitle
                  ? `"${videoTitle}"`
                  : t("videoUploader.creatingVideoObject")}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t("videoUploader.pleaseWait")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* State 4: Full video information */}
      {createdVideoId && videoStatus && !uploadCancelled && (
        <div className="space-y-4">
          {/* Video information card */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h5 className="font-medium text-gray-800 mb-2">
              {t("videoUploader.videoInformation")}
            </h5>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">
                  {t("videoUploader.titleLabel")}:
                </span>{" "}
                <span className="text-blue-600">
                  {videoStatus.title ||
                    videoTitle ||
                    t("videoUploader.untitled")}
                </span>
              </p>
              {file && (
                <p className="text-sm">
                  <span className="font-medium">
                    {t("videoUploader.fileLabel")}:
                  </span>{" "}
                  {file.name}
                </p>
              )}
              {videoStatus.createdAt && (
                <p className="text-xs text-gray-500">
                  {t("videoUploader.createdAt")}:{" "}
                  {new Date(videoStatus.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/*  */}

          {/*  */}

          {/* Status card */}
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
                    ? t("videoUploader.uploadingStatus")
                    : displayStatus === "processing"
                      ? t("videoUploader.processingStatus")
                      : displayStatus === "ready"
                        ? t("videoUploader.readyStatus")
                        : t("videoUploader.errorStatus")}
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
                <div className="text-xs text-gray-500 animate-pulse">
                  {t("videoUploader.live")}
                </div>
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
                    <Thumbnail url={videoStatus.thumbnailUrl} />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-green-600 font-medium">
                      {t("videoUploader.videoReadyMessage")}
                    </p>
                    {videoStatus.duration && (
                      <p className="text-sm text-gray-600">
                        {t("videoUploader.duration")}:{" "}
                        {Math.round(videoStatus.duration)}{" "}
                        {t("videoUploader.seconds")}
                      </p>
                    )}
                    {file && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t("videoUploader.fileSizeLabel")}:{" "}
                        {Math.round(file.size / 1024 / 1024)}MB
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
                <span className="font-medium">
                  {t("videoUploader.progressLabel")}:
                </span>{" "}
                {videoStatus.processingProgress}%
              </p>
              <p>
                <span className="font-medium">
                  {t("videoUploader.statusLabel")}:
                </span>{" "}
                {displayStatus}
              </p>
              {videoStatus.updatedAt && (
                <p>
                  <span className="font-medium">
                    {t("videoUploader.lastUpdate")}:
                  </span>{" "}
                  {new Date(videoStatus.updatedAt).toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Debug info - remove in production */}
            {/* {import.meta.env.DEV && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-500 font-mono">
                    🔧 Debug Info
                  </summary>
                  <div className="mt-2 p-2 bg-gray-100 rounded font-mono space-y-1">
                    <p>
                      <strong>Video ID:</strong> {videoStatus._id}
                    </p>
                    <p>
                      <strong>Bunny GUID:</strong> {videoStatus.bunnyGuid}
                    </p>
                    <p>
                      <strong>Status:</strong> {videoStatus.status}
                    </p>
                    <p>
                      <strong>Progress:</strong>{" "}
                      {videoStatus.processingProgress}%
                    </p>
                    {videoStatus.errorMessage && (
                      <p>
                        <strong>Error:</strong> {videoStatus.errorMessage}
                      </p>
                    )}
                    <p>
                      <strong>Created:</strong> {videoStatus.createdAt}
                    </p>
                    <p>
                      <strong>Updated:</strong> {videoStatus.updatedAt}
                    </p>
                  </div>
                </details>
              </div>
            )} */}
            {/*  */}
          </div>

          {/* Action buttons */}
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
                {t("videoUploader.saveVideo")}
              </button>
            )}
            <button
              onClick={() => {
                setCreatedVideoId(null);
                setVideoStatus(null);
                setFile(null);
                setVideoTitle("");
                setStatus(t("videoUploader.selectVideo"));
                stopPolling();
              }}
              className="px-3 py-2 text-sm border rounded hover:bg-gray-100"
            >
              {displayStatus === "ready"
                ? t("videoUploader.close")
                : t("videoUploader.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Upload interrupt button (only shows during upload) */}
      {uploading && !uploadCancelled && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={handleCancelUpload}
            className="px-4 py-2 text-sm w-full border border-red-300 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center space-x-2"
          >
            <span>⏹️</span>
            <span>{t("videoUploader.cancelUpload")}</span>
          </button>
          <p className="text-xs text-gray-500 text-center mt-1">
            {t("videoUploader.uploadInProgress")}
          </p>
        </div>
      )}

      {/* Status message (bottom) */}
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
// import axios, { AxiosError } from "axios";
// import React, { useState, useRef } from "react";

// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

// // 🔥 Helper for checking error type
// const isAxiosError = (error: unknown): error is AxiosError => {
//   return axios.isAxiosError(error);
// };

// // 🔥 Helper for checking if error has response.data
// // const hasResponseData = (error: any): error is { response: { data: any } } => {
// //   return error?.response?.data !== undefined;
// // };

// export default function VideoUploader({ onUploaded, existingVideoId }: Props) {
//   const [file, setFile] = useState<File | null>(null);
//   const [status, setStatus] = useState<string>("Wybierz plik wideo");
//   const [uploading, setUploading] = useState(false);
//   const [createdVideoId, setCreatedVideoId] = useState<string | null>(
//     existingVideoId || null,
//   );

//   const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null);
//   const [abortController, setAbortController] =
//     useState<AbortController | null>(null);
//   const [uploadCancelled, setUploadCancelled] = useState(false);
//   const [videoTitle, setVideoTitle] = useState<string>("");

//   const pollingIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const errorCountRef = useRef(0);
//   const handleCancelUpload = () => {
//     if (abortController) {
//       abortController.abort();
//       setUploadCancelled(true);
//       setStatus("⏹️ Upload was interrupted by user");
//       stopPolling();
//       setUploading(false);
//     }
//   };

//   const checkStatus = async (videoId: string) => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/api/stream/direct-status/${videoId}`,
//         // `${API_BASE_URL}/vbp/stream/webhook/bunny/${videoId}`,
//         { timeout: 10000 },
//       );

//       if (response.data.success && response.data.video) {
//         const newStatus = response.data.video;

//         setVideoStatus(newStatus);

//         const shouldStop =
//           newStatus.status === "ready" ||
//           newStatus.status === "error" ||
//           (newStatus.status === "processing" &&
//             newStatus.processingProgress >= 100);

//         // Set display status
//         const displayStatus =
//           shouldStop && newStatus.processingProgress >= 100
//             ? "ready"
//             : newStatus.status;

//         // Update status in UI
//         switch (displayStatus) {
//           case "uploading":
//             setStatus(`📤 Sending: ${newStatus.processingProgress}%`);
//             break;
//           case "processing":
//             setStatus(`🔄 Processing: ${newStatus.processingProgress}%`);
//             break;
//           case "ready":
//             setStatus("✅ Video ready to play");
//             stopPolling();
//             if (onUploaded && newStatus.bunnyGuid && newStatus._id) {
//               onUploaded(newStatus._id, newStatus.bunnyGuid);
//             }
//             break;
//           case "error":
//             setStatus(`❌ Błąd: ${newStatus.errorMessage || "Unknown error"}`);
//             if (shouldStop) stopPolling();
//             break;
//         }
//       }
//     } catch (error) {
//       console.error("Error checking status:", error);
//       // 🔥On error - stop polling after 3 errors
//       if (errorCountRef.current >= 3) {
//         stopPolling();
//         setStatus("❌ Błąd połączenia – zatrzymano sprawdzanie");
//       }
//       errorCountRef.current++;
//     }
//   };

//   // Start status polling
//   const startStatusPolling = (videoId: string) => {
//     stopPolling();
//     errorCountRef.current = 0; // reset error counter

//     let attempts = 0;
//     const MAX_ATTEMPTS = 120;

//     const pollWithLimit = async () => {
//       attempts++;
//       if (attempts > MAX_ATTEMPTS) {
//         console.log("⏱️ Limit prób osiągnięty – zatrzymuję polling");
//         stopPolling();
//         setStatus("❌ Przekroczono czas oczekiwania na przetworzenie");
//         return;
//       }
//       await checkStatus(videoId);
//     };

//     // Uruchom pierwsze sprawdzenie
//     pollWithLimit();

//     // Ustaw interwał
//     pollingIntervalRef.current = setInterval(pollWithLimit, 3000);
//   };

//   // Zatrzymaj polling (POPRAWIONY – dodaj reset licznika)
//   const stopPolling = () => {
//     if (pollingIntervalRef.current) {
//       clearInterval(pollingIntervalRef.current);
//       pollingIntervalRef.current = null;
//     }
//     errorCountRef.current = 0; // reset licznika błędów
//   };

//   const createVideo = async (title?: string) => {
//     setStatus("Tworzenie obiektu wideo...");
//     const videoTitle = title || file?.name || "untitled";

//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/api/stream/create-video`,
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
//       // 🔥 Poprawiona obsługa błędów z type guard
//       if (isAxiosError(error)) {
//         console.error("Server error:", error.response?.data);

//         if (error.response?.status === 429) {
//           throw new Error("Too many requests. Please wait and try again.");
//         }
//         if (error.code === "ECONNABORTED") {
//           throw new Error(
//             "Request timeout. Bunny.net may be experiencing delays.",
//           );
//         }
//       }

//       if (axios.isCancel(error)) {
//         throw new Error("Request cancelled");
//       }

//       throw error;
//     }
//   };

//   const uploadToBackend = async (
//     _videoId: string,
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
//         `${API_BASE_URL}/api/stream/upload/${bunnyGuid}`,
//         fd,
//         {
//           timeout: 600000,
//           signal: controller.signal,
//           headers: { "Content-Type": "multipart/form-data" },
//           onUploadProgress: (progressEvent) => {
//             if (progressEvent.total) {
//               const percent = Math.round(
//                 (progressEvent.loaded * 100) / progressEvent.total,
//               );
//               setStatus(`📤 Wysyłanie: ${percent}%`);
//             }
//           },
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

//   const uploadWithRetry = async (
//     videoId: string,
//     bunnyGuid: string,
//     f: File,
//     maxRetries = 2,
//   ) => {
//     let lastError: unknown;

//     for (let i = 0; i <= maxRetries; i++) {
//       try {
//         return await uploadToBackend(videoId, bunnyGuid, f);
//       } catch (error) {
//         lastError = error;

//         if (axios.isCancel(error)) {
//           throw error;
//         }

//         // 🔥 Poprawiona obsługa błędów z type guard
//         if (i < maxRetries) {
//           let shouldRetry = false;

//           if (isAxiosError(error)) {
//             shouldRetry =
//               error.code === "ECONNABORTED" ||
//               error.message?.includes("network") ||
//               error.message?.includes("timeout");
//           } else if (error instanceof Error) {
//             shouldRetry =
//               error.message.includes("network") ||
//               error.message.includes("timeout");
//           }

//           if (shouldRetry) {
//             const delay = 1000 * Math.pow(2, i);
//             setStatus(
//               `Upload failed, retrying in ${delay / 1000}s... (${
//                 i + 1
//               }/${maxRetries})`,
//             );
//             await new Promise((resolve) => setTimeout(resolve, delay));
//             continue;
//           }
//         }

//         break;
//       }
//     }

//     throw lastError;
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
//       startStatusPolling(videoId);
//       errorCountRef.current = 0;
//       // 2. Wyślij plik
//       await uploadWithRetry(videoId, bunnyGuid, file, 2);

//       if (!uploadCancelled) {
//         setStatus("📤 Plik wysłany - trwa przetwarzanie przez Bunny...");
//       }
//     } catch (err: unknown) {
//       if (!uploadCancelled) {
//         // 🔥 Poprawiona obsługa błędów
//         if (err instanceof Error) {
//           console.error("Upload error:", err.message);
//           setStatus("❌ Błąd: " + err.message);
//         } else if (typeof err === "string") {
//           console.error("Upload error:", err);
//           setStatus("❌ Błąd: " + err);
//         } else {
//           console.error("Upload error:", err);
//           setStatus("❌ Błąd: Nieznany błąd");
//         }
//       }
//       stopPolling();
//     } finally {
//       setUploading(false);
//     }
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
//     //bunnyGuid,
//   }: {
//     url?: string;
//     //bunnyGuid: string;
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
//                       // bunnyGuid={videoStatus.bunnyGuid}
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

//       {/* Upload interrupt button (only shows during upload) */}
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
