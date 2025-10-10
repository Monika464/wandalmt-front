import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type WritableDraft,
} from "@reduxjs/toolkit";
import api from "../../utils/api"; // axios instance
import type { IChapter, IResourceListResponse } from "../../types";
import type { IResource } from "../../types";
import type { RootState } from "../../store";
import axios from "axios";

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
  selected: IResource | null;
  total: number;
  page: number;
  pageSize: number;
  loading: {
    fetch: boolean;
    fetchById: boolean;
    create: boolean;
  };
  error: string | null;
}

// interface ResourceState {
//   items: IResource[];
//   resourcesByProductId: Record<string, IResource>;
//   selected: IResource | null;
//   loading: {
//     fetch: boolean;
//     fetchById: boolean;
//     create: boolean;
//   };
//   error: string | null;
// }

const initialState: ResourceState = {
  items: [],
  resourcesByProductId: {},
  selected: null,
  total: 0,
  page: 1,
  pageSize: 20,
  loading: {
    fetch: false,
    fetchById: false,
    create: false,
  },
  error: null,
};

// const initialState: ResourceState = {
//   items: [],
//   resourcesByProductId: {},
//   selected: null,
//   loading: {
//     fetch: false,
//     fetchById: false,
//     create: false,
//   },
//   error: null,
// };

interface AddChapterPayload {
  resourceId: string;
  chapterData: {
    title: string;
    description: string;
    videoUrl: string;
  };
}

export const fetchResources = createAsyncThunk<
  IResourceListResponse, // ✅ typ danych, które thunk zwraca
  FetchParams // ✅ typ argumentu (page, q itd.)
