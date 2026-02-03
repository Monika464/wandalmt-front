// components/products/ProductResources.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import type { IResource } from "../../types";
import { fetchResourceByProductId } from "../../store/slices/resourcePublicSlice";
import InlineVideoPlayer from "../video/InlineVideoPlayer";
import {
  Play,
  CheckCircle,
  Clock,
  Lock,
  ChevronRight,
  BarChart3,
  Award,
  BookOpen,
} from "lucide-react";

interface Chapter {
  _id: string;
  number: number;
  title: string;
  description?: string;
  bunnyVideoId?: string;
  videoId?: string;
  order?: number;
  duration?: number;
  thumbnail?: string;
  isLocked?: boolean;
}

interface VideoProgress {
  productId: string;
  chapterId: string;
  progress: number;
  timeWatched: number;
  lastWatched: string;
  completed: boolean;
}

const ProductResources: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  // Stany
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState<VideoProgress[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const resource: IResource | undefined = useSelector((state: RootState) =>
    productId
      ? state.resourcesPublic.resourcesByProductId[productId]
      : undefined,
  );

  // Ładowanie postępu
  const loadProgressFromStorage = useCallback(() => {
    if (!productId) return [];
    try {
      const saved = localStorage.getItem(`videoProgress_${productId}`);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Błąd ładowania postępu:", error);
      return [];
    }
  }, [productId]);

  // Zapis postępu do localStorage
  const saveProgressToStorage = useCallback(
    (progress: VideoProgress[]) => {
      if (!productId) return;
      try {
        localStorage.setItem(
          `videoProgress_${productId}`,
          JSON.stringify(progress),
        );
      } catch (error) {
        console.error("Błąd zapisywania postępu:", error);
      }
    },
    [productId],
  );

  // Aktualizacja postępu rozdziału
  const updateChapterProgress = useCallback(
    (
      chapterId: string,
      progress: number, // 0-1
      timeWatched: number, // sekundy
      completed: boolean = false,
    ) => {
      if (!productId) return;

      setVideoProgress((prev) => {
        const existingIndex = prev.findIndex((p) => p.chapterId === chapterId);
        const newProgress: VideoProgress = {
          productId,
          chapterId,
          progress: Math.min(progress, 1), // maks 100%
          timeWatched,
          lastWatched: new Date().toISOString(),
          completed,
        };

        let updated;
        if (existingIndex >= 0) {
          updated = [...prev];
          updated[existingIndex] = newProgress;
        } else {
          updated = [...prev, newProgress];
        }

        saveProgressToStorage(updated);
        return updated;
      });
    },
    [productId, saveProgressToStorage],
  );

  // Oznacz rozdział jako ukończony (ręcznie)
  const markChapterAsCompleted = useCallback(
    (chapterId: string) => {
      if (!productId || !chapterId) return;

      // Znajdź rozdział
      const chapter = chapters.find((ch) => ch._id === chapterId);
      if (!chapter) return;

      updateChapterProgress(
        chapterId,
        1, // 100% progress
        chapter.duration || 300, // domyślnie 5 minut
        true,
      );
    },
    [productId, chapters, updateChapterProgress],
  );

  // Obsługa ręcznego oznaczania jako ukończone
  const handleMarkAsCompleted = () => {
    if (!currentChapter) return;
    markChapterAsCompleted(currentChapter._id);
  };

  // Obliczanie ogólnego postępu
  const calculateOverallProgress = useCallback(() => {
    if (chapters.length === 0) return 0;
    const completedChapters = videoProgress.filter((p) => p.completed);
    return (completedChapters.length / chapters.length) * 100;
  }, [chapters, videoProgress]);

  // Efekt pobierania resource
  useEffect(() => {
    if (!productId) return;
    dispatch(fetchResourceByProductId(productId));
  }, [productId, dispatch]);

  // Efekt przetwarzania danych
  useEffect(() => {
    if (!resource || !productId) {
      setLoading(false);
      return;
    }

    const formattedChapters: Chapter[] =
      resource.chapters
        ?.map((chapter: any) => ({
          _id: chapter._id,
          number: chapter.number,
          title: chapter.title,
          description: chapter.description,
          bunnyVideoId: chapter.bunnyVideoId,
          videoId: chapter.videoId || chapter.bunnyVideoId,
          order: chapter.number,
          duration: chapter.duration || 0,
          thumbnail: chapter.thumbnail,
          isLocked: false,
        }))
        .sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

    setChapters(formattedChapters);

    const savedProgress = loadProgressFromStorage();
    setVideoProgress(savedProgress);

    // Ustaw pierwszy nieukończony rozdział lub pierwszy
    if (formattedChapters.length > 0) {
      const firstUncompleted = formattedChapters.find(
        (ch) =>
          !savedProgress.find((p) => p.chapterId === ch._id && p.completed),
      );
      setCurrentChapter(firstUncompleted || formattedChapters[0]);
    }

    setLoading(false);
  }, [resource, productId, loadProgressFromStorage]);

  // Aktualizuj ogólny postęp
  useEffect(() => {
    setOverallProgress(calculateOverallProgress());
  }, [chapters, videoProgress, calculateOverallProgress]);

  // Funkcje nawigacji
  const handleNextChapter = () => {
    if (!currentChapter || chapters.length === 0) return;

    const currentIndex = chapters.findIndex(
      (ch) => ch._id === currentChapter._id,
    );
    if (currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1];
      setCurrentChapter(nextChapter);
    }
  };

  const handlePrevChapter = () => {
    if (!currentChapter || chapters.length === 0) return;

    const currentIndex = chapters.findIndex(
      (ch) => ch._id === currentChapter._id,
    );
    if (currentIndex > 0) {
      const prevChapter = chapters[currentIndex - 1];
      setCurrentChapter(prevChapter);
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    if (chapter.isLocked) {
      alert("Complete previous chapters first!");
      return;
    }
    setCurrentChapter(chapter);
  };

  const getChapterProgress = (chapterId: string) => {
    return videoProgress.find((p) => p.chapterId === chapterId);
  };

  // Przycisk do ręcznego zapisania postępu (np. 50%)
  const handleSavePartialProgress = () => {
    if (!currentChapter) return;
    updateChapterProgress(
      currentChapter._id,
      0.5, // 50% progress
      (currentChapter.duration || 300) * 0.5, // połowa czasu
      false,
    );
  };

  // Reset postępu dla rozdziału
  const handleResetChapterProgress = (
    chapterId: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // Zapobiegaj kliknięciu rozdziału

    setVideoProgress((prev) => {
      const updated = prev.filter((p) => p.chapterId !== chapterId);
      saveProgressToStorage(updated);
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="bg-gray-200 rounded-xl pt-[56.25%]"></div>
            </div>
            <div className="lg:w-1/3">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Resource Not Found</h2>
        <p className="text-gray-600">
          The requested course material could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      {/* Nagłówek kursu */}
      <header className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
          {resource.title}
        </h1>
        {resource.content && (
          <p className="text-gray-600 text-lg">{resource.content}</p>
        )}

        {/* Statystyki kursu */}
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
            <BookOpen size={18} />
            <span>{chapters.length} chapters</span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
            <Clock size={18} />
            <span>{formatTotalDuration(chapters)} total</span>
          </div>
          <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg">
            <BarChart3 size={18} />
            <span>{overallProgress.toFixed(0)}% completed</span>
          </div>
        </div>
      </header>

      {/* Główny layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lewa kolumna - Video player i informacje */}
        <div className="lg:w-2/3">
          {/* Video Player */}
          <div className="mb-6">
            <InlineVideoPlayer
              videoGuid={currentChapter?.bunnyVideoId}
              title={currentChapter?.title}
              onNext={handleNextChapter}
              onPrev={handlePrevChapter}
              onEnded={handleMarkAsCompleted} // Oznacz jako ukończone po zakończeniu
              className="w-full"
            />
          </div>

          {/* Informacje o aktualnym rozdziale */}
          {currentChapter && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1.5 rounded-full">
                      Chapter {currentChapter.number}
                    </span>
                    {currentChapter.duration && (
                      <span className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} />
                        {formatDuration(currentChapter.duration)}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    {currentChapter.title}
                  </h2>
                  {currentChapter.description && (
                    <p className="text-gray-600">
                      {currentChapter.description}
                    </p>
                  )}
                </div>

                {/* Akcje dla rozdziału */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handlePrevChapter}
                    disabled={
                      chapters.findIndex(
                        (ch) => ch._id === currentChapter._id,
                      ) === 0
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSavePartialProgress}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      title="Save 50% progress"
                    >
                      Save Progress
                    </button>
                    <button
                      onClick={handleMarkAsCompleted}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      ✓ Mark as Completed
                    </button>
                  </div>

                  <button
                    onClick={handleNextChapter}
                    disabled={
                      chapters.findIndex(
                        (ch) => ch._id === currentChapter._id,
                      ) ===
                      chapters.length - 1
                    }
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next Chapter →
                  </button>
                </div>
              </div>

              {/* Postęp tego rozdziału */}
              {(() => {
                const progress = getChapterProgress(currentChapter._id);
                if (progress) {
                  return (
                    <div className="border-t pt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Your Progress</span>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-semibold">
                            {(progress.progress * 100).toFixed(0)}%
                          </span>
                          <button
                            onClick={() =>
                              handleResetChapterProgress(
                                currentChapter._id,
                                {} as React.MouseEvent,
                              )
                            }
                            className="text-xs text-red-500 hover:text-red-700"
                            title="Reset progress"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress.progress * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>
                          {progress.completed ? "Completed" : "In Progress"}
                        </span>
                        <span>
                          Last watched: {formatDate(progress.lastWatched)}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>

        {/* Prawa kolumna - Menu rozdziałów */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-lg sticky top-4">
            {/* Nagłówek menu */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-800">
                  Course Content
                </h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {overallProgress.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">completed</div>
                </div>
              </div>

              {/* Pasek ogólnego postępu */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                {chapters.length} chapters • {formatTotalDuration(chapters)}
              </div>
            </div>

            {/* Lista rozdziałów */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {chapters.map((chapter, index) => {
                const progress = getChapterProgress(chapter._id);
                const isCurrent = currentChapter?._id === chapter._id;
                const isCompleted = progress?.completed;

                return (
                  <div
                    key={chapter._id}
                    onClick={() => handleChapterClick(chapter)}
                    className={`p-4 border-b cursor-pointer transition-all duration-200 ${
                      isCurrent
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : "hover:bg-gray-50 border-l-4 border-l-transparent"
                    } ${chapter.isLocked ? "opacity-75" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Numer/status rozdziału */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                            isCompleted
                              ? "bg-green-100 border-green-300 text-green-600"
                              : isCurrent
                                ? "bg-blue-500 border-blue-500 text-white"
                                : "bg-gray-100 border-gray-200 text-gray-600"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle size={18} />
                          ) : chapter.isLocked ? (
                            <Lock size={18} />
                          ) : (
                            <span className="font-semibold">{index + 1}</span>
                          )}
                        </div>

                        {/* Linia łącząca (opcjonalnie) */}
                        {index < chapters.length - 1 && (
                          <div className="absolute left-1/2 top-full h-4 w-0.5 bg-gray-200 -translate-x-1/2"></div>
                        )}
                      </div>

                      {/* Treść rozdziału */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4
                            className={`font-medium truncate ${
                              isCompleted
                                ? "text-green-700"
                                : isCurrent
                                  ? "text-blue-700"
                                  : "text-gray-800"
                            }`}
                          >
                            {chapter.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {chapter.duration && (
                              <span className="text-sm text-gray-500 whitespace-nowrap">
                                {formatDuration(chapter.duration)}
                              </span>
                            )}
                            {progress && (
                              <button
                                onClick={(e) =>
                                  handleResetChapterProgress(chapter._id, e)
                                }
                                className="text-xs text-red-400 hover:text-red-600 px-1"
                                title="Reset progress"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>

                        {chapter.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {chapter.description}
                          </p>
                        )}

                        {/* Indikator postępu dla rozdziału */}
                        {progress && !isCompleted && progress.progress > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-400 h-1.5 rounded-full"
                                style={{ width: `${progress.progress * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {Math.round(progress.progress * 100)}%
                            </span>
                          </div>
                        )}

                        {/* Status */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-500">
                            {isCompleted ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle size={12} />
                                Completed
                              </span>
                            ) : progress ? (
                              <span className="text-blue-500">In Progress</span>
                            ) : (
                              <span className="text-gray-400">Not Started</span>
                            )}
                          </div>

                          {isCurrent && (
                            <div className="text-blue-500 animate-pulse">
                              <ChevronRight size={16} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Statystyki footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {videoProgress.filter((p) => p.completed).length}
                  </div>
                  <div className="text-gray-600">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatTotalDurationHours(chapters)}
                  </div>
                  <div className="text-gray-600">Total Duration</div>
                </div>
              </div>

              {/* Przycisk resetu całego kursu */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    if (window.confirm("Reset all progress for this course?")) {
                      setVideoProgress([]);
                      saveProgressToStorage([]);
                      if (chapters.length > 0) {
                        setCurrentChapter(chapters[0]);
                      }
                    }
                  }}
                  className="text-sm text-red-500 hover:text-red-700 px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
                >
                  Reset All Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatDuration = (seconds: number): string => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatTotalDuration = (chapters: Chapter[]): string => {
  const totalSeconds = chapters.reduce(
    (acc, ch) => acc + (ch.duration || 0),
    0,
  );
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const formatTotalDurationHours = (chapters: Chapter[]): string => {
  const totalSeconds = chapters.reduce(
    (acc, ch) => acc + (ch.duration || 0),
    0,
  );
  const hours = (totalSeconds / 3600).toFixed(1);
  return `${hours}h`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export default ProductResources;

// // components/products/ProductResources.tsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams } from "react-router-dom";
// import type { AppDispatch, RootState } from "../../store";
// import type { IResource } from "../../types";
// import { fetchResourceByProductId } from "../../store/slices/resourcePublicSlice";
// import InlineVideoPlayer from "../video/InlineVideoPlayer";
// import {
//   Play,
//   CheckCircle,
//   Clock,
//   Lock,
//   ChevronRight,
//   BarChart3,
//   Award,
//   BookOpen,
// } from "lucide-react";

// interface Chapter {
//   _id: string;
//   number: number;
//   title: string;
//   description?: string;
//   bunnyVideoId?: string;
//   videoId?: string;
//   order?: number;
//   duration?: number;
//   thumbnail?: string;
//   isLocked?: boolean;
// }

// interface VideoProgress {
//   productId: string;
//   chapterId: string;
//   progress: number;
//   timeWatched: number;
//   lastWatched: string;
//   completed: boolean;
// }

// const ProductResources: React.FC = () => {
//   const { productId } = useParams<{ productId: string }>();
//   const dispatch = useDispatch<AppDispatch>();

//   // Stany
//   const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
//   const [chapters, setChapters] = useState<Chapter[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [videoProgress, setVideoProgress] = useState<VideoProgress[]>([]);
//   const [overallProgress, setOverallProgress] = useState(0);

//   const resource: IResource | undefined = useSelector((state: RootState) =>
//     productId
//       ? state.resourcesPublic.resourcesByProductId[productId]
//       : undefined,
//   );

//   // Ładowanie postępu
//   const loadProgressFromStorage = useCallback(() => {
//     if (!productId) return [];
//     try {
//       const saved = localStorage.getItem(`videoProgress_${productId}`);
//       return saved ? JSON.parse(saved) : [];
//     } catch (error) {
//       console.error("Błąd ładowania postępu:", error);
//       return [];
//     }
//   }, [productId]);

//   // Obliczanie ogólnego postępu
//   const calculateOverallProgress = useCallback(() => {
//     if (chapters.length === 0) return 0;
//     const completedChapters = videoProgress.filter((p) => p.completed);
//     return (completedChapters.length / chapters.length) * 100;
//   }, [chapters, videoProgress]);

//   // Efekt pobierania resource
//   useEffect(() => {
//     if (!productId) return;
//     dispatch(fetchResourceByProductId(productId));
//   }, [productId, dispatch]);

//   // Efekt przetwarzania danych
//   useEffect(() => {
//     if (!resource || !productId) {
//       setLoading(false);
//       return;
//     }

//     const formattedChapters: Chapter[] =
//       resource.chapters
//         ?.map((chapter: any) => ({
//           _id: chapter._id,
//           number: chapter.number,
//           title: chapter.title,
//           description: chapter.description,
//           bunnyVideoId: chapter.bunnyVideoId,
//           videoId: chapter.videoId || chapter.bunnyVideoId,
//           order: chapter.number,
//           duration: chapter.duration || 0,
//           thumbnail: chapter.thumbnail,
//           isLocked: false,
//         }))
//         .sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

//     setChapters(formattedChapters);

//     const savedProgress = loadProgressFromStorage();
//     setVideoProgress(savedProgress);

//     // Ustaw pierwszy nieukończony rozdział lub pierwszy
//     if (formattedChapters.length > 0) {
//       const firstUncompleted = formattedChapters.find(
//         (ch) =>
//           !savedProgress.find((p) => p.chapterId === ch._id && p.completed),
//       );
//       setCurrentChapter(firstUncompleted || formattedChapters[0]);
//     }

//     setLoading(false);
//   }, [resource, productId, loadProgressFromStorage]);

//   // Aktualizuj ogólny postęp
//   useEffect(() => {
//     setOverallProgress(calculateOverallProgress());
//   }, [chapters, videoProgress, calculateOverallProgress]);

//   // Funkcje nawigacji
//   const handleNextChapter = () => {
//     if (!currentChapter || chapters.length === 0) return;

//     const currentIndex = chapters.findIndex(
//       (ch) => ch._id === currentChapter._id,
//     );
//     if (currentIndex < chapters.length - 1) {
//       const nextChapter = chapters[currentIndex + 1];
//       setCurrentChapter(nextChapter);
//     }
//   };

//   const handlePrevChapter = () => {
//     if (!currentChapter || chapters.length === 0) return;

//     const currentIndex = chapters.findIndex(
//       (ch) => ch._id === currentChapter._id,
//     );
//     if (currentIndex > 0) {
//       const prevChapter = chapters[currentIndex - 1];
//       setCurrentChapter(prevChapter);
//     }
//   };

//   const handleChapterClick = (chapter: Chapter) => {
//     if (chapter.isLocked) {
//       alert("Complete previous chapters first!");
//       return;
//     }
//     setCurrentChapter(chapter);
//   };

//   const getChapterProgress = (chapterId: string) => {
//     return videoProgress.find((p) => p.chapterId === chapterId);
//   };

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto p-8">
//         <div className="animate-pulse">
//           <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
//           <div className="flex flex-col lg:flex-row gap-8">
//             <div className="lg:w-2/3">
//               <div className="bg-gray-200 rounded-xl pt-[56.25%]"></div>
//             </div>
//             <div className="lg:w-1/3">
//               <div className="h-64 bg-gray-200 rounded-xl"></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!resource) {
//     return (
//       <div className="max-w-7xl mx-auto p-8 text-center">
//         <h2 className="text-2xl font-bold mb-4">Resource Not Found</h2>
//         <p className="text-gray-600">
//           The requested course material could not be found.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto p-4 lg:p-8">
//       {/* Nagłówek kursu */}
//       <header className="mb-8">
//         <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-3">
//           {resource.title}
//         </h1>
//         {resource.content && (
//           <p className="text-gray-600 text-lg">{resource.content}</p>
//         )}

//         {/* Statystyki kursu */}
//         <div className="flex flex-wrap items-center gap-4 mt-6">
//           <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
//             <BookOpen size={18} />
//             <span>{chapters.length} chapters</span>
//           </div>
//           <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
//             <Clock size={18} />
//             <span>{formatTotalDuration(chapters)} total</span>
//           </div>
//           <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg">
//             <BarChart3 size={18} />
//             <span>{overallProgress.toFixed(0)}% completed</span>
//           </div>
//         </div>
//       </header>

//       {/* Główny layout */}
//       <div className="flex flex-col lg:flex-row gap-8">
//         {/* Lewa kolumna - Video player i informacje */}
//         <div className="lg:w-2/3">
//           {/* Video Player */}
//           <div className="mb-6">
//             <InlineVideoPlayer
//               videoGuid={currentChapter?.bunnyVideoId}
//               title={currentChapter?.title}
//               onNext={handleNextChapter}
//               onPrev={handlePrevChapter}
//               className="w-full"
//             />
//           </div>

//           {/* Informacje o aktualnym rozdziale */}
//           {currentChapter && (
//             <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//               <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
//                 <div>
//                   <div className="flex items-center gap-3 mb-3">
//                     <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1.5 rounded-full">
//                       Chapter {currentChapter.number}
//                     </span>
//                     {currentChapter.duration && (
//                       <span className="flex items-center gap-2 text-gray-600">
//                         <Clock size={16} />
//                         {formatDuration(currentChapter.duration)}
//                       </span>
//                     )}
//                   </div>
//                   <h2 className="text-2xl font-bold text-gray-800 mb-3">
//                     {currentChapter.title}
//                   </h2>
//                   {currentChapter.description && (
//                     <p className="text-gray-600">
//                       {currentChapter.description}
//                     </p>
//                   )}
//                 </div>

//                 {/* Akcje dla rozdziału */}
//                 <div className="flex flex-col sm:flex-row gap-3">
//                   <button
//                     onClick={handlePrevChapter}
//                     disabled={
//                       chapters.findIndex(
//                         (ch) => ch._id === currentChapter._id,
//                       ) === 0
//                     }
//                     className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     ← Previous
//                   </button>
//                   <button
//                     onClick={handleNextChapter}
//                     disabled={
//                       chapters.findIndex(
//                         (ch) => ch._id === currentChapter._id,
//                       ) ===
//                       chapters.length - 1
//                     }
//                     className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     Next Chapter →
//                   </button>
//                 </div>
//               </div>

//               {/* Postęp tego rozdziału */}
//               {(() => {
//                 const progress = getChapterProgress(currentChapter._id);
//                 if (progress) {
//                   return (
//                     <div className="border-t pt-6">
//                       <div className="flex justify-between items-center mb-2">
//                         <span className="font-medium">Your Progress</span>
//                         <span className="text-blue-600 font-semibold">
//                           {(progress.progress * 100).toFixed(0)}%
//                         </span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div
//                           className="bg-blue-500 h-2 rounded-full transition-all duration-500"
//                           style={{ width: `${progress.progress * 100}%` }}
//                         ></div>
//                       </div>
//                       <div className="flex justify-between text-sm text-gray-500 mt-2">
//                         <span>
//                           {progress.completed ? "Completed" : "In Progress"}
//                         </span>
//                         <span>
//                           Last watched: {formatDate(progress.lastWatched)}
//                         </span>
//                       </div>
//                     </div>
//                   );
//                 }
//                 return null;
//               })()}
//             </div>
//           )}
//         </div>

//         {/* Prawa kolumna - Menu rozdziałów */}
//         <div className="lg:w-1/3">
//           <div className="bg-white rounded-xl shadow-lg sticky top-4">
//             {/* Nagłówek menu */}
//             <div className="p-6 border-b">
//               <div className="flex items-center justify-between mb-3">
//                 <h3 className="text-xl font-bold text-gray-800">
//                   Course Content
//                 </h3>
//                 <div className="text-right">
//                   <div className="text-2xl font-bold text-blue-600">
//                     {overallProgress.toFixed(0)}%
//                   </div>
//                   <div className="text-xs text-gray-500">completed</div>
//                 </div>
//               </div>

//               {/* Pasek ogólnego postępu */}
//               <div className="mb-4">
//                 <div className="w-full bg-gray-200 rounded-full h-2.5">
//                   <div
//                     className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
//                     style={{ width: `${overallProgress}%` }}
//                   ></div>
//                 </div>
//               </div>

//               <div className="text-sm text-gray-600">
//                 {chapters.length} chapters • {formatTotalDuration(chapters)}
//               </div>
//             </div>

//             {/* Lista rozdziałów */}
//             <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
//               {chapters.map((chapter, index) => {
//                 const progress = getChapterProgress(chapter._id);
//                 const isCurrent = currentChapter?._id === chapter._id;
//                 const isCompleted = progress?.completed;

//                 return (
//                   <div
//                     key={chapter._id}
//                     onClick={() => handleChapterClick(chapter)}
//                     className={`p-4 border-b cursor-pointer transition-all duration-200 ${
//                       isCurrent
//                         ? "bg-blue-50 border-l-4 border-l-blue-500"
//                         : "hover:bg-gray-50 border-l-4 border-l-transparent"
//                     } ${chapter.isLocked ? "opacity-75" : ""}`}
//                   >
//                     <div className="flex items-start gap-4">
//                       {/* Numer/status rozdziału */}
//                       <div className="relative flex-shrink-0">
//                         <div
//                           className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
//                             isCompleted
//                               ? "bg-green-100 border-green-300 text-green-600"
//                               : isCurrent
//                                 ? "bg-blue-500 border-blue-500 text-white"
//                                 : "bg-gray-100 border-gray-200 text-gray-600"
//                           }`}
//                         >
//                           {isCompleted ? (
//                             <CheckCircle size={18} />
//                           ) : chapter.isLocked ? (
//                             <Lock size={18} />
//                           ) : (
//                             <span className="font-semibold">{index + 1}</span>
//                           )}
//                         </div>

//                         {/* Linia łącząca (opcjonalnie) */}
//                         {index < chapters.length - 1 && (
//                           <div className="absolute left-1/2 top-full h-4 w-0.5 bg-gray-200 -translate-x-1/2"></div>
//                         )}
//                       </div>

//                       {/* Treść rozdziału */}
//                       <div className="flex-1 min-w-0">
//                         <div className="flex justify-between items-start mb-1">
//                           <h4
//                             className={`font-medium truncate ${
//                               isCompleted
//                                 ? "text-green-700"
//                                 : isCurrent
//                                   ? "text-blue-700"
//                                   : "text-gray-800"
//                             }`}
//                           >
//                             {chapter.title}
//                           </h4>
//                           {chapter.duration && (
//                             <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
//                               {formatDuration(chapter.duration)}
//                             </span>
//                           )}
//                         </div>

//                         {chapter.description && (
//                           <p className="text-sm text-gray-600 line-clamp-2 mb-2">
//                             {chapter.description}
//                           </p>
//                         )}

//                         {/* Indikator postępu dla rozdziału */}
//                         {progress && !isCompleted && progress.progress > 0 && (
//                           <div className="flex items-center gap-2">
//                             <div className="w-full bg-gray-200 rounded-full h-1.5">
//                               <div
//                                 className="bg-blue-400 h-1.5 rounded-full"
//                                 style={{ width: `${progress.progress * 100}%` }}
//                               ></div>
//                             </div>
//                             <span className="text-xs text-gray-500 whitespace-nowrap">
//                               {Math.round(progress.progress * 100)}%
//                             </span>
//                           </div>
//                         )}

//                         {/* Status */}
//                         <div className="flex items-center justify-between mt-2">
//                           <div className="text-xs text-gray-500">
//                             {isCompleted ? (
//                               <span className="flex items-center gap-1 text-green-600">
//                                 <CheckCircle size={12} />
//                                 Completed
//                               </span>
//                             ) : progress ? (
//                               <span className="text-blue-500">In Progress</span>
//                             ) : (
//                               <span className="text-gray-400">Not Started</span>
//                             )}
//                           </div>

//                           {isCurrent && (
//                             <div className="text-blue-500 animate-pulse">
//                               <ChevronRight size={16} />
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Statystyki footer */}
//             <div className="p-4 border-t bg-gray-50">
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-blue-600">
//                     {videoProgress.filter((p) => p.completed).length}
//                   </div>
//                   <div className="text-gray-600">Completed</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-green-600">
//                     {formatTotalDurationHours(chapters)}
//                   </div>
//                   <div className="text-gray-600">Total Duration</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Helper functions
// const formatDuration = (seconds: number): string => {
//   if (!seconds) return "0:00";
//   const mins = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${mins}:${secs.toString().padStart(2, "0")}`;
// };

// const formatTotalDuration = (chapters: Chapter[]): string => {
//   const totalSeconds = chapters.reduce(
//     (acc, ch) => acc + (ch.duration || 0),
//     0,
//   );
//   const hours = Math.floor(totalSeconds / 3600);
//   const minutes = Math.floor((totalSeconds % 3600) / 60);

//   if (hours > 0) {
//     return `${hours}h ${minutes}m`;
//   }
//   return `${minutes}m`;
// };

// const formatTotalDurationHours = (chapters: Chapter[]): string => {
//   const totalSeconds = chapters.reduce(
//     (acc, ch) => acc + (ch.duration || 0),
//     0,
//   );
//   const hours = (totalSeconds / 3600).toFixed(1);
//   return `${hours}h`;
// };

// const formatDate = (dateString: string): string => {
//   const date = new Date(dateString);
//   return date.toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//   });
// };

// export default ProductResources;
