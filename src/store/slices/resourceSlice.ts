import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type WritableDraft,
} from "@reduxjs/toolkit";
//import api from "../../utils/api"; // axios instance
import type { IChapter, IResourceListResponse } from "../../types";
import type { IResource } from "../../types";
//import type { RootState } from "../../store";
//import axios from "axios";
import { authorizedRequest } from "../../utils/authorizedRequest";

interface FetchParams {
  page?: number;
  pageSize?: number;
  q?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

interface ResourceState {
  items: IResource[];
  resourcesByProductId: Record<string, IResource>;
  resourcesById: Record<string, IResource>;
  selected: IResource | null;
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

const initialState: ResourceState = {
  items: [],
  resourcesByProductId: {},
  resourcesById: {},
  selected: null,
  total: 0,
  page: 1,
  pageSize: 20,
  loading: false,
  error: null,
};

interface AddChapterPayload {
  resourceId: string;
  chapterData: {
    number: number;
    title: string;
    description?: string;
    videoUrl?: string;
  };
}

export const fetchResources = createAsyncThunk<
  IResourceListResponse, // typ danych zwracanych przy sukcesie
  FetchParams // typ argumentu przekazywanego do thunka
>("resources/fetchAll", async (params: FetchParams = {}, thunkApi) => {
  try {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
    if (params.q) searchParams.set("q", params.q);
    if (params.sortField) searchParams.set("sortField", params.sortField);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

    const data = await authorizedRequest<IResourceListResponse>(thunkApi, {
      url: `/admin/resources?${searchParams.toString()}`,
      method: "GET",
    });

    return data;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error);
  }
});

// 📌 pojedynczy resorce

export const fetchResourceById = createAsyncThunk<IResource, string>(
  "resources/fetchById",
  async (resourceId, thunkApi) => {
    try {
      const resource = await authorizedRequest<IResource>(thunkApi, {
        url: `/admin/resources/id/${resourceId}`,
        method: "GET",
      });

      // console.log("✅ Fetched resource by ID:", resource);
      return resource;
    } catch (error: any) {
      console.error("❌ Error in fetchResourceById:", error);
      return thunkApi.rejectWithValue(error);
    }
  }
);

export const fetchResourceByProductId = createAsyncThunk<IResource, string>(
  "resources/fetchByProductId",
  async (productId, thunkApi) => {
    try {
      const resource = await authorizedRequest<IResource>(thunkApi, {
        url: `/admin/resources/product/${productId}`,
        method: "GET",
      });

      //console.log("✅ Fetched resource by product ID:", resource);
      return resource;
    } catch (error: any) {
      console.error("❌ Error in fetchResourceByProductId:", error);
      return thunkApi.rejectWithValue(error);
    }
  }
);

// 📌 Utwórz resource (powiązany z produktem)
export const createResource = createAsyncThunk<IResource, any>(
  "resources/create",
  async (resourceData, thunkApi) => {
    try {
      const resource = await authorizedRequest<IResource>(thunkApi, {
        url: "/admin/resources",
        method: "POST",
        data: resourceData,
      });

      console.log("✅ Resource created:", resource);
      return resource;
    } catch (error: any) {
      console.error("❌ Error creating resource:", error);
      return thunkApi.rejectWithValue(error);
    }
  }
);

// 📌 Edytuj resource (np. tytuł, opis, videoUrl itd.)
export const editResource = createAsyncThunk<
  IResource,
  { id: string; resourceData: any }
>("resources/edit", async ({ id, resourceData }, thunkApi) => {
  try {
    const resource = await authorizedRequest<IResource>(thunkApi, {
      url: `/admin/resources/${id}`,
      method: "PUT",
      data: resourceData,
    });

    console.log("✅ Resource updated:", resource);
    return resource;
  } catch (error: any) {
    console.error("❌ Error editing resource:", error);
    return thunkApi.rejectWithValue(error);
  }
});

export const deleteResource = createAsyncThunk<string, string>(
  "resources/delete",
  async (id, thunkApi) => {
    try {
      await authorizedRequest(thunkApi, {
        url: `/admin/resources/${id}`,
        method: "DELETE",
      });

      console.log("🗑️ Resource deleted:", id);
      return id;
    } catch (error: any) {
      console.error("❌ Error deleting resource:", error);
      return thunkApi.rejectWithValue(error);
    }
  }
);

// 📌 Dodaj chapter do resource
export const addChapter = createAsyncThunk<IResource, AddChapterPayload>(
  "resources/addChapter",
  async ({ resourceId, chapterData }, thunkApi) => {
    try {
      const resource = await authorizedRequest<IResource>(thunkApi, {
        url: `/admin/resources/${resourceId}/chapters`,
        method: "POST",
        data: chapterData,
      });

      console.log("✅ Chapter added:", resource);
      return resource;
    } catch (error: any) {
      console.error("❌ Error adding chapter:", error);
      return thunkApi.rejectWithValue(error);
    }
  }
);

// 📌 Usuń chapter z resource
export const deleteChapter = createAsyncThunk<
  { resourceId: string; chapterId: string },
  { resourceId: string; chapterId: string }
>("resources/deleteChapter", async ({ resourceId, chapterId }, thunkApi) => {
  try {
    await authorizedRequest(thunkApi, {
      url: `/admin/resources/${resourceId}/chapters/${chapterId}`,
      method: "DELETE",
    });

    console.log("🗑️ Chapter deleted:", chapterId);
    return { resourceId, chapterId };
  } catch (error: any) {
    console.error("❌ Error deleting chapter:", error);
    return thunkApi.rejectWithValue(error);
  }
});

// 📌 Edytuj chapter w resource
export const editChapter = createAsyncThunk<
  IResource,
  {
    resourceId: string;
    chapterId: string;
    chapterData: any;
  }
>(
  "resources/editChapter",
  async ({ resourceId, chapterId, chapterData }, thunkApi) => {
    try {
      const resource = await authorizedRequest<IResource>(thunkApi, {
        url: `/admin/resources/${resourceId}/chapters/${chapterId}`,
        method: "PUT",
        data: chapterData,
      });

      console.log("✅ Chapter edited:", resource);
      return resource; // zwraca zaktualizowany resource
    } catch (error: any) {
      console.error("❌ Error editing chapter:", error);
      return thunkApi.rejectWithValue(error);
    }
  }
);

// 📌 Delete Chapter Video
export const deleteChapterVideo = createAsyncThunk<
  { resourceId: string; chapterId: string; removedVideoId: string },
  { resourceId: string; chapterId: string }
>(
  "resources/deleteChapterVideo",
  async ({ resourceId, chapterId }, thunkApi) => {
    try {
      const result = await authorizedRequest<{
        success: boolean;
        removedVideoId: string;
      }>(thunkApi, {
        url: `/admin/resources/${resourceId}/chapters/${chapterId}/video`,
        method: "DELETE",
      });

      console.log("🗑️ Chapter video deleted:", chapterId);
      return {
        resourceId,
        chapterId,
        removedVideoId: result.removedVideoId,
      };
    } catch (error: any) {
      console.error("❌ Error deleting chapter video:", error);
      return thunkApi.rejectWithValue(error);
    }
  }
);

// 📌 Get Chapter with Video Details
export const fetchChapterWithVideo = createAsyncThunk<
  { resourceId: string; chapterId: string; chapter: IChapter },
  { resourceId: string; chapterId: string }
>(
  "resources/fetchChapterWithVideo",
  async ({ resourceId, chapterId }, thunkApi) => {
    try {
      const result = await authorizedRequest<{
        success: boolean;
        chapter: IChapter;
      }>(thunkApi, {
        url: `/admin/resources/${resourceId}/chapters/${chapterId}`,
        method: "GET",
      });

      return {
        resourceId,
        chapterId,
        chapter: result.chapter,
      };
    } catch (error: any) {
      console.error("❌ Error fetching chapter with video:", error);
      return thunkApi.rejectWithValue(error);
    }
  }
);

const resourceSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {
    clearSelectedResource: (state) => {
      state.selected = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 📌 fetchResource
      .addCase(fetchResources.pending, (state) => {
        //console.log("🔄 fetchResource pending");
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchResources.fulfilled,
        (state, action: PayloadAction<IResourceListResponse>) => {
          state.loading = false;
          state.items = action.payload.items;
          state.total = action.payload.total;
          state.page = action.payload.page;
          state.pageSize = action.payload.pageSize;
          // const resource = action.payload;
          // console.log("✅ fetchResource fulfilled:", action.payload._id);
          //state.loading.fetch = false;
          //state.error = null;
          //state.selected = resource;
          //state.resourcesByProductId[action.payload.productId] = action.payload;
        }
      )
      .addCase(fetchResources.rejected, (state, action) => {
        // console.log("❌ fetchResource rejected:", action.error);
        state.loading = false;
        state.error = action.error.message || "Error fetching resource";
      })

      // 📌 fetchResourceById
      .addCase(fetchResourceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchResourceById.fulfilled,
        (
          state: WritableDraft<ResourceState>,
          action: PayloadAction<IResource>
        ) => {
          state.loading = false;
          state.error = null;
          state.selected = action.payload;
          // state.resourcesByProductId[action.payload.productId] = action.payload;
          //state.id[action.payload.id] = action.payload;
          if (action.payload._id) {
            state.resourcesById[action.payload._id] = action.payload;
          }
        }
      )
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch resource";
      })
      // 📌 fetchResourceByProductId

      .addCase(fetchResourceByProductId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchResourceByProductId.fulfilled,
        (
          state: WritableDraft<ResourceState>,
          action: PayloadAction<IResource>
        ) => {
          state.loading = false;
          state.error = null;
          state.selected = action.payload;
          state.resourcesByProductId[action.payload.productId] = action.payload;
        }
      )
      .addCase(fetchResourceByProductId.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch resource";
      })

