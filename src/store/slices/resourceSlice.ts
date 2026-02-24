import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type WritableDraft,
} from "@reduxjs/toolkit";
import type { IChapter, IResourceListResponse } from "../../types/types";
import type { IResource } from "../../types/types";
import { authorizedRequest } from "../../utils/authorizedRequest";

interface FetchParams {
  page?: number;
  pageSize?: number;
  q?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  language?: string;
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
    bunnyVideoId?: string;
    videoId?: string;
  };
}

const transformChapterDataForApi = (chapterData: any): IChapter => {
  // Jeśli frontend wysyła stare pole videoId, przekonwertuj na bunnyVideoId
  if (chapterData.videoId && !chapterData.bunnyVideoId) {
    return {
      ...chapterData,
      bunnyVideoId: chapterData.videoId,
      videoId: chapterData.videoId,
    };
  }

  // Jeśli frontend wysyła bunnyGuid, przekonwertuj na bunnyVideoId
  if (chapterData.bunnyGuid && !chapterData.bunnyVideoId) {
    return {
      ...chapterData,
      bunnyVideoId: chapterData.bunnyGuid,
      bunnyGuid: undefined,
    };
  }

  return chapterData;
};

// 📌 Helper function do transformacji danych z API
const transformChapterFromApi = (chapter: any): IChapter => {
  // API zwraca bunnyVideoId, ale frontend może oczekiwać videoId dla kompatybilności
  return {
    _id: chapter._id,
    number: chapter.number,
    title: chapter.title,
    description: chapter.description,
    bunnyVideoId: chapter.bunnyVideoId,
    videoId: chapter.videoId,
  };
};

export const fetchResources = createAsyncThunk<
  IResourceListResponse,
  FetchParams
>("resources/fetchAll", async (params: FetchParams = {}, thunkApi) => {
  try {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
    if (params.q) searchParams.set("q", params.q);
    if (params.sortField) searchParams.set("sortField", params.sortField);
    if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params.language) searchParams.set("language", params.language);

    const data = await authorizedRequest<IResourceListResponse>(thunkApi, {
      url: `/admin/resources?${searchParams.toString()}`,
      method: "GET",
    });

    if (data.items) {
      data.items = data.items.map((resource) => ({
        ...resource,
        chapters: resource.chapters?.map(transformChapterFromApi) || [],
      }));
    }

    return data;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error);
  }
});

export const fetchResourceById = createAsyncThunk<IResource, string>(
  "resources/fetchById",
  async (resourceId, thunkApi) => {
    try {
      const resource = await authorizedRequest<IResource>(thunkApi, {
        url: `/admin/resources/id/${resourceId}`,
        method: "GET",
      });

      // Transformuj chapters
      if (resource.chapters) {
        resource.chapters = resource.chapters.map(transformChapterFromApi);
      }

      //console.log("✅ Fetched resource by ID:", resource._id);
      return resource;
    } catch (error: any) {
      console.error("❌ Error in fetchResourceById:", error);
      return thunkApi.rejectWithValue(error);
    }
  },
);

export const fetchResourceByProductId = createAsyncThunk<
  IResource,
  { productId: string; language?: string }
