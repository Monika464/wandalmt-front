import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../utils/api"; // axios instance
import type { NewProduct, Product } from "../../types";

import { authorizedRequest } from "../../utils/authorizedRequest";

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

// interface ProductState {
//   products: Product[];
//   loading: boolean;
//   error: string | null;
// }

// const initialState: ProductState = {
//   products: [],
//   loading: false,
//   error: null,
// };

// fetch products

export const fetchProducts = createAsyncThunk(
  "admin/products/fetchAll",
  async () => {
    const res = await api.get("/admin/products");
    //console.log("Fetched products:", res.data);
    return res.data as Product[];
  }
);

//FETCH SINGLE PRODUCT
export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id: string, thunkApi) => {
    return await authorizedRequest<Product>(thunkApi, {
      url: `/admin/products/${id}`,
      method: "GET",
    });
  }
);

// export const fetchProductById = createAsyncThunk(
//   "products/fetchById",
//   async (id: string, { getState, rejectWithValue, signal }) => {
//     //console.log("Fetching product by ID:", id);
//     try {
//       const state = getState() as { auth?: { token?: string } };

//       const token = state.auth?.token;
//       //console.log("Token from state product", token);
//       const res = await api.get(`/admin/products/${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         signal,
//       });

//       //console.log("Fetched product by ID:", res.data, res.status);
//       return res.data;
//     } catch (error: any) {
//       if (axios.isCancel(error) || error.name === "CanceledError") {
//         console.warn("Request cancelled");
//         return;
//       }
//       return rejectWithValue(error.message);
//     }
//   }
// );
//create product

export const createProduct = createAsyncThunk<
  Product, // typ zwracany przy sukcesie
  NewProduct // argument thunk
>("products/create", async (productData: NewProduct, thunkApi) => {
  try {
    // używamy authorizedRequest, ale wyciągamy product z odpowiedzi
    const res = await authorizedRequest<{ product: Product }>(thunkApi, {
      url: `/admin/products`,
      method: "POST",
      data: productData,
    });

    return res.product; // <-- tu jest kluczowa różnica
  } catch (error: any) {
    return thunkApi.rejectWithValue(error);
  }
});

// export const createProduct = createAsyncThunk(
//   "products/create",
//   async (productData: NewProduct, { getState, rejectWithValue }) => {
//     try {
//       const state = getState() as { auth?: { token?: string } };
//       const token = state.auth?.token;

//       const res = await api.post("/admin/products", productData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       return res.data.product as Product;
//     } catch (err: any) {
//       console.error(
//         "❌ Error in createProduct thunk:",
//         err.response?.data || err.message
//       );
//       return rejectWithValue(err.response?.data || "Unknown error");
//     }
//   }
// );

// edit product

export const editProduct = createAsyncThunk<
  Product, // typ zwracany przy sukcesie
  { id: string; productData: Product } // argument thunk
>("products/edit", async ({ id, productData }, thunkApi) => {
  try {
    // używamy authorizedRequest
    const res = await authorizedRequest<{ product: Product }>(thunkApi, {
      url: `/admin/products/${id}`,
      method: "PUT",
      data: productData,
    });

    return res.product; // wyciągamy sam obiekt produktu
  } catch (error: any) {
    return thunkApi.rejectWithValue(error);
  }
});

// export const editProduct = createAsyncThunk(
//   "products/edit",
//   async (
//     { id, productData }: { id: string; productData: Product },
//     { getState }
//   ) => {
//     const state = getState() as { auth?: { token?: string } };
//     const token = state.auth?.token;

//     const res = await api.put(`/admin/products/${id}`, productData, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     return res.data.product as Product;
//   }
// );

// 📌 Usuwanie produktu

export const deleteProduct = createAsyncThunk<
  string, // zwracamy id usuniętego produktu
  string // argument thunk – id produktu
>("products/delete", async (id, thunkApi) => {
  try {
    await authorizedRequest<void>(thunkApi, {
      url: `/admin/products/${id}`,
      method: "DELETE",
    });

    return id; // zwracamy id, żeby można było od razu usunąć z listy w reducerze
  } catch (error: any) {
    return thunkApi.rejectWithValue(error);
  }
});

// export const deleteProduct = createAsyncThunk(
//   "products/delete",
//   async (id: string, { getState }) => {
//     console.log("Deleting product with id:", id);

//     const state = getState() as { auth?: { token?: string } };
//     const token = state.auth?.token;

//     await api.delete(`/admin/products/${id}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     return id;
//   }
// );

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
      // .addCase(
      //   fetchProductById.fulfilled,
      //   (state, action: PayloadAction<Product>) => {
      //     state.loading = false;
      //     state.byId[action.payload._id] = action.payload;
      //   }
      // )
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error fetching product";
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

//export const { clearSelected } = productSlice.actions;
export default productSlice.reducer;
