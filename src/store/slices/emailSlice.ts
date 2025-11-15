import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

interface EmailState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: EmailState = {
  loading: false,
  error: null,
  success: null,
};

// -----------------------------------------------------
// 1) REQUEST PASSWORD RESET
// -----------------------------------------------------
export const requestPasswordReset = createAsyncThunk(
  "email/requestPasswordReset",
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/request-reset", { email });
      return res.data.message;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Błąd resetu hasła");
    }
  }
);

// -----------------------------------------------------
// 2) RESET PASSWORD
// -----------------------------------------------------
export const resetPassword = createAsyncThunk(
  "email/resetPassword",
  async (
    payload: { token: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/auth/reset-password", payload);
      return res.data.message;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Błąd zmiany hasła");
    }
  }
);

// -----------------------------------------------------
// 3) CHANGE EMAIL (wymaga sesji / JWT)
// -----------------------------------------------------
export const changeEmail = createAsyncThunk(
  "email/changeEmail",
  async (newEmail: string, { getState, rejectWithValue }) => {
    console.log("Thunk changeEmail called with:", newEmail);
    try {
      const state = getState() as any;
      const token = state.auth.token;
      const res = await api.patch(
        "/email/change-email",
        { newEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data.message;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error || "Błąd zmiany e-maila"
      );
    }
  }
);

// -----------------------------------------------------
// SLICE
// -----------------------------------------------------
const emailSlice = createSlice({
  name: "email",
  initialState,
  reducers: {
    clearEmailMessages(state) {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // RESET REQUEST
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload as string;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // RESET PASSWORD
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload as string;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // CHANGE EMAIL
      .addCase(changeEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(changeEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload as string;
      })
      .addCase(changeEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearEmailMessages } = emailSlice.actions;

export default emailSlice.reducer;
