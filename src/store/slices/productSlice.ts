import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../utils/api"; // axios instance
import type { Product } from "../../types";

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
};

// Thunky do API
export const fetchProducts = createAsyncThunk(
  "admin/products/fetchAll",
  async () => {
    const res = await api.get("/admin/products");
    console.log("Fetched products:", res.data);
    return res.data as Product[];
  }
);

export const createProduct = createAsyncThunk(
  "products/create",
  async (productData: Product) => {
    const res = await api.post("/admin/products", productData);
    return res.data;
  }
);

export const editProduct = createAsyncThunk(
  "products/edit",
  async ({ id, productData }: { id: string; productData: Product }) => {
    const res = await api.put(`/admin/products/${id}`, productData);
    return res.data;
  }
);

// 📌 Usuwanie produktu
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id: string, { getState }) => {
    console.log("Deleting product with id:", id);

    const state = getState() as { auth?: { token?: string } }; // Replace with RootState if available
    const token = state.auth?.token; // 🔹 zakładam, że masz slice auth

    await api.delete(`/admin/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return id;
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProducts.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.loading = false;
          state.products = action.payload;
        }
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching products";
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })

      // 📌 editProduct
      .addCase(editProduct.fulfilled, (state, action) => {
        state.products = state.products.map((prod) =>
          prod._id === action.payload._id ? action.payload : prod
        );
      })

      // 📌 deleteProduct
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (prod) => prod._id !== action.payload
        );
      });
  },
});

export const { clearSelected } = productSlice.actions;
export default productSlice.reducer;
