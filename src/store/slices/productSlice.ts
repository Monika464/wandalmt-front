import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

import { authorizedRequest } from "../../utils/authorizedRequest";

import type { NewProduct, Product } from "../../types/types";

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

export const fetchProducts = createAsyncThunk<Product[], { search?: string }>(
  "admin/products/fetchAll",
  async ({ search } = {}, thunkApi) => {
    try {
      const searchParams = new URLSearchParams();

      if (search) searchParams.set("q", search);

      const queryString = searchParams.toString()
        ? `?${searchParams.toString()}`
        : "";

      const data = await authorizedRequest<Product[]>(thunkApi, {
        url: `/admin/products${queryString}`,
        method: "GET",
      });

      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },
);

//FETCH SINGLE PRODUCT
export const fetchProductById = createAsyncThunk<Product, string>(
  "products/fetchById",
  async (id, thunkApi) => {
    try {
      const data = await authorizedRequest<Product>(thunkApi, {
        url: `/admin/products/${id}`,
        method: "GET",
      });
      return data;
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      return thunkApi.rejectWithValue(error);
    }
  },
);

export const createProduct = createAsyncThunk<Product, NewProduct>(
  "products/create",
  async (productData: NewProduct, thunkApi) => {
    try {
      const res = await authorizedRequest<{ product: Product }>(thunkApi, {
        url: `/admin/products`,
        method: "POST",
        data: productData,
      });

      return res.product;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  },
);

export const editProduct = createAsyncThunk<
  Product,
  { id: string; productData: Product }
>("products/edit", async ({ id, productData }, thunkApi) => {
  try {
    const res = await authorizedRequest<{ product: Product }>(thunkApi, {
      url: `/admin/products/${id}`,
      method: "PUT",
      data: productData,
    });

    return res.product;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error);
  }
});

export const deleteProduct = createAsyncThunk<string, string>(
  "products/delete",
  async (id, thunkApi) => {
    try {
      await authorizedRequest<void>(thunkApi, {
        url: `/admin/products/${id}`,
        method: "DELETE",
      });

      return id;
    } catch (error: any) {
      return thunkApi.rejectWithValue(error);
    }
  },
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
        },
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching products";
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })

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
          prod._id === action.payload._id ? action.payload : prod,
        );
      })

      // 📌 deleteProduct
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(
          (prod) => prod._id !== action.payload,
        );
      });
  },
});

export default productSlice.reducer;
