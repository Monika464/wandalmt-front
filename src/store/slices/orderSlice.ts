// src/store/slices/orderSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import type { RootState } from "../index";
import api from "../../utils/api";

export interface OrderProduct {
  product: {
    _id: string;
    title: string;
    price: number;
    description: string;
    imageUrl: string;
    content: string;
    userId: string;
  };
  quantity: number;
}
export interface ResourceChapter {
  title: string;
  content?: string;
  videoUrl?: string;
}

export interface Resource {
  _id: string;
  title: string;
  description: string;
  chapters?: ResourceChapter[];
}

export interface Order {
  _id: string;
  stripeSessionId: string;
  products: OrderProduct[];
  user: { email: string; userId: string };
  createdAt: string;
  userResources?: Resource[];
  refundedAt?: string;
  refundId?: string | null;
}

interface OrderState {
  userOrders: Order[];
  allOrders: Order[];
  loading: boolean;
  error: string | null;
  userProfile?: any;
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

// src/store/slices/orderSlice.ts
export const refundOrder = createAsyncThunk<
  any,
  string, // id zamówienia
  { state: RootState }
>("orders/refundOrder", async (orderId, thunkAPI) => {
  console.log("Initiating refund for orderId:", orderId);
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await api.post(
      `/api/orders/refund/${orderId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("Refund response data:", res.data);
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
      })
      .addCase(refundOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(refundOrder.fulfilled, (state, action) => {
        state.loading = false;
        // aktualizacja statusu lokalnie
        const refundedOrder = action.payload.order;
        state.userOrders = state.userOrders.map((order) =>
          order._id === refundedOrder._id ? refundedOrder : order
        );
      })
      .addCase(refundOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default orderSlice.reducer;