>(
  "resources/fetchAll",
  async (params: FetchParams = {}, { getState, rejectWithValue, signal }) => {
    try {
      const state = getState() as RootState;
      const token = state.auth?.token;

      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set("page", String(params.page));
      if (params.pageSize)
        searchParams.set("pageSize", String(params.pageSize));
      if (params.q) searchParams.set("q", params.q);
      if (params.sortField) searchParams.set("sortField", params.sortField);
      if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

      const res = await api.get(`/admin/resources?${searchParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      //console.log("response ze slice", res.data);
      return res.data; // { items, total, page, pageSize }
    } catch (error: any) {
      if (axios.isCancel(error) || error.name === "CanceledError") {
        console.warn("Request cancelled");
        return rejectWithValue("Request cancelled");
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
//
// 📌 wszystkie resorce
// export const fetchResource = createAsyncThunk(
//   "resources/fetchOne",
//   async (productId: string, { getState, rejectWithValue, signal }) => {
//     //console.log("🚀 fetchResource START for product:", productId);

//     try {
//       const state = getState() as { auth?: { token?: string } };
//       const token = state.auth?.token;

//       const res = await api.get(`/admin/resources/${productId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         signal,
//       });

//       console.log("Fetched resource for products:", productId, res.data);
//       return res.data;
//     } catch (error: any) {
//       if (axios.isCancel(error) || error.name === "CanceledError") {
//         console.warn("Request was cancelled");
//         return rejectWithValue("Request cancelled");
//       }

//       return rejectWithValue(error.response?.data || error.message);
//     }
//   }
// );

// 📌 pojedynczy resorce

export const fetchResourceById = createAsyncThunk(
  "resources/fetchById",
  async (resourceId: string, { getState, rejectWithValue, signal }) => {
    //console.log(`🔄 Fetching resource ${resourceId}`);
    try {
      const state = getState() as { auth?: { token?: string } };
      const token = state.auth?.token;

      const res = await api.get(`/admin/resources/id/${resourceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });
      console.log("Fetched resource by ID:", res.data);
      return res.data as IResource;
    } catch (error: any) {
      if (axios.isCancel(error) || error.name === "CanceledError") {
        console.warn("Request cancelled");
        return;
      }
      return rejectWithValue(error.message);
    }
  }
);

export const fetchResourceByProductId = createAsyncThunk(
  "resources/fetchByProductId",
  async (productId: string, { getState, rejectWithValue, signal }) => {
    //console.log(`🔄 Fetching resource ${resourceId}`);
    try {
      const state = getState() as { auth?: { token?: string } };
      const token = state.auth?.token;

      const res = await api.get(`/admin/resources/product/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      });
      // console.log("Fetched resource by ID:", res.data);
      return res.data as IResource;
    } catch (error: any) {
      if (axios.isCancel(error) || error.name === "CanceledError") {
        console.warn("Request cancelled");
        return;
      }
      return rejectWithValue(error.message);
    }
  }
);

// 📌 Utwórz resource (powiązany z produktem)
export const createResource = createAsyncThunk(
  "resources/create",
  async (resourceData: any) => {
    const res = await api.post("/admin/resources", resourceData);
    return res.data;
  }
);

// 📌 Edytuj resource (np. tytuł, opis, videoUrl itd.)
export const editResource = createAsyncThunk(
  "resources/edit",
  async ({ id, resourceData }: { id: string; resourceData: any }) => {
    const res = await api.put(`/admin/resources/${id}`, resourceData);
    return res.data;
  }
);

export const deleteResource = createAsyncThunk(
  "resources/delete",
  async (id: string, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth?.token;
    await api.delete(`/admin/resources/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return id;
  }
);

// 📌 Usuń resource
// export const deleteResource = createAsyncThunk(
//   "resources/delete",
//   async (id: string) => {
//     await api.delete(`/admin/resources/${id}`);
//     return id;
//   }
// );

// 📌 Dodaj chapter do resource
export const addChapter = createAsyncThunk(
  "resources/addChapter",
  async (
    { resourceId, chapterData }: AddChapterPayload,
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { auth?: { token?: string } };
      const token = state.auth?.token;

      const res = await api.post(
        `/admin/resources/${resourceId}/chapters`,
        chapterData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return res.data;
    } catch (err: any) {
      console.error(
        "❌ Error in addChapter thunk:",
        err.response?.data || err.message
      );
      return rejectWithValue(err.response?.data || "Unknown error");
    }
  }
);

// 📌 Usuń chapter z resource
export const deleteChapter = createAsyncThunk(
  "resources/deleteChapter",
  async ({
    resourceId,
    chapterId,
  }: {
    resourceId: string;
    chapterId: string;
  }) => {
    await api.delete(`/admin/resources/${resourceId}/chapters/${chapterId}`);
    return { resourceId, chapterId };
  }
);

// 📌 Edytuj chapter w resource
export const editChapter = createAsyncThunk(
  "resources/editChapter",
  async ({
    resourceId,
    chapterId,
    chapterData,
  }: {
    resourceId: string;
    chapterId: string;
    chapterData: any;
  }) => {
    const res = await api.put(
      `/admin/resources/${resourceId}/chapters/${chapterId}`,
      chapterData
    );
    return res.data; // powinien zwracać cały resource po edycji chapter
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
    setLoading: (
      state,
      action: PayloadAction<{
        fetch?: boolean;
        fetchById?: boolean;
        create?: boolean;
      }>
    ) => {
      if (action.payload.fetch !== undefined)
        state.loading.fetch = action.payload.fetch;
      if (action.payload.fetchById !== undefined)
        state.loading.fetchById = action.payload.fetchById;
      if (action.payload.create !== undefined)
        state.loading.create = action.payload.create;
    },
  },
  extraReducers: (builder) => {
    builder
      // 📌 fetchResource
      .addCase(fetchResources.pending, (state) => {
        //console.log("🔄 fetchResource pending");
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(
        fetchResources.fulfilled,
        (state, action: PayloadAction<IResourceListResponse>) => {
          state.loading.fetch = false;
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
        state.loading.fetch = false;
        state.error = action.error.message || "Error fetching resource";
      })

      // 📌 fetchResourceById
      .addCase(fetchResourceById.pending, (state) => {
        state.loading.fetchById = true;
        state.error = null;
      })
      .addCase(
        fetchResourceById.fulfilled,
        (
          state: WritableDraft<ResourceState>,
          action: PayloadAction<IResource>
        ) => {
          state.loading.fetchById = false;
          state.error = null;
          state.selected = action.payload;
          // state.resourcesByProductId[action.payload.productId] = action.payload;
          state.id[action.payload.id] = action.payload;
        }
      )
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.loading.fetchById = false;
        state.error = (action.payload as string) || "Failed to fetch resource";
      })
      // 📌 fetchResourceByProductId

      .addCase(fetchResourceByProductId.pending, (state) => {
        state.loading.fetchById = true;
        state.error = null;
      })
      .addCase(
        fetchResourceByProductId.fulfilled,
        (
          state: WritableDraft<ResourceState>,
          action: PayloadAction<IResource>
        ) => {
          state.loading.fetchById = false;
          state.error = null;
          state.selected = action.payload;
          state.resourcesByProductId[action.payload.productId] = action.payload;
        }
      )
      .addCase(fetchResourceByProductId.rejected, (state, action) => {
        state.loading.fetchById = false;
        state.error = (action.payload as string) || "Failed to fetch resource";
      })

      // 📌 createResource
      .addCase(createResource.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createResource.fulfilled, (state, action) => {
        state.loading.create = false;
        state.error = null;
        state.items.push(action.payload);
      })
      .addCase(createResource.rejected, (state, action) => {
        state.loading.create = false;
        state.error = action.error.message || "Error creating resource";
      })

      // 📌 editResource
      .addCase(editResource.pending, (state) => {
        state.loading.create = true; // lub dodaj nowy flag dla edit
      })
      .addCase(editResource.fulfilled, (state, action) => {
        state.loading.create = false;
        state.items = state.items.map((res) =>
          res._id === action.payload._id ? action.payload : res
        );
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
        }
      })
      .addCase(editResource.rejected, (state, action) => {
        state.loading.create = false;
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
      });
  },
});

export const { clearSelectedResource, setLoading } = resourceSlice.actions;
export default resourceSlice.reducer;
