export interface BackendError {
  message: string;
  [key: string]: unknown;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  active: boolean;
}

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
  videoUrl?: string;
  productId: string; // ID produktu powiązanego z tym resource
  chapters: IChapter[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductItemProps extends Product {
  resource: IResource | null;
  onEdit: () => void;
  //onCreateResource: () => void;
  // onEditResource: (resource: IResource) => void;
  //onViewResource: () => void;
}

// typ do tworzenia (bez id)
export type NewProduct = Omit<Product, "_id">;
