import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

interface VideoState {
  url: string | null;
  loading: boolean;

  video: any;
  videos: any[];
}

const initialState: VideoState = {
  url: null,
  loading: false,

  video: null,
  videos: [],
};

export const fetchVideoUrl = createAsyncThunk(
  "video/fetchUrl",
  async (videoId: string) => {
    //console.log("Fetching video URL for ID hello:", videoId);
    const res = await api.get(`/api/stream/${videoId}`);
    console.log("Fetched video URL:", res.data);
    return res.data;
  },
);

export const fetchVideosUrls = createAsyncThunk(
  "videos/fetchUrls",
  async () => {
    const res = await api.get(`/api/stream/videos`);

    return res.data;
  },
);

export const deleteVideo = createAsyncThunk(
  "video/delete",
  async (videoId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/stream/videos/${videoId}`);
      return videoId; // zwracamy id usuniętego filmu
    } catch (err: any) {
      return rejectWithValue(err?.response?.data ?? "delete-video-failed");
    }
  },
);

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideoUrl.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVideoUrl.fulfilled, (state, action) => {
        state.loading = false;

        state.url = action.payload.playbackUrl;
        state.video = action.payload.video;
      })
      .addCase(fetchVideoUrl.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchVideosUrls.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVideosUrls.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload;
      })
      .addCase(fetchVideosUrls.rejected, (state) => {
        state.loading = false;
      })
      .addCase(deleteVideo.pending, (state) => {
        state.loading = true;
      })

      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.loading = false;

        // usuń z listy
        state.videos = state.videos.filter((v) => v._id !== action.payload);

        // jeśli aktualnie oglądany film = usunięty
        if (state.video?._id === action.payload) {
          state.video = null;
          state.url = null;
        }
      })

      .addCase(deleteVideo.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default videoSlice.reducer;
