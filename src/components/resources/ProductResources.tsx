// components/products/ProductResources.tsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store";
import type { IChapter, IResource } from "../../types/types";
import { fetchResourceByProductId } from "../../store/slices/resourcePublicSlice";
import { useChapterProgress } from "../../hooks/useChapterProgress";
import InlineVideoPlayer from "../video/InlineVideoPlayer";
import {
  CheckCircle,
  Clock,
  ChevronRight,
  BarChart3,
  BookOpen,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface Chapter extends IChapter {
  _id: string;
  order?: number;
  duration?: number;
  thumbnail?: string;
}

const ProductResources: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  // Stany
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  const resource: IResource | undefined = useSelector((state: RootState) =>
    productId
      ? state.resourcesPublic.resourcesByProductId[productId]
      : undefined,
  );

  const { user } = useSelector((state: RootState) => state.auth);

  const {
    isChapterCompleted,
    loadProgress,
    completeChapter,
    resetAllProgress,
    calculateOverallProgress,
    loading: progressLoading,
    error: progressError,
  } = useChapterProgress();

  // Załaduj postęp po zalogowaniu/zmianie produktu
  useEffect(() => {
    if (productId && user?._id) {
      loadProgress(productId);
    }
  }, [productId, user?._id, loadProgress]);

  // Obsługa błędów
  useEffect(() => {
    if (progressError) {
      toast.error(progressError);
    }
  }, [progressError]);

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
        }))
        .sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

    setChapters(formattedChapters);

    // Poczekaj na załadowanie postępu
    const waitForProgress = async () => {
      if (!user?._id) {
        // Dla niezalogowanych - po prostu pierwszy rozdział
        if (formattedChapters.length > 0) {
          setCurrentChapter(formattedChapters[0]);
        }
        setLoading(false);
        return;
      }

      // Daj czas na załadowanie postępu
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Znajdź pierwszy nieukończony rozdział
      if (formattedChapters.length > 0) {
        const firstUncompleted = formattedChapters.find(
          (ch) => !isChapterCompleted(productId, ch._id),
        );
        setCurrentChapter(firstUncompleted || formattedChapters[0]);
      }

      setLoading(false);
    };

    waitForProgress();
  }, [resource, productId, user?._id, isChapterCompleted]);

  // Funkcje obsługi
  const handleVideoEnded = () => {
    if (!currentChapter || !productId || !user?._id) return;

    completeChapter(productId, currentChapter._id);
    toast.success(
      t("resources.chapterCompleted", { title: currentChapter.title }),
    );
  };

  // Funkcje nawigacji
  const handleNextChapter = () => {
    if (!currentChapter || chapters.length === 0) return;

    const currentIndex = chapters.findIndex(
      (ch) => ch._id === currentChapter._id,
    );
    if (currentIndex < chapters.length - 1) {
      const nextChapter = chapters[currentIndex + 1];
      setCurrentChapter(nextChapter);

      // Automatycznie oznacz obecny rozdział jako ukończony
      if (
        user?._id &&
        !isChapterCompleted(productId || "", currentChapter._id)
      ) {
        completeChapter(productId || "", currentChapter._id);
      }
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
    setCurrentChapter(chapter);
  };

  // Oblicz ogólny postęp
  const overallProgress = calculateOverallProgress(
    productId || "",
    chapters.length,
  );

  if (loading || progressLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-600">{t("resources.loading")}</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">{t("resources.notFound")}</h2>
        <p className="text-gray-600">{t("resources.notFoundMessage")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      {/* Nagłówek kursu */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
            {resource.title}
          </h1>

          {!user?._id && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg">
              <p className="text-sm">
                <strong>{t("resources.note")}:</strong>{" "}
                {t("resources.progressNotSaved")}{" "}
                <a href="/login" className="underline font-semibold">
                  {t("common.login")}
                </a>{" "}
                {t("resources.toSaveProgress")}
              </p>
            </div>
          )}
        </div>

        {resource.content && (
          <p className="text-gray-600 text-lg">{resource.content}</p>
        )}

        {/* Statystyki kursu */}
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
            <BookOpen size={18} />
            <span>
              {t("resources.chaptersCount", { count: chapters.length })}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg">
            <Clock size={18} />
          </div>
          <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-lg">
            <BarChart3 size={18} />
            <span>
              {t("resources.progressPercent", {
                progress: overallProgress.toFixed(0),
              })}
            </span>
          </div>
        </div>
      </header>

      {/* Główny layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lewa kolumna - Video player i informacje */}
        <div className="lg:w-2/3">
          {/* Video Player */}
          <div className="mb-6">
            {currentChapter?.bunnyVideoId ? (
              <InlineVideoPlayer
                videoGuid={currentChapter.bunnyVideoId}
                title={currentChapter.title}
                onNext={handleNextChapter}
                onPrev={handlePrevChapter}
                onEnded={handleVideoEnded}
                className="w-full"
              />
            ) : (
              <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center">
                <p className="text-gray-500">
                  {t("resources.videoNotAvailable")}
                </p>
              </div>
            )}
          </div>

          {/* Informacje o aktualnym rozdziale */}
          {currentChapter && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1.5 rounded-full">
                      {t("resources.chapter")} {currentChapter.number}
                    </span>
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
                    ← {t("resources.previous")}
                  </button>

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
                    {t("resources.next")} →
                  </button>
                </div>
              </div>

              {/* Status rozdziału */}
              {user?._id &&
                isChapterCompleted(productId || "", currentChapter._id) && (
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {t("resources.status")}
                      </span>
                      <span className="flex items-center gap-2 text-green-600 font-semibold">
                        <CheckCircle size={16} />
                        {t("resources.completed")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {t("resources.chapterCompletedMessage")}
                    </p>
                  </div>
                )}
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
                  {t("resources.courseContent")}
                </h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {overallProgress.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {t("resources.completed")}
                  </div>
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
                {user?._id && (
                  <div className="mt-1 text-xs text-green-600">
                    ✓ {t("resources.progressSaved")}
                  </div>
                )}
              </div>
            </div>

            {/* Lista rozdziałów */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {chapters.map((chapter, index) => {
                const completed = user?._id
                  ? isChapterCompleted(productId || "", chapter._id)
                  : false;
                const isCurrent = currentChapter?._id === chapter._id;

                return (
                  <div
                    key={chapter._id}
                    onClick={() => handleChapterClick(chapter)}
                    className={`p-4 border-b cursor-pointer transition-all duration-200 ${
                      isCurrent
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : "hover:bg-gray-50 border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Numer/status rozdziału */}
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                            completed
                              ? "bg-green-100 border-green-300 text-green-600"
                              : isCurrent
                                ? "bg-blue-500 border-blue-500 text-white"
                                : "bg-gray-100 border-gray-200 text-gray-600"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle size={18} />
                          ) : (
                            <span className="font-semibold">{index + 1}</span>
                          )}
                        </div>

                        {/* Linia łącząca */}
                        {index < chapters.length - 1 && (
                          <div className="absolute left-1/2 top-full h-4 w-0.5 bg-gray-200 -translate-x-1/2"></div>
                        )}
                      </div>

                      {/* Treść rozdziału */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4
                            className={`font-medium truncate ${
                              completed
                                ? "text-green-700"
                                : isCurrent
                                  ? "text-blue-700"
                                  : "text-gray-800"
                            }`}
                          >
                            {chapter.title}
                          </h4>
                          {chapter.number && (
                            <span className="text-sm text-gray-500 whitespace-nowrap">
                              {chapter.number}
                            </span>
                          )}
                        </div>
                        {chapter.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {chapter.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-500">
                            {completed ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle size={12} />
                                {t("resources.completed")}
                              </span>
                            ) : (
                              <span className="text-gray-400">
                                {t("resources.notStarted")}
                              </span>
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
              {user?._id ? (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {
                          chapters.filter((ch) =>
                            isChapterCompleted(productId || "", ch._id),
                          ).length
                        }
                      </div>
                      <div className="text-gray-600">
                        {t("resources.completed")}
                      </div>
                    </div>
                    <div className="text-center"></div>
                  </div>

                  {/* Przycisk resetu całego kursu */}
                  <div className="text-center">
                    <button
                      onClick={() => {
                        if (window.confirm(t("resources.resetConfirm"))) {
                          resetAllProgress(productId || "");
                          toast.success(t("resources.resetSuccess"));
                        }
                      }}
                      className="text-sm text-red-500 hover:text-red-700 px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
                    >
                      {t("resources.resetAll")}
                    </button>
                  </div>

                  <div className="mt-2 text-xs text-gray-500 text-center">
                    {t("resources.progressSavedFor")}{" "}
                    <span className="font-medium">{user.email}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-gray-600 mb-2">
                    {t("resources.loginToSave")}
                  </p>
                  <a
                    href="/login"
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {t("common.signIn")}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductResources;

// // components/products/ProductResources.tsx
// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams } from "react-router-dom";
// import type { AppDispatch, RootState } from "../../store";
// import type { IChapter, IResource } from "../../types/types";
// import { fetchResourceByProductId } from "../../store/slices/resourcePublicSlice";
// import { useChapterProgress } from "../../hooks/useChapterProgress";
// import InlineVideoPlayer from "../video/InlineVideoPlayer";
// import {
//   CheckCircle,
//   Clock,
//   ChevronRight,
//   BarChart3,
//   BookOpen,
//   Loader2,
// } from "lucide-react";
// import { toast } from "react-hot-toast";

// interface Chapter extends IChapter {
//   _id: string;
//   order?: number;
//   duration?: number;
//   thumbnail?: string;
// }

// const ProductResources: React.FC = () => {
//   const { productId } = useParams<{ productId: string }>();
//   const dispatch = useDispatch<AppDispatch>();

//   // Stany
//   const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
//   const [chapters, setChapters] = useState<Chapter[]>([]);
//   const [loading, setLoading] = useState(true);

//   const resource: IResource | undefined = useSelector((state: RootState) =>
//     productId
//       ? state.resourcesPublic.resourcesByProductId[productId]
//       : undefined,
//   );

//   const { user } = useSelector((state: RootState) => state.auth);
//   //console.log("Current user in ProductResources:", user);
//   const {
//     isChapterCompleted,
//     loadProgress,
//     completeChapter,
//     resetAllProgress,
//     calculateOverallProgress,
//     loading: progressLoading,
//     error: progressError,
//   } = useChapterProgress();

//   // Załaduj postęp po zalogowaniu/zmianie produktu
//   useEffect(() => {
//     if (productId && user?._id) {
//       loadProgress(productId);
//     }
//   }, [productId, user?._id, loadProgress]);

//   // Obsługa błędów
//   useEffect(() => {
//     if (progressError) {
//       toast.error(progressError);
//     }
//   }, [progressError]);

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
//         }))
//         .sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

//     setChapters(formattedChapters);

//     // Poczekaj na załadowanie postępu
//     const waitForProgress = async () => {
//       if (!user?._id) {
//         // Dla niezalogowanych - po prostu pierwszy rozdział
//         if (formattedChapters.length > 0) {
//           setCurrentChapter(formattedChapters[0]);
//         }
//         setLoading(false);
//         return;
//       }

//       // Daj czas na załadowanie postępu
//       await new Promise((resolve) => setTimeout(resolve, 500));

//       // Znajdź pierwszy nieukończony rozdział
//       if (formattedChapters.length > 0) {
//         const firstUncompleted = formattedChapters.find(
//           (ch) => !isChapterCompleted(productId, ch._id),
//         );
//         setCurrentChapter(firstUncompleted || formattedChapters[0]);
//       }

//       setLoading(false);
//     };

//     waitForProgress();
//   }, [resource, productId, user?._id, isChapterCompleted]);

//   // Funkcje obsługi
//   const handleVideoEnded = () => {
//     if (!currentChapter || !productId || !user?._id) return;

//     completeChapter(productId, currentChapter._id);
//     toast.success(`Chapter "${currentChapter.title}" marked as completed!`);
//   };

//   // const handleToggleChapterCompletion = () => {
//   //   if (!currentChapter || !productId || !user?._id) return;

//   //   if (isChapterCompleted(productId, currentChapter._id)) {
//   //     uncompleteChapter(productId, currentChapter._id);
//   //     toast.success(`Chapter "${currentChapter.title}" marked as incomplete`);
//   //   } else {
//   //     completeChapter(productId, currentChapter._id);
//   //     toast.success(`Chapter "${currentChapter.title}" marked as completed!`);
//   //   }
//   // };

//   // Funkcje nawigacji
//   const handleNextChapter = () => {
//     if (!currentChapter || chapters.length === 0) return;

//     const currentIndex = chapters.findIndex(
//       (ch) => ch._id === currentChapter._id,
//     );
//     if (currentIndex < chapters.length - 1) {
//       const nextChapter = chapters[currentIndex + 1];
//       setCurrentChapter(nextChapter);

//       // Automatycznie oznacz obecny rozdział jako ukończony
//       if (
//         user?._id &&
//         !isChapterCompleted(productId || "", currentChapter._id)
//       ) {
//         completeChapter(productId || "", currentChapter._id);
//       }
//     }
//   };

//   //console.log("Current chapter:", currentChapter);

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
//     setCurrentChapter(chapter);
//   };

//   // Oblicz ogólny postęp
//   const overallProgress = calculateOverallProgress(
//     productId || "",
//     chapters.length,
//   );

//   if (loading || progressLoading) {
//     return (
//       <div className="max-w-7xl mx-auto p-8 flex items-center justify-center min-h-[400px]">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-500 mb-4" />
//           <p className="text-gray-600">Loading course content...</p>
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
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
//           <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">
//             {resource.title}
//           </h1>

//           {!user?._id && (
//             <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg">
//               <p className="text-sm">
//                 <strong>Note:</strong> Progress is not saved. Please{" "}
//                 <a href="/login" className="underline font-semibold">
//                   login
//                 </a>{" "}
//                 to save your progress.
//               </p>
//             </div>
//           )}
//         </div>

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
//             {/* <span>{formatTotalDuration(chapters)} total</span> */}
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
//             {currentChapter?.bunnyVideoId ? (
//               <InlineVideoPlayer
//                 videoGuid={currentChapter.bunnyVideoId}
//                 title={currentChapter.title}
//                 onNext={handleNextChapter}
//                 onPrev={handlePrevChapter}
//                 onEnded={handleVideoEnded}
//                 className="w-full"
//               />
//             ) : (
//               <div className="bg-gray-100 rounded-xl aspect-video flex items-center justify-center">
//                 <p className="text-gray-500">Video not available</p>
//               </div>
//             )}
//           </div>

//           {/* Informacje o aktualnym rozdziale */}
//           {currentChapter && (
//             <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//               <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-3">
//                     <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1.5 rounded-full">
//                       Chapter {currentChapter.number}
//                     </span>
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

//                   {/* {user?._id && (
//                     <button
//                       onClick={handleToggleChapterCompletion}
//                       className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
//                         isChapterCompleted(productId || "", currentChapter._id)
//                           ? "bg-gray-500 hover:bg-gray-600 text-white"
//                           : "bg-green-500 hover:bg-green-600 text-white"
//                       }`}
//                     >
//                       {isChapterCompleted(
//                         productId || "",
//                         currentChapter._id,
//                       ) ? (
//                         <>
//                           <CheckCircle size={16} />
//                           Mark as Incomplete
//                         </>
//                       ) : (
//                         <>
//                           <CheckCircle size={16} />
//                           Mark as Completed
//                         </>
//                       )}
//                     </button>
//                   )} */}

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

//               {/* Status rozdziału */}
//               {user?._id &&
//                 isChapterCompleted(productId || "", currentChapter._id) && (
//                   <div className="border-t pt-6">
//                     <div className="flex items-center justify-between">
//                       <span className="font-medium">Status</span>
//                       <span className="flex items-center gap-2 text-green-600 font-semibold">
//                         <CheckCircle size={16} />
//                         Completed
//                       </span>
//                     </div>
//                     <p className="text-sm text-gray-500 mt-1">
//                       This chapter has been marked as completed.
//                     </p>
//                   </div>
//                 )}
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
//                 {/* {chapters.length} chapters • {formatTotalDuration(chapters)} */}
//                 {user?._id && (
//                   <div className="mt-1 text-xs text-green-600">
//                     ✓ Progress saved to your account
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Lista rozdziałów */}
//             <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
//               {chapters.map((chapter, index) => {
//                 const completed = user?._id
//                   ? isChapterCompleted(productId || "", chapter._id)
//                   : false;
//                 const isCurrent = currentChapter?._id === chapter._id;

//                 return (
//                   <div
//                     key={chapter._id}
//                     onClick={() => handleChapterClick(chapter)}
//                     className={`p-4 border-b cursor-pointer transition-all duration-200 ${
//                       isCurrent
//                         ? "bg-blue-50 border-l-4 border-l-blue-500"
//                         : "hover:bg-gray-50 border-l-4 border-l-transparent"
//                     }`}
//                   >
//                     <div className="flex items-start gap-4">
//                       {/* Numer/status rozdziału */}
//                       <div className="relative flex-shrink-0">
//                         <div
//                           className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
//                             completed
//                               ? "bg-green-100 border-green-300 text-green-600"
//                               : isCurrent
//                                 ? "bg-blue-500 border-blue-500 text-white"
//                                 : "bg-gray-100 border-gray-200 text-gray-600"
//                           }`}
//                         >
//                           {completed ? (
//                             <CheckCircle size={18} />
//                           ) : (
//                             <span className="font-semibold">{index + 1}</span>
//                           )}
//                         </div>

//                         {/* Linia łącząca */}
//                         {index < chapters.length - 1 && (
//                           <div className="absolute left-1/2 top-full h-4 w-0.5 bg-gray-200 -translate-x-1/2"></div>
//                         )}
//                       </div>

//                       {/* Treść rozdziału */}
//                       <div className="flex-1 min-w-0">
//                         <div className="flex justify-between items-start mb-1">
//                           <h4
//                             className={`font-medium truncate ${
//                               completed
//                                 ? "text-green-700"
//                                 : isCurrent
//                                   ? "text-blue-700"
//                                   : "text-gray-800"
//                             }`}
//                           >
//                             {chapter.title}
//                           </h4>
//                           {/* {chapter.duration && (
//                             <span className="text-sm text-gray-500 whitespace-nowrap">
//                               {formatDuration(chapter.duration)}
//                             </span>
//                           )} */}
//                           {chapter.number && (
//                             <span className="text-sm text-gray-500 whitespace-nowrap">
//                               {chapter.number}
//                             </span>
//                           )}
//                         </div>
//                         {chapter.description && (
//                           <p className="text-sm text-gray-600 line-clamp-2 mb-2">
//                             {chapter.description}
//                           </p>
//                         )}
//                         {/* Status */}

//                         <div className="flex items-center justify-between mt-2">
//                           <div className="text-xs text-gray-500">
//                             {completed ? (
//                               <span className="flex items-center gap-1 text-green-600">
//                                 <CheckCircle size={12} />
//                                 Completed
//                               </span>
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
//               {user?._id ? (
//                 <>
//                   <div className="grid grid-cols-2 gap-4 text-sm mb-3">
//                     <div className="text-center">
//                       <div className="text-2xl font-bold text-blue-600">
//                         {
//                           chapters.filter((ch) =>
//                             isChapterCompleted(productId || "", ch._id),
//                           ).length
//                         }
//                       </div>
//                       <div className="text-gray-600">Completed</div>
//                     </div>
//                     <div className="text-center">
//                       {/* <div className="text-2xl font-bold text-green-600">
//                         {formatTotalDurationHours(chapters)}
//                       </div>
//                       <div className="text-gray-600">Total Duration</div> */}
//                     </div>
//                   </div>

//                   {/* Przycisk resetu całego kursu */}
//                   <div className="text-center">
//                     <button
//                       onClick={() => {
//                         if (
//                           window.confirm(
//                             "Reset all progress for this course? This cannot be undone.",
//                           )
//                         ) {
//                           resetAllProgress(productId || "");
//                           toast.success("All progress reset!");
//                         }
//                       }}
//                       className="text-sm text-red-500 hover:text-red-700 px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
//                     >
//                       Reset All Progress
//                     </button>
//                   </div>

//                   <div className="mt-2 text-xs text-gray-500 text-center">
//                     Progress saved for:{" "}
//                     <span className="font-medium">{user.email}</span>
//                   </div>
//                 </>
//               ) : (
//                 <div className="text-center py-2">
//                   <p className="text-gray-600 mb-2">
//                     Login to save your progress
//                   </p>
//                   <a
//                     href="/login"
//                     className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//                   >
//                     Sign In
//                   </a>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductResources;
