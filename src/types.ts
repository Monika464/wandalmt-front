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

export interface IChapter {
  _id?: string; // MongoDB ObjectId jako string
  title: string;
  description?: string;
  videoUrl?: string;
}

export interface IResource {
  _id?: string; // MongoDB ObjectId jako string
  title: string;
  content: string;
  imageUrl: string;
  videoUrl?: string;
  productId: string; // ID produktu powiązanego z tym resource
  chapters: IChapter[];
  createdAt?: string;
  updatedAt?: string;
}

// typ do tworzenia (bez id)
export type NewProduct = Omit<Product, "_id">;
