import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import api from "../../utils/api";
import { tokenRefreshService } from "../../services/tokenRefreshService";

type Role = "user" | "admin";

interface User {
  _id: string;
  name: string;
  surname: string;
  email: string;
  role: Role;
}

interface BackendError {
  error?: string;
  message?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  success: string | null;
  error: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  expiresAt?: number | null;
}

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");
const storedExpiresAt = localStorage.getItem("expiresAt");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  loading: false,
  success: null,
  error: null,
  status: "idle",
  expiresAt: storedExpiresAt ? parseInt(storedExpiresAt) : null,
};

// Helper: Triggers token refresh
const setupTokenRefresh = (expiresAt: number) => {
  if (!expiresAt || expiresAt <= Date.now()) {
    console.warn("Nieprawidłowy lub wygasły expiresAt:", expiresAt);
    return;
  }

  // Set buffer to 5 minutes before expiration
  tokenRefreshService.setRefreshBuffer(5 * 60 * 1000);

  tokenRefreshService.setupTokenRefresh(expiresAt, async () => {
    try {
      const result = refreshToken();
      if (refreshToken.fulfilled.match(result)) {
      } else {
        console.error("Auto refresh error:", result);
        // In case of an error, we clear the timer
        tokenRefreshService.clearRefreshTimer();
      }
    } catch (error) {
      console.error("Auto refresh exception:", error);
    }
  });
};

// Helper: Clears the refresh timer
const clearTokenRefresh = () => {
  tokenRefreshService.clearRefreshTimer();
};

// Helper:Initiates a refresh based on an existing token
const initializeTokenRefresh = () => {
  const storedExpiresAt = localStorage.getItem("expiresAt");
  if (storedExpiresAt) {
    const expiresAt = parseInt(storedExpiresAt);
    if (expiresAt > Date.now()) {
      //console.log("Initializing token refresh from localStorage");
      setupTokenRefresh(expiresAt);
    } else {
      console.log("The token in localStorage has already expired");
      clearTokenRefresh();
    }
  }
};

// Call initialization on module load
if (typeof window !== "undefined") {
  // Delay initialization to avoid cyclic dependency issues
  setTimeout(() => {
    initializeTokenRefresh();
  }, 1000);
}

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await api.post("/auth/login", credentials);
      return res.data; // { user, token, expiresAt }
    } catch (err) {
      let errorMessage = "Wystąpił błąd podczas logowania";

      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<BackendError>;
        // Get message from backend (e.g. "Incorrect email or password")
        errorMessage =
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      // Forward a message to Reducer
      return thunkAPI.rejectWithValue(errorMessage);
    }
  },
);

// User registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    newUser: {
      name: string;
      surname: string;
      email: string;
      password: string;
      captchaToken: string | null;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.post("/auth/register", newUser);
      return res.data;
    } catch (error: any) {
      console.error("Registration error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      } else if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      } else if (error.response?.data) {
        return rejectWithValue(error.response.data);
      } else {
        return rejectWithValue(error.message || "Registration failed");
      }
    }
  },
);

// REGISTER ADMIN

export const registerAdmin = createAsyncThunk(
  "auth/registerAdmin",
  async (
    data: { name: string; surname: string; email: string; password: string },
    thunkAPI,
  ) => {
    try {
      const state = thunkAPI.getState() as { auth: AuthState };
      const token = state.auth.token;

      if (!token) {
        return thunkAPI.rejectWithValue("No authorization token");
      }

      const response = await api.post("auth/register-admin", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      //console.log("RegisterAdmin success:", response.data);

      return response.data;
    } catch (err) {
      let errorMessage: string = "An error occurred";
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<BackendError>;
        errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      return thunkAPI.rejectWithValue(errorMessage);
    }
  },
);

// Logout thunk

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as { auth: AuthState };
      const token = state.auth.token;

      if (!token) return;

      await api.post(
        "/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return;
    } catch (error) {
      console.error("Logout user error:", error);
      return thunkAPI.rejectWithValue("Error logging out user");
    }
  },
);

