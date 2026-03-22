import axios, { type AxiosRequestConfig } from "axios";
import type { RootState } from "../store";
import api from "./api";

/**
 * Common helper for performing queries with authorization and cancellation support.
 */
export async function authorizedRequest<T>(
  thunkApi: any,
  config: AxiosRequestConfig,
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
