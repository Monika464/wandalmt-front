import axios from "axios";

import { logoutAdmin, logoutUser } from "../store/slices/authSlice";

let storeInstance: any = null;

export function setStore(store: any) {
  storeInstance = store;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Interceptor na odpowiedzi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && storeInstance) {
      const state = storeInstance.getState();
      const user = state.auth.user;
      if (user?.role === "admin") {
        storeInstance.dispatch(logoutAdmin());
      } else {
        storeInstance.dispatch(logoutUser());
      }
    }
    return Promise.reject(error);
  },
);

console.log("API baseURL:", api.defaults.baseURL);

export default api;
