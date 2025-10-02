import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../utils/api"; // axios instance
import type { IChapter } from "../../types";
import type { IResource } from "../../types";

interface ResourceState {
  resourcesByProductId: Record<string, IResource>;
  selected: IResource | null;
  loading: boolean;
  error: string | null;
}

const initialState: ResourceState = {
  resourcesByProductId: {},
  selected: null,
  loading: false,
  error: null,
};

// 📌 Pobierz resource dla produktu
export const fetchResource = createAsyncThunk(
  "resources/fetchOne",
  async (productId: string) => {
    const res = await api.get(`/admin/resources/${productId}`);
    console.log("Fetched resource:", res.data);
    return res.data as IResource;
  }
);

// export const fetchResource = createAsyncThunk(
//   "resources/fetchOne",
//   async (productId: string) => {
//     const res = await api.get(`/admin/resources/${productId}`);
//     console.log("Fetched resource:", res.data);
//     return res.data;
//   }
// );

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

// 📌 Usuń resource
export const deleteResource = createAsyncThunk(
  "resources/delete",
  async (id: string) => {
    await api.delete(`/admin/resources/${id}`);
    return id;
  }
);

// 📌 Dodaj chapter do resource
export const addChapter = createAsyncThunk(
  "resources/addChapter",
  async ({ resourceId, chapter }: { resourceId: string; chapter: any }) => {
    const res = await api.post(
      `/admin/resources/${resourceId}/chapters`,
      chapter
    );
    return res.data;
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
    },
  },
  extraReducers: (builder) => {
    builder
      // 📌 fetchResource
      .addCase(fetchResource.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchResource.fulfilled,
        (state, action: PayloadAction<IResource>) => {
          const resource = action.payload;
          state.loading = false;
          state.selected = resource;
          state.resourcesByProductId[resource.productId] = resource;
        }
      )
      .addCase(fetchResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching resource";
      })

      // 📌 createResource
      .addCase(createResource.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // 📌 editResource
      .addCase(editResource.fulfilled, (state, action) => {
        state.items = state.items.map((res) =>
          res._id === action.payload._id ? action.payload : res
        );
        if (state.selected && state.selected._id === action.payload._id) {
          state.selected = action.payload;
        }
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

export const { clearSelectedResource } = resourceSlice.actions;
export default resourceSlice.reducer;
