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
  _id?: string;
  number: number;
  title: string;
  description?: string;
  videoId?: string;
}

export interface IResource {
  _id?: string;
  title: string;
  description: string;
  content: string;
  //videoUrl?: string;
  productId: string;
  chapters: IChapter[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IResourceListResponse {
  items: IResource[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductItemProps extends Product {
  //resource: IResource | null;
  onEdit: () => void;
  //onCreateResource: () => void;
  // onEditResource: (resource: IResource) => void;
  //onViewResource: () => void;
}
export interface ProductPublicItemProps extends Product {
  _id: string;
}

// typ do tworzenia (bez id)
export type NewProduct = Omit<Product, "_id">;
