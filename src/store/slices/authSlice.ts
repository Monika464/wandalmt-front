import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import api from "../../utils/api";
import { tokenRefreshService } from "../../services/tokenRefreshService";

type Role = "user" | "admin";

interface RegisterData {
  name: string;
  surname: string;
  email: string;
  password: string;
  captchaToken?: string;
}

interface LoginData {
  email: string;
  password: string;
}

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

// Helper: Uruchamia odświeżanie tokena
const setupTokenRefresh = (expiresAt: number) => {
  if (!expiresAt || expiresAt <= Date.now()) {
    console.warn("Nieprawidłowy lub wygasły expiresAt:", expiresAt);
    return;
  }

  // Ustaw buffer na 5 minut przed wygaśnięciem
  tokenRefreshService.setRefreshBuffer(5 * 60 * 1000);

  tokenRefreshService.setupTokenRefresh(expiresAt, async () => {
    try {
      console.log("Automatyczne odświeżanie tokena...");
      const result = await refreshToken();
      if (refreshToken.fulfilled.match(result)) {
        console.log("Token automatycznie odświeżony");
      } else {
        console.error("Błąd automatycznego odświeżania:", result.payload);
        // W przypadku błędu, czyścimy timer
        tokenRefreshService.clearRefreshTimer();
      }
    } catch (error) {
      console.error("Wyjątek podczas automatycznego odświeżania:", error);
    }
  });
};

// Helper: Czyści timer odświeżania
const clearTokenRefresh = () => {
  tokenRefreshService.clearRefreshTimer();
};

// Helper: Inicjalizuje odświeżanie na podstawie istniejącego tokena
const initializeTokenRefresh = () => {
  const storedExpiresAt = localStorage.getItem("expiresAt");
  if (storedExpiresAt) {
    const expiresAt = parseInt(storedExpiresAt);
    if (expiresAt > Date.now()) {
      console.log("Inicjalizacja odświeżania tokena z localStorage");
      setupTokenRefresh(expiresAt);
    } else {
      console.log("Token w localStorage już wygasł");
      clearTokenRefresh();
    }
  }
};

// Wywołaj inicjalizację przy załadowaniu modułu
if (typeof window !== "undefined") {
  // Opóźnij inicjalizację, aby uniknąć problemów z cyklicznymi zależnościami
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
        // Pobierz wiadomość z backendu (np. "Niepoprawny email lub hasło")
        errorMessage =
          axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      // Przekaż wiadomość do Reducera
      return thunkAPI.rejectWithValue(errorMessage);
    }
  },
);

// Rejestracja usera
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
      console.error("Rejestracja - błąd szczegóły:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      // KLUCZOWA ZMIANA: Poprawna obsługa błędu
      if (error.response?.data?.error) {
        // Backend zwraca { error: "wiadomość" }
        return rejectWithValue(error.response.data.error);
      } else if (error.response?.data?.message) {
        // Lub { message: "wiadomość" }
        return rejectWithValue(error.response.data.message);
      } else if (error.response?.data) {
        // Lub zwykły string
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
      //console.log("RegisterAdmin payload:", data);
      const state = thunkAPI.getState() as { auth: AuthState };
      const token = state.auth.token;

      if (!token) {
        //console.error("Brak tokena w stanie Redux");
        return thunkAPI.rejectWithValue("Brak tokena autoryzacyjnego");
      }

      const response = await api.post("auth/register-admin", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      //console.log("RegisterAdmin success:", response.data);

      return response.data;
    } catch (err) {
      let errorMessage: string = "Wystąpił błąd";
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
// Logout user
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
      return thunkAPI.rejectWithValue("Błąd przy wylogowaniu użytkownika");
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
      return thunkAPI.rejectWithValue("Błąd przy wylogowaniu admina");
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
        return thunkAPI.rejectWithValue("Brak tokena");
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

      let errorMessage = "Nie udało się odświeżyć tokena";
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
    // Nowy reducer do ręcznego ustawienia odświeżania
    setupAutoRefresh(state) {
      if (state.expiresAt && state.expiresAt > Date.now()) {
        setupTokenRefresh(state.expiresAt);
      }
    },
    // Nowy reducer do wyczyszczenia odświeżania
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
          // Uruchom automatyczne odświeżanie
          setupTokenRefresh(action.payload.expiresAt);
        } else {
          state.expiresAt = null;
          clearTokenRefresh();
        }

        // Zapis do localStorage
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
          // automatyczne logowanie po rejestracji
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
        //state.error = action.error.message || "Błąd rejestracji";
        state.error = (action.payload as string) || "Registration failed";
        clearTokenRefresh();
      })

      // REGISTER ADMIN — nie nadpisujemy auth (tylko status/error)
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
          "Błąd rejestracji admina";
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
        state.error = (action.payload as string) || "Błąd przy wylogowaniu";

        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("expiresAt");

        // Wyczyść timer odświeżania
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
            ? "Sesja wygasła. Zaloguj się ponownie."
            : "Błąd autoryzacji";
        state.status = "failed";

        clearTokenRefresh();
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.expiresAt = action.payload.expiresAt;

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("expiresAt", action.payload.expiresAt.toString());

        console.log("Token odświeżony");

        // Ponownie ustaw timer odświeżania z nowym expiresAt
        if (action.payload.expiresAt) {
          setupTokenRefresh(action.payload.expiresAt);
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        const errorMessage = action.payload as string;

        // Zapisujemy błąd aby wyświetlić użytkownikowi
        state.error = `Nie udało się odświeżyć sesji: ${errorMessage}`;
        state.status = "failed";

        // Log dla developera
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
            // Możesz dodać automatyczne wylogowanie po błędzie
            //thunkAPI.dispatch(logoutUser());
          }, 5000);
        }
      });
  },
});
export const { clearMessages, setupAutoRefresh, clearAutoRefresh, clearError } =
  authSlice.actions;
export default authSlice.reducer;
