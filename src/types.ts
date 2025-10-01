import type { AxiosError } from "axios";
import { Interface } from "node:readline";

export interface BackendError {
  message: string;
  [key: string]: unknown;
}

export interface User {
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  content: string;
  resourceId?: string;
}
