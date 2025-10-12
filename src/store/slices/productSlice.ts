import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";

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

export const fetchProducts = createAsyncThunk<Product[], { search?: string }>(
  "admin/products/fetchAll",
  async ({ search } = {}, thunkApi) => {
    try {
      const searchParams = new URLSearchParams();

      if (search) searchParams.set("q", search);

      const queryString = searchParams.toString()
        ? `?${searchParams.toString()}`
        : "";

      // użycie authorizedRequest
      const data = await authorizedRequest<Product[]>(thunkApi, {
        url: `/admin/products${queryString}`,
        method: "GET",
      });

      return data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }
);

//FETCH SINGLE PRODUCT
export const fetchProductById = createAsyncThunk<
  Product, // typ zwracany
  string // typ argumentu (id produktu)
>("products/fetchById", async (id, thunkApi) => {
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
});

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
