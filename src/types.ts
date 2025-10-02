export interface BackendError {
  message: string;
  [key: string]: unknown;
}

export interface User {
  name: string;
  email: string;
  role: "user" | "admin";
}

// typ pełny (to co zwraca backend)
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  status?: string;
}

// typ do tworzenia (bez id)
export type NewProduct = Omit<Product, "_id">;