// Logout admin
export const logoutAdmin = createAsyncThunk(
  "auth/logoutAdmin",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as { auth: AuthState };
      const token = state.auth.token;

      if (!token) return;

      await api.post(
        "/auth/logout-admin",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      return;
    } catch (error) {
      console.error("Logout admin error:", error);
      return thunkAPI.rejectWithValue("Error logging out admin");
    }
  },
);
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as { auth: AuthState };
      const token = state.auth.token;

      if (!token) return;

      const res = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      thunkAPI.dispatch(logoutUser());
      return thunkAPI.rejectWithValue("unauthorized");
    }
  },
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as { auth: AuthState };
      const token = state.auth.token;

      if (!token) {
        return thunkAPI.rejectWithValue("No token");
      }

      const response = await api.post(
        "/auth/refresh-token",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data; // { token, expiresAt }
    } catch (err) {
      clearTokenRefresh();

      let errorMessage = "Failed to refresh token";
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<BackendError>;
        errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          errorMessage;
      }

      return thunkAPI.rejectWithValue(errorMessage);
    }
  },
);
/////////////////////////////////////////////////////////////////////

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearMessages(state) {
      state.error = null;
      state.success = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // reducer for manual refresh setting
    setupAutoRefresh(state) {
      if (state.expiresAt && state.expiresAt > Date.now()) {
        setupTokenRefresh(state.expiresAt);
      }
    },
    // reducer to clean refresh
    clearAutoRefresh() {
      clearTokenRefresh();
    },
  },
  // reducers: {
  //   clearMessages(state) {
  //     state.error = null;
  //     state.success = null;
  //   },
  // },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;

        if (action.payload.expiresAt) {
          state.expiresAt = action.payload.expiresAt;
          localStorage.setItem(
            "expiresAt",
            action.payload.expiresAt.toString(),
          );
          // Turn on auto refresh
          setupTokenRefresh(action.payload.expiresAt);
        } else {
          state.expiresAt = null;
          clearTokenRefresh();
        }

        // Saving to localStorage
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        clearTokenRefresh();
      })

      // REGISTER USER
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";

        if (action.payload || action.payload.token) {
          state.user = action.payload.user;
          state.token = action.payload.token;

          if (action.payload.expiresAt) {
            state.expiresAt = action.payload.expiresAt;
            localStorage.setItem(
              "expiresAt",
              action.payload.expiresAt.toString(),
            );
            // Uruchom automatyczne odświeżanie
            setupTokenRefresh(action.payload.expiresAt);
          } else {
            state.expiresAt = null;
            clearTokenRefresh();
          }

          localStorage.setItem("user", JSON.stringify(action.payload.user));
          localStorage.setItem("token", action.payload.token);
        } else {
          state.error = null;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";

        state.error = (action.payload as string) || "Registration failed";
        clearTokenRefresh();
      })

      // REGISTER ADMIN
      .addCase(registerAdmin.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerAdmin.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Admin registration error";
      })

      // LOGOUT
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.expiresAt = null;
        state.loading = false;
        state.status = "idle";
        state.error = null;
        state.success = null;

        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("expiresAt");

        clearTokenRefresh();
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.expiresAt = null;
        state.loading = false;
        state.status = "idle";
        state.success = null;
        state.error = (action.payload as string) || "Error logging out";

        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("expiresAt");

        // Clear refresh timer
        clearTokenRefresh();
      })
      .addCase(logoutAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.expiresAt = null;
        state.loading = false;
        state.success = null;
        state.error = null;
        state.status = "idle";

        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("expiresAt");

        clearTokenRefresh();
      })
      .addCase(logoutAdmin.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.expiresAt = null;
        state.loading = false;
        state.success = null;
        state.error =
          (action.payload as string) || "Błąd przy wylogowaniu admina";
        state.status = "idle";

        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("expiresAt");
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.user = null;
        state.token = null;
        state.expiresAt = null;
        state.status = "idle";
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("expiresAt");

        state.error =
          action.payload === "unauthorized"
            ? "Your session has expired. Please log in again.."
            : "Authorization error";
        state.status = "failed";

        clearTokenRefresh();
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.expiresAt = action.payload.expiresAt;

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("expiresAt", action.payload.expiresAt.toString());

        // Reset the refresh timer with a new expiresAt
        if (action.payload.expiresAt) {
          setupTokenRefresh(action.payload.expiresAt);
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        const errorMessage = action.payload as string;

        // Log the error to display to the user
        state.error = `Nie udało się odświeżyć sesji: ${errorMessage}`;
        state.status = "failed";

        // Log for developer
        console.error("Refresh token error:", {
          message: errorMessage,
          user: state.user?.email,
          expiresAt: state.expiresAt
            ? new Date(state.expiresAt).toISOString()
            : null,
          timeLeft: state.expiresAt
            ? Math.max(0, state.expiresAt - Date.now()) / 1000
            : 0,
        });

        if (
          errorMessage.includes("Brak tokena") ||
          errorMessage.includes("unauthorized")
        ) {
          setTimeout(() => {
            // You can add automatic logout on error
            //thunkAPI.dispatch(logoutUser());
          }, 5000);
        }
      });
  },
});
export const { clearMessages, setupAutoRefresh, clearAutoRefresh, clearError } =
  authSlice.actions;
export default authSlice.reducer;
