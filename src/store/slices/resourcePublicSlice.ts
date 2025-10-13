import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
  type WritableDraft,
} from "@reduxjs/toolkit";
import type { IResource } from "../../types";
import axios from "axios";
import api from "../../utils/api";

interface ResourceState {
  resourcesByProductId: Record<string, any>;
  loading: boolean;
  error: string | null;
}

const initialState: ResourceState = {
  resourcesByProductId: {},
  loading: false,
  error: null,
};

export const fetchResourceByProductId = createAsyncThunk(
  "resources/fetchByProductId",
  async (productId: string, { rejectWithValue, signal }) => {
    //console.log(`🔄 Fetching resource ${resourceId}`);
    try {
      const res = await api.get(`/resources/${productId}`, {
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
      });
  },
});

export const { clearSelectedResource, setLoading } = resourceSlice.actions;
export default resourceSlice.reducer;
