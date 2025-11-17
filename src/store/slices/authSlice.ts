import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

import axios, { AxiosError } from "axios";

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
}

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  loading: false,
  success: null,
  error: null,
  status: "idle",
};

interface BackendError {
  error?: string;
  message?: string;
}

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await api.post("/auth/login", credentials);
      return res.data; // { user, token }
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
  }
);

// // Logowanie
// export const login = createAsyncThunk(
//   "auth/login",
//   async (credentials: { email: string; password: string }) => {
//     try {
//        const res = await api.post("/auth/login", credentials);
//     //console.log("Login response data:", res.data);
//     return res.data; // { user, token }
//     } catch (error) {
//       let errorMessage: string = "Wystąpił błąd podczas logowania";
//     }

//   }
// );

// Rejestracja usera
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (newUser: {
    name: string;
    surname: string;
    email: string;
    password: string;
    captchaToken: string | null;
  }) => {
    const res = await api.post("/auth/register", newUser);
    return res.data; // { user, token }
  }
);

// REGISTER ADMIN

export const registerAdmin = createAsyncThunk(
  "auth/registerAdmin",
  async (
    data: { name: string; surname: string; email: string; password: string },
    thunkAPI
  ) => {
    try {
      console.log("RegisterAdmin payload:", data);
      const state = thunkAPI.getState() as { auth: AuthState };
      const token = state.auth.token;

      if (!token) {
        console.error("Brak tokena w stanie Redux");
        return thunkAPI.rejectWithValue("Brak tokena autoryzacyjnego");
      }

      // Wyślij żądanie z tokenem w nagłówku
      const response = await api.post("auth/register-admin", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("RegisterAdmin success:", response.data);

      return response.data;
      //const response = await api.post("/register-admin", data);

      // ważne: NIE zapisuj tu nowego admina do localStorage
    } catch (err) {
      // Typowanie błędu jako AxiosError<BackendError>
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

      console.error("RegisterAdmin error:", errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return;
    } catch (error) {
      console.error("Logout user error:", error);
      return thunkAPI.rejectWithValue("Błąd przy wylogowaniu użytkownika");
    }
  }
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return;
    } catch (error) {
      console.error("Logout admin error:", error);
      return thunkAPI.rejectWithValue("Błąd przy wylogowaniu admina");
    }
  }
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
      return thunkAPI.rejectWithValue("unauthorized");
    }
  }
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
  },
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
        //state.error = null;

        // Zapis do localStorage
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
        //state.error = action.error.message || "Błąd logowania";
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
          //state.error = null;
          // Zapis do localStorage
          localStorage.setItem("user", JSON.stringify(action.payload.user));
          localStorage.setItem("token", action.payload.token);
        } else {
          state.error = null;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Błąd rejestracji";
      })

      // REGISTER ADMIN — nie nadpisujemy auth (tylko status/error)
      .addCase(registerAdmin.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerAdmin.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
        // nie zmieniamy state.user ani token
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.status = "failed";
        // action.payload może zawierać string dzięki rejectWithValue
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Błąd rejestracji admina";
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        Object.assign(state, initialState);
        //state.user = null;
        //state.token = null;
        //state.status = "idle";
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        Object.assign(state, initialState);
        //state.user = null;
        //state.token = null;
        //state.status = "idle";
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
      });
  },
});
export const { clearMessages } = authSlice.actions;
export default authSlice.reducer;