>("resources/fetchByProductId", async ({ productId, language }, thunkApi) => {
  try {
    console.log(
      "🔍 Fetching resource for product:",
      productId,
      "language:",
      language,
    );

    const url = language
      ? `/admin/resources/product/${productId}?language=${language}`
      : `/admin/resources/product/${productId}`;

    console.log("📡 Request URL:", url);

    const resource = await authorizedRequest<IResource>(thunkApi, {
      url: url,
      method: "GET",
    });

    console.log("✅ Resource fetched:", resource?._id);

    if (resource?.chapters) {
      resource.chapters = resource.chapters.map(transformChapterFromApi);
    }

    return resource;
  } catch (error: any) {
    console.error("❌ Error in fetchResourceByProductId:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });
    return thunkApi.rejectWithValue(error);
  }
});

export const createResource = createAsyncThunk<
  IResource,
  { productId: string; title: string; content: string; language: "pl" | "en" }
>("resources/create", async (resourceData, thunkApi) => {
  try {
    const resource = await authorizedRequest<IResource>(thunkApi, {
      url: "/admin/resources",
      method: "POST",
      data: resourceData,
    });

    // Transformuj chapters
    if (resource.chapters) {
      resource.chapters = resource.chapters.map(transformChapterFromApi);
    }

    console.log("✅ Resource created:", resource._id);
    return resource;
  } catch (error: any) {
    console.error("❌ Error creating resource:", error);
    return thunkApi.rejectWithValue(error);
  }
});

export const editResource = createAsyncThunk<
  IResource,
  {
    id: string;
    resourceData: { title: string; content: string; language?: "pl" | "en" };
  }
>("resources/edit", async ({ id, resourceData }, thunkApi) => {
  try {
    const resource = await authorizedRequest<IResource>(thunkApi, {
      url: `/admin/resources/${id}`,
      method: "PUT",
      data: resourceData,
    });

    // Transformuj chapters
    if (resource.chapters) {
      resource.chapters = resource.chapters.map(transformChapterFromApi);
    }

    console.log("✅ Resource updated:", resource._id);
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
  },
);

// 📌 Dodaj chapter do resource - ZAKTUALIZOWANE
export const addChapter = createAsyncThunk<IResource, AddChapterPayload>(
  "resources/addChapter",
  async ({ resourceId, chapterData }, thunkApi) => {
    try {
      // Transformuj dane przed wysłaniem
      const transformedData = transformChapterDataForApi(chapterData);

      const resource = await authorizedRequest<IResource>(thunkApi, {
        url: `/admin/resources/${resourceId}/chapters`,
        method: "POST",
        data: transformedData,
      });

      // Transformuj chapters z odpowiedzi
      if (resource.chapters) {
        resource.chapters = resource.chapters.map(transformChapterFromApi);
      }

      console.log("✅ Chapter added to resource:", resourceId);
      return resource;
    } catch (error: any) {
      console.error("❌ Error adding chapter:", error);
      return thunkApi.rejectWithValue(error);
    }
  },
);

// 📌 Usuń chapter z resource (razem z video)
export const deleteChapter = createAsyncThunk<
  { resourceId: string; chapterId: string },
  { resourceId: string; chapterId: string; videoId: string }
>(
  "resources/deleteChapter",
  async ({ resourceId, chapterId, videoId }, thunkApi) => {
    try {
      console.log("🗑️ Deleting chapter:", chapterId, "with videoId:", videoId);
      await authorizedRequest(thunkApi, {
        url: `/api/stream/videos/${videoId}`,
        method: "DELETE",
      });

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
  },
);

// 📌 Edytuj chapter w resource - ZAKTUALIZOWANE
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
      // Transformuj dane przed wysłaniem
      const transformedData = transformChapterDataForApi(chapterData);

      const resource = await authorizedRequest<IResource>(thunkApi, {
        url: `/admin/resources/${resourceId}/chapters/${chapterId}`,
        method: "PUT",
        data: transformedData,
      });

      // Transformuj chapters z odpowiedzi
      if (resource.chapters) {
        resource.chapters = resource.chapters.map(transformChapterFromApi);
      }

      console.log("✅ Chapter edited:", chapterId);
      return resource;
    } catch (error: any) {
      console.error("❌ Error editing chapter:", error);
      return thunkApi.rejectWithValue(error);
    }
  },
);

// 📌 Get Chapter with Video Details - ZAKTUALIZOWANE
export const fetchChapterWithVideo = createAsyncThunk<
  { resourceId: string; chapterId: string; chapter: IChapter },
  { resourceId: string; chapterId: string }
>(
  "resources/fetchChapterWithVideo",
  async ({ resourceId, chapterId }, thunkApi) => {
    try {
      const result = await authorizedRequest<{
        success: boolean;
        chapter: any; // Otrzymamy raw chapter z API
      }>(thunkApi, {
        url: `/admin/resources/${resourceId}/chapters/${chapterId}`,
        method: "GET",
      });

      // Transformuj chapter z API na format frontendu
      const transformedChapter = transformChapterFromApi(result.chapter);

      return {
        resourceId,
        chapterId,
        chapter: transformedChapter,
      };
    } catch (error: any) {
      console.error("❌ Error fetching chapter with video:", error);
      return thunkApi.rejectWithValue(error);
    }
  },
);

// 📌 Dodatkowy thunk dla backward compatibility
export const setChapterVideo = createAsyncThunk<
  IResource,
  {
    resourceId: string;
    chapterId: string;
    bunnyVideoId: string;
  }
