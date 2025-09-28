import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

type Role = "user" | "admin";

interface User {
  _id: string;
  name: string;
  surname: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  status: "idle",
  error: null,
};

// Logowanie
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }) => {
    //console.log("Logging in with credentials:", credentials);
    const res = await api.post("/auth/login", credentials);
    //console.log("Login response data:", res.data);
    return res.data; // { user, token }
  }
);

// Rejestracja usera
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (newUser: {
    name: string;
    surname: string;
    email: string;
    password: string;
  }) => {
    const res = await api.post("/auth/register", newUser);
    return res.data; // { user, token }
  }
);

// REGISTER ADMIN — używa tokenu z getState i NIE ma efektu logowania

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
      const response = await api.post("/register-admin", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("RegisterAdmin success:", response.data);

      return response.data;
      //const response = await api.post("/register-admin", data);

      // ważne: NIE zapisuj tu nowego admina do localStorage
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Nieznany błąd";

      console.error("RegisterAdmin error:", errorMessage, err.response);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Logout thunk
export const logout = createAsyncThunk("auth/logout", async () => {
  // Optionally, you can perform API logout here

  return;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;

        // Zapis do localStorage
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Błąd logowania";
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
          state.error = null;
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
      .addCase(logout.fulfilled, (state) => {
        console.log("Logout reducer triggered");
        state.user = null;
        state.token = null;
        state.status = "idle";
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      });
  },
});

export default authSlice.reducer;
//export { registerUser, registerAdmin, login, logout };
