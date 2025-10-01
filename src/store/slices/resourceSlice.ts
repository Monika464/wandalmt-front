import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api"; // axios instance

// 📌 Pobierz resource dla produktu
export const fetchResource = createAsyncThunk(
  "resources/fetchOne",
  async (productId: string) => {
    const res = await api.get(`/admin/resources/${productId}`);
    return res.data;
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

const resourceSlice = createSlice({
  name: "resources",
  initialState: {
    items: [] as any[], // lista zasobów
    selected: null as any, // aktualnie wybrany zasób
    loading: false,
    error: null as string | null,
  },
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
      .addCase(fetchResource.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
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

      // 📌 deleteChapter
      .addCase(deleteChapter.fulfilled, (state, action) => {
        if (
          state.selected &&
          state.selected._id === action.payload.resourceId
        ) {
          state.selected.chapters = state.selected.chapters.filter(
            (ch: any) => ch._id !== action.payload.chapterId
          );
        }
      });
  },
});

export const { clearSelectedResource } = resourceSlice.actions;
export default resourceSlice.reducer;