      // 📌 createResource
      .addCase(createResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResource.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.items.push(action.payload);
      })
      .addCase(createResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error creating resource";
      })

      // 📌 editResource
      .addCase(editResource.pending, (state) => {
        state.loading = true; // lub dodaj nowy flag dla edit
      })
      .addCase(editResource.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((res) =>
          res._id === action.payload._id ? action.payload : res
        );
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
        }
      })
      .addCase(editResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error editing resource";
      })

      // 📌 deleteResource
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.items = state.items.filter((res) => res._id !== action.payload);
        if (state.selected && state.selected._id === action.payload) {
          state.selected = null;
        }
      })

      // 📌 addChapter
      .addCase(addChapter.fulfilled, (state, action) => {
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
        }
      })

      // 📌 editChapter
      .addCase(editChapter.fulfilled, (state, action) => {
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
        }
        state.items = state.items.map((res) =>
          res._id === action.payload._id ? action.payload : res
        );
      })

      // 📌 deleteChapter
      .addCase(deleteChapter.fulfilled, (state, action) => {
        if (
          state.selected &&
          state.selected._id === action.payload.resourceId
        ) {
          state.selected.chapters = state.selected.chapters.filter(
            (ch: IChapter) => ch._id !== action.payload.chapterId
          );
        }
      })

      .addCase(deleteChapterVideo.fulfilled, (state, action) => {
        if (
          state.selected &&
          state.selected._id === action.payload.resourceId
        ) {
          const chapter = state.selected.chapters.find(
            (ch: IChapter) => ch._id === action.payload.chapterId
          );
          if (chapter) {
            chapter.videoId = undefined;
          }
        }
      })

      // 📌 fetchChapterWithVideo
      .addCase(fetchChapterWithVideo.fulfilled, (state, action) => {
        if (
          state.selected &&
          state.selected._id === action.payload.resourceId
        ) {
          state.selected.chapters = state.selected.chapters.map(
            (ch: IChapter) =>
              ch._id === action.payload.chapterId
                ? { ...ch, ...action.payload.chapter }
                : ch
          );
        }
      });
  },
});

export const { clearSelectedResource, setLoading } = resourceSlice.actions;
export default resourceSlice.reducer;
