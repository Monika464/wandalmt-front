// src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import api from "../../utils/api";

export interface UserProfile {
  _id: string;
  email: string;
  name?: string;
  surname?: string;
  role: "user" | "admin";
  resources: string[];
  authProvider?: "local" | "google" | "facebook";
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

// 🔹 Downloading the current user's profile
export const fetchUserProfile = createAsyncThunk<
  UserProfile,
  void,
  { state: RootState }
>("user/fetchProfile", async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const token = state.auth.token;

    if (!token) {
      return thunkAPI.rejectWithValue("Brak tokena");
    }

    const res = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (error: any) {
    console.error("❌ Error in fetchUserProfile:", error);
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message,
    );
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserProfile(state) {
      state.profile = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
