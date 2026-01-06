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

export type NewProduct = Omit<Product, "_id">;

export interface IChapter {
  _id?: string;
  number: number;
  title: string;
  description?: string;
  bunnyVideoId?: string;
  videoId?: string;
  video?: {
    // Opcjonalne szczegóły video (jeśli backend populuje)
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
  // dodaj inne pola które masz w bazie danych
}

// declare global {
//   // Dla kompatybilności z NodeJS.Timeout w przeglądarce
//   interface Timeout {}
//   interface Interval {}
// }
