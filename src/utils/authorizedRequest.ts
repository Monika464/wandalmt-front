import axios, { type AxiosRequestConfig } from "axios";
import type { RootState } from "../store"; // lub ścieżka do Twojego store
// lub ścieżka do Twojego store
import api from "./api";

/**
 * Wspólny helper do wykonywania zapytań z autoryzacją i obsługą anulowania.
 */
export async function authorizedRequest<T>(
  thunkApi: any, // przekazujesz { getState, signal, rejectWithValue }
  config: AxiosRequestConfig
): Promise<T> {
  const { getState, signal, rejectWithValue } = thunkApi;
  const state = getState() as RootState;
  const token = state.auth?.token;

  try {
    const res = await api.request<T>({
      ...config,
      headers: {
        ...(config.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
      },
      signal,
    });

    return res.data;
  } catch (error: any) {
    if (axios.isCancel(error) || error.name === "CanceledError") {
      console.warn("Request was cancelled");
      return rejectWithValue("Request cancelled");
    }
    return rejectWithValue(error.response?.data || error.message);
  }
}
