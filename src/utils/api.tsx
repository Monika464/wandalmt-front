import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/auth", // zmień na adres swojego backendu
});

console.log("API baseURL:", api.defaults.baseURL);

export default api;
