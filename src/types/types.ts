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
  language: "pl" | "en";
}

export type NewProduct = Omit<Product, "_id">;

export interface IChapter {
  _id?: string;
  number: number;
  title: string;
  description?: string;
  bunnyVideoId?: string;
  videoId?: string;
  video?: {
    _id: string;
    bunnyGuid: string;
    title: string;
    thumbnailUrl?: string;
    createdAt: string;
  };
}

export interface IResource {
  _id?: string;
  title: string;
  description: string;
  content: string;
  productId: string;
  chapters: IChapter[];
  createdAt?: string;
  updatedAt?: string;
  language: "pl" | "en";
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

export interface VideoInfo {
  _id: string;
  bunnyGuid: string;
  title: string;
  status: "uploading" | "processing" | "ready" | "error";
  processingProgress?: number;
  thumbnailUrl?: string;
  duration?: number;
  errorMessage?: string;
}

export interface IVideo {
  _id: string;
  title: string;
  bunnyGuid: string;
  fileName?: string;
  thumbnailUrl?: string;
  duration?: number;
  status?: string;
}

export interface CartItem {
  _id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface ImportMetaEnv {
  readonly VITE_BUNNY_LIBRARY_ID: string;
  readonly VITE_API_URL: string;
  // dodaj inne zmienne środowiskowe
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}
