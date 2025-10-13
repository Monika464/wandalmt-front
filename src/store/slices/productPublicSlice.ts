import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Product } from "../../types";
import api from "../../utils/api";

interface ProductState {
  products: Product[];
  byId: Record<string, Product>;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  byId: {},
  loading: false,
  error: null,
};

// export const fetchProducts = createAsyncThunk(
//   "admin/products/fetchAll",
//   async () => {
//     const res = await api.get("/products");
//     //console.log("Fetched products:", res.data);
//     return res.data as Product[];
//   }
// );
// export const fetchProducts = createAsyncThunk(
//   "products/fetchPublic",
//   async ({ search }: { search?: string }) => {
//     const response = await api.get(`/products/${search}`, {
//       params: { q: search }, // ✅ zmiana tu
//     });
//     return response.data;
//   }
// );

export const fetchProducts = createAsyncThunk<
  Product[],
  { search?: string } | void
>("products/fetchAll", async (args) => {
  const search = args?.search ?? ""; // bezpieczne pobranie
  console.log("search", search);

  const searchParams = new URLSearchParams();
  if (search) searchParams.set("q", search);

  const queryString = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";

  const res = await api.get(`/products${queryString}`);
  console.log("res", res.data);
  return res.data as Product[];
});

//FETCH SINGLE PRODUCT
export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id: string) => {
    const res = await api.get(`products/${id}`);
    return res.data as Product;
  }
);

const productPublicSlice = createSlice({
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
          console.log("✅ fetchProducts.fulfilled został wywołany");
          console.log("📦 Dane produktów:", action.payload);
          state.loading = false;
          state.products = action.payload;
        }
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching products";
      })

      //fetch single product

      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        const product = action.payload;
        if (product && product._id) {
          state.byId[product._id] = product;
        }
        //state.status = "succeeded";
        state.loading = false;
        state.error = null;
      })

      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error fetching product";
      });
  },
});

export default productPublicSlice.reducer;
