// store/slices/progressSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

import { authorizedRequest } from "../../utils/authorizedRequest";

interface ChapterProgress {
  _id?: string;
  productId: string;
  chapterId: string;
  userId: string;
  completed: boolean;
  lastWatched: string;
  completedAt?: string;
  progress: number;
}

interface ProgressState {
  progressByProductId: Record<string, ChapterProgress[]>;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  progressByProductId: {},
  loading: false,
  error: null,
  saving: false,
};

// Pobierz postęp dla kursu
export const fetchProgressByProductId = createAsyncThunk<
  ChapterProgress[], // typ zwracany
  string // typ argumentu (productId)
>("progress/fetchByProductId", async (productId, thunkApi) => {
  try {
    const data = await authorizedRequest<ChapterProgress[]>(thunkApi, {
      url: `/api/progress/${productId}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error("Error fetching progress:", error);
    return thunkApi.rejectWithValue(error);
  }
});

// Mark chapter as complete
export const markChapterAsCompleted = createAsyncThunk<
  ChapterProgress,
  { productId: string; chapterId: string }
>("progress/markAsCompleted", async ({ productId, chapterId }, thunkApi) => {
  try {
    const res = await authorizedRequest<{ progress: ChapterProgress }>(
      thunkApi,
      {
        url: `/api/progress/${productId}/${chapterId}/complete`,
        method: "POST",
      },
    );
    //console.log("Response from markChapterAsCompleted:", res);
    return res.progress;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error);
  }
});

// Mark chapter as NOT completed (delete progress)
export const markChapterAsIncomplete = createAsyncThunk<
  { productId: string; chapterId: string }, // we return the id to be removed from the store
  { productId: string; chapterId: string } // argument thunk
>("progress/markAsIncomplete", async ({ productId, chapterId }, thunkApi) => {
  try {
    await authorizedRequest<void>(thunkApi, {
      url: `/api/progress/${productId}/${chapterId}`,
      method: "DELETE",
    });

    return { productId, chapterId }; // we return the id to remove it from the store
  } catch (error: any) {
    return thunkApi.rejectWithValue(error);
  }
});

// Reset all course progress
export const resetCourseProgress = createAsyncThunk<
  string, //we return productId
  string // argument thunk – productId
>("progress/resetCourseProgress", async (productId, thunkApi) => {
  try {
    await authorizedRequest<void>(thunkApi, {
      url: `/api/progress/${productId}`,
      method: "DELETE",
    });

    return productId; // we return productId to clear the store
  } catch (error: any) {
    return thunkApi.rejectWithValue(error);
  }
});

const progressSlice = createSlice({
  name: "progress",
  initialState,
  reducers: {
    clearProgressError: (state) => {
      state.error = null;
    },
    // We add a reducer to update progress locally (optional)
    updateLocalProgress: (
      state,
      action: PayloadAction<{
        productId: string;
        chapterId: string;
        progress: number;
        //timeWatched: number;
      }>,
    ) => {
      const { productId, chapterId, progress } = action.payload;
      const productProgress = state.progressByProductId[productId] || [];

      const existingIndex = productProgress.findIndex(
        (p) => p.chapterId === chapterId,
      );
      const now = new Date().toISOString();

      const localProgress: ChapterProgress = {
        userId: "", // empty because it's only local
        productId,
        chapterId,
        completed: false,
        progress,
        //timeWatched,
        lastWatched: now,
      };

      if (existingIndex >= 0) {
        productProgress[existingIndex] = {
          ...productProgress[existingIndex],
          ...localProgress,
        };
      } else {
        productProgress.push(localProgress);
      }

      state.progressByProductId[productId] = productProgress;
    },
  },
  extraReducers: (builder) => {
    builder
      // Downloading progress
      .addCase(fetchProgressByProductId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgressByProductId.fulfilled, (state, action) => {
        state.loading = false;

        const productId = action.meta.arg;
        state.progressByProductId[productId] = action.payload;
      })
      .addCase(fetchProgressByProductId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching progress";
      })

      //Marking as complete
      .addCase(markChapterAsCompleted.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(
        markChapterAsCompleted.fulfilled,
        (state, action: PayloadAction<ChapterProgress>) => {
          state.saving = false;
          const progress = action.payload;
          const { productId, chapterId } = progress;

          const productProgress = state.progressByProductId[productId] || [];
          const existingIndex = productProgress.findIndex(
            (p) => p.chapterId === chapterId,
          );

          if (existingIndex >= 0) {
            productProgress[existingIndex] = progress;
          } else {
            productProgress.push(progress);
          }

          state.progressByProductId[productId] = productProgress;
          state.error = null;
        },
      )
      .addCase(markChapterAsCompleted.rejected, (state, action) => {
        state.error =
          action.error.message || "Error marking chapter as completed";
      })

      // Marking as INCOMPLETE (Deleting)
      .addCase(markChapterAsIncomplete.fulfilled, (state, action) => {
        const { productId, chapterId } = action.payload;
        const productProgress = state.progressByProductId[productId];

        if (productProgress) {
          state.progressByProductId[productId] = productProgress.filter(
            (p) => p.chapterId !== chapterId,
          );
        }
        state.error = null;
      })
      .addCase(markChapterAsIncomplete.rejected, (state, action) => {
        state.error =
          action.error.message || "Error marking chapter as incomplete";
      })

      // Reset the entire course progress
      .addCase(resetCourseProgress.fulfilled, (state, action) => {
        const productId = action.payload;
        state.progressByProductId[productId] = [];
        state.error = null;
      })
      .addCase(resetCourseProgress.rejected, (state, action) => {
        state.error = action.error.message || "Error resetting course progress";
      });
  },
});

export const { clearProgressError, updateLocalProgress } =
  progressSlice.actions;
export default progressSlice.reducer;
