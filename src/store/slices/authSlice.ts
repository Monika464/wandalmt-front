import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

interface User {
  _id: string;
  name: string;
  surname: string;
  email: string;
  role: "user" | "admin";
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
  error: null,
};

// Logowanie
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }) => {
    console.log("Logging in with credentials:", credentials);
    const res = await api.post("/login", credentials);
    console.log("Login response data:", res.data);
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
    const res = await api.post("/register", newUser);
    return res.data; // { user, token }
  }
);

// Wylogowanie
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState }) => {
    try {
      const state = getState() as { auth: AuthState };
      console.log("Current auth state:", state);
      const token = state.auth.token;
      console.log("Logging out with token:", token);

      if (!token) throw new Error("Brak tokena");
      const endpoint =
        state.auth.user?.role === "admin" ? "/logout-admin" : "/logout";

      await api.post(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return null;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }
);

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
        // automatyczne logowanie po rejestracji
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        // Zapis do localStorage
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Błąd rejestracji";
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = "idle";
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      });
  },
});

export default authSlice.reducer;
