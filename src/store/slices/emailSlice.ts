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
  async (email: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;

      console.log("🔍 State i18n:", state.i18n);
      console.log("🔍 State auth:", state.auth);
      console.log("🔍 State language from i18n:", state.i18n?.language);
      console.log("🔍 State language from auth:", state.auth?.language);

      const lang = state.i18n?.language || state.auth?.language || "pl";
      console.log("Sending reset request with lang:", lang); // Debug
      const res = await api.post(
        "/auth/forgot-password",
        { email },
        {
          headers: {
            "Accept-Language": lang,
          },
        },
      );
      return res.data.message;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Błąd resetu hasła");
    }
  },
);

// -----------------------------------------------------
// 2) RESET PASSWORD
// -----------------------------------------------------
export const resetPassword = createAsyncThunk(
  "email/resetPassword",
  async (
    payload: { token: string; newPassword: string },
    { rejectWithValue, getState },
  ) => {
    try {
      const state = getState() as any;
      const lang = state.i18n?.language || "pl"; // Pobierz język z i18n
      const res = await api.post("/auth/reset-password", { ...payload, lang });

      return res.data.message;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || "Błąd zmiany hasła");
    }
  },
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

      if (!token) {
        return rejectWithValue("Brak tokena autoryzacji");
      }

      // Pobierz język z i18n
      const lang = state.i18n?.language || "pl";

      const res = await api.patch(
        "/auth/change-email",
        { newEmail }, // Dodaj lang do body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Accept-Language": lang,
          },
        },
      );
      return res.data.message;
    } catch (err: any) {
      console.error("Change email error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.error || "Błąd zmiany e-maila",
      );
    }
  },
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
