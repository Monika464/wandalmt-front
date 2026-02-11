// hooks/useChapterProgress.ts
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import {
  fetchProgressByProductId,
  markChapterAsCompleted,
  markChapterAsIncomplete,
  resetCourseProgress,
} from "../store/slices/progressSlice";

export const useChapterProgress = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { progressByProductId, loading, error } = useSelector(
    (state: RootState) => state.progress,
  );

  const getProgressForProduct = useCallback(
    (productId: string) => {
      return progressByProductId[productId] || [];
    },
    [progressByProductId],
  );

  const isChapterCompleted = useCallback(
    (productId: string, chapterId: string) => {
      const productProgress = progressByProductId[productId] || [];
      const progress = productProgress.find((p) => p.chapterId === chapterId);
      return progress?.completed || false;
    },
    [progressByProductId],
  );

  const loadProgress = useCallback(
    (productId: string) => {
      if (!productId || !user?._id) return;
      dispatch(fetchProgressByProductId(productId));
    },
    [dispatch, user?._id],
  );

  const completeChapter = useCallback(
    (productId: string, chapterId: string) => {
      if (!productId || !chapterId || !user?._id) return;
      dispatch(markChapterAsCompleted({ productId, chapterId }));
    },
    [dispatch, user?._id],
  );

  const uncompleteChapter = useCallback(
    (productId: string, chapterId: string) => {
      if (!productId || !chapterId || !user?.id) return;
      dispatch(markChapterAsIncomplete({ productId, chapterId }));
    },
    [dispatch, user?._id],
  );

  const resetAllProgress = useCallback(
    (productId: string) => {
      if (!productId || !user?._id) return;
      dispatch(resetCourseProgress(productId));
    },
    [dispatch, user?._id],
  );

  const calculateOverallProgress = useCallback(
    (productId: string, totalChapters: number) => {
      if (totalChapters === 0) return 0;
      const productProgress = progressByProductId[productId] || [];
      const completedChapters = productProgress.filter((p) => p.completed);
      return (completedChapters.length / totalChapters) * 100;
    },
    [progressByProductId],
  );

  return {
    getProgressForProduct,
    isChapterCompleted,
    loadProgress,
    completeChapter,
    uncompleteChapter,
    resetAllProgress,
    calculateOverallProgress,
    loading,
    error,
  };
};