>(
  "resources/setChapterVideo",
  async ({ resourceId, chapterId, bunnyVideoId }, thunkApi) => {
    try {
      const resource = await authorizedRequest<IResource>(thunkApi, {
        url: `/admin/resources/${resourceId}/chapters/${chapterId}`,
        method: "PUT",
        data: { bunnyVideoId },
      });

      // Transformuj chapters
      if (resource.chapters) {
        resource.chapters = resource.chapters.map(transformChapterFromApi);
      }

      console.log("✅ Chapter video set:", chapterId);
      return resource;
    } catch (error: any) {
      console.error("❌ Error setting chapter video:", error);
      return thunkApi.rejectWithValue(error);
    }
  },
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
    // Dodatkowe reducery do manualnej aktualizacji
    updateChapterVideo: (
      state,
      action: PayloadAction<{
        resourceId: string;
        chapterId: string;
        bunnyVideoId: string;
      }>,
    ) => {
      const { resourceId, chapterId, bunnyVideoId } = action.payload;

      // Aktualizuj w selected resource
      if (state.selected && state.selected._id === resourceId) {
        const chapter = state.selected.chapters.find(
          (ch: IChapter) => ch._id === chapterId,
        );
        if (chapter) {
          chapter.bunnyVideoId = bunnyVideoId;
        }
      }

      // Aktualizuj w items
      state.items = state.items.map((resource) => {
        if (resource._id === resourceId) {
          return {
            ...resource,
            chapters: resource.chapters.map((chapter) =>
              chapter._id === chapterId
                ? { ...chapter, bunnyVideoId }
                : chapter,
            ),
          };
        }
        return resource;
      });
    },
    clearChapterVideo: (
      state,
      action: PayloadAction<{
        resourceId: string;
        chapterId: string;
      }>,
    ) => {
      const { resourceId, chapterId } = action.payload;

      // Wyczyść w selected resource
      if (state.selected && state.selected._id === resourceId) {
        const chapter = state.selected.chapters.find(
          (ch: IChapter) => ch._id === chapterId,
        );
        if (chapter) {
          chapter.bunnyVideoId = undefined;
        }
      }

      // Wyczyść w items
      state.items = state.items.map((resource) => {
        if (resource._id === resourceId) {
          return {
            ...resource,
            chapters: resource.chapters.map((chapter) =>
              chapter._id === chapterId
                ? { ...chapter, bunnyVideoId: undefined }
                : chapter,
            ),
          };
        }
        return resource;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // 📌 fetchResources
      .addCase(fetchResources.pending, (state) => {
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
        },
      )
      .addCase(fetchResources.rejected, (state, action) => {
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
          action: PayloadAction<IResource>,
        ) => {
          state.loading = false;
          state.error = null;
          state.selected = action.payload;
          if (action.payload._id) {
            state.resourcesById[action.payload._id] = action.payload;
          }
        },
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
          action: PayloadAction<IResource>,
        ) => {
          state.loading = false;
          state.error = null;
          state.selected = action.payload;
          state.resourcesByProductId[action.payload.productId] = action.payload;
        },
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
        state.loading = true;
      })
      .addCase(editResource.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((res) =>
          res._id === action.payload._id ? action.payload : res,
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
        // Usuń z cache
        delete state.resourcesById[action.payload];
      })

      // 📌 addChapter
      .addCase(addChapter.fulfilled, (state, action) => {
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
        }
        // Aktualizuj również w items
        state.items = state.items.map((res) =>
          res._id === action.payload._id ? action.payload : res,
        );
      })

      // 📌 editChapter
      .addCase(editChapter.fulfilled, (state, action) => {
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
        }
        state.items = state.items.map((res) =>
          res._id === action.payload._id ? action.payload : res,
        );
      })

      // 📌 deleteChapter
      .addCase(deleteChapter.fulfilled, (state, action) => {
        if (
          state.selected &&
          state.selected._id === action.payload.resourceId
        ) {
          state.selected.chapters = state.selected.chapters.filter(
            (ch: IChapter) => ch._id !== action.payload.chapterId,
          );
        }
        // Aktualizuj również w items
        state.items = state.items.map((resource) => {
          if (resource._id === action.payload.resourceId) {
            return {
              ...resource,
              chapters: resource.chapters.filter(
                (ch: IChapter) => ch._id !== action.payload.chapterId,
              ),
            };
          }
          return resource;
        });
      })

      // 📌 deleteChapterVideo - ZAKTUALIZOWANE
      // .addCase(deleteChapterVideo.fulfilled, (state, action) => {
      //   const { resourceId, chapterId } = action.payload;

      //   // Aktualizuj selected resource
      //   if (state.selected && state.selected._id === resourceId) {
      //     const chapter = state.selected.chapters.find(
      //       (ch: IChapter) => ch._id === chapterId
      //     );
      //     if (chapter) {
      //       chapter.bunnyVideoId = undefined; // ZMIANA: bunnyVideoId zamiast videoId
      //     }
      //   }

      //   // Aktualizuj items
      //   state.items = state.items.map((resource) => {
      //     if (resource._id === resourceId) {
      //       return {
      //         ...resource,
      //         chapters: resource.chapters.map((chapter) =>
      //           chapter._id === chapterId
      //             ? { ...chapter, bunnyVideoId: undefined }
      //             : chapter
      //         ),
      //       };
      //     }
      //     return resource;
      //   });
      // })

      // 📌 fetchChapterWithVideo - ZAKTUALIZOWANE
      .addCase(fetchChapterWithVideo.fulfilled, (state, action) => {
        const { resourceId, chapterId, chapter } = action.payload;

        if (state.selected && state.selected._id === resourceId) {
          state.selected.chapters = state.selected.chapters.map(
            (ch: IChapter) =>
              ch._id === chapterId ? { ...ch, ...chapter } : ch,
          );
        }

        // Aktualizuj również w items
        state.items = state.items.map((resource) => {
          if (resource._id === resourceId) {
            return {
              ...resource,
              chapters: resource.chapters.map((ch) =>
                ch._id === chapterId ? { ...ch, ...chapter } : ch,
              ),
            };
          }
          return resource;
        });
      })

      // 📌 setChapterVideo (backward compatibility)
      .addCase(setChapterVideo.fulfilled, (state, action) => {
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
        }
        state.items = state.items.map((res) =>
          res._id === action.payload._id ? action.payload : res,
        );
      });
  },
});

export const {
  clearSelectedResource,
  setLoading,
  updateChapterVideo,
  clearChapterVideo,
} = resourceSlice.actions;

export default resourceSlice.reducer;
