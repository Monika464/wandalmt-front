import type { AxiosError } from "axios";

export interface BackendError {
  message: string;
  [key: string]: unknown;
}

export interface User {
  name: string;
  email: string;
  role: "user" | "admin";
}
