// src/store/slices/orderSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "../index";
import api from "../../utils/api";

export interface OrderProduct {
  product: {
    title: string;
    price: number;
    description: string;
    imageUrl: string;
    content: string;
    userId: string;
  };
  quantity: number;
}

export interface Order {
  _id: string;
  stripeSessionId: string;
  products: OrderProduct[];
  user: { email: string; userId: string };
  createdAt: string;
}

interface OrderState {
  userOrders: Order[];
  allOrders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  userOrders: [],
  allOrders: [],
  loading: false,
  error: null,
};

// 🔹 Zamówienia użytkownika
export const fetchUserOrders = createAsyncThunk<
  Order[],
  void,
  { state: RootState }
>("orders/fetchUserOrders", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await api.get("/api/orders/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// 🔹 Zamówienia dla admina
export const fetchAllOrders = createAsyncThunk<
  Order[],
  void,
  { state: RootState }
>("orders/fetchAllOrders", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await api.get("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // all orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default orderSlice.reducer;
