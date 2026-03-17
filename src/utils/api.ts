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

// import axios from "axios";

// import { logoutAdmin, logoutUser } from "../store/slices/authSlice";

// let storeInstance: any = null;

// export function setStore(store: any) {
//   storeInstance = store;
// }

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
// console.log("🔧 ENVIRONMENT:", import.meta.env.MODE);
// console.log("🔧 VITE_API_URL from env:", import.meta.env.VITE_API_URL);
// console.log("🔧 Final API_URL:", API_URL);

// const api = axios.create({
//   baseURL: API_URL,
//   withCredentials: true,
// });

// // Interceptor na odpowiedzi
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401 && storeInstance) {
//       const state = storeInstance.getState();
//       const user = state.auth.user;
//       if (user?.role === "admin") {
//         storeInstance.dispatch(logoutAdmin());
//       } else {
//         storeInstance.dispatch(logoutUser());
//       }
//     }
//     return Promise.reject(error);
//   },
// );

// api.interceptors.request.use(
//   (config) => {
//     const baseURL = config.baseURL || "undefined";
//     console.log("🚀 Request:", config.method?.toUpperCase(), config.url);
//     console.log("🎯 Full URL:", baseURL + config.url);

//     console.log("📦 Config:", {
//       method: config.method,
//       url: config.url,
//       baseURL: config.baseURL,
//       fullURL: config.baseURL
//         ? config.baseURL + config.url
//         : "baseURL undefined",
//       headers: config.headers,
//     });

//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

// console.log("API baseURL:", api.defaults.baseURL);

// export default api;
