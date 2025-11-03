import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import type { RootState } from "../index"; // <- dostosuj ścieżkę
import { BackendError } from "../../types/BackendError"; // <- możesz utworzyć własny typ np. { message: string }

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
  user: {
    email: string;
    userId: string;
  };
  createdAt: string;
  refundedAt?: string;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
};

// 🔹 1. Pobierz zamówienia użytkownika
export const getUserOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: string }
>("orders/getUserOrders", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("/api/orders/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    let errorMessage = "Błąd pobierania zamówień użytkownika";
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<BackendError>;
      errorMessage = axiosError.response?.data?.message || axiosError.message;
    }
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// 🔹 2. Pobierz wszystkie zamówienia (dla admina)
export const getAllOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: string }
>("orders/getAllOrders", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (err) {
    let errorMessage = "Błąd pobierania wszystkich zamówień";
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<BackendError>;
      errorMessage = axiosError.response?.data?.message || axiosError.message;
    }
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

// 🔹 3. Zwrot zamówienia
export const refundOrder = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>("orders/refundOrder", async (orderId, thunkAPI) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `/api/orders/refund/${orderId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.order;
  } catch (err) {
    let errorMessage = "Błąd podczas zwrotu";
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError<BackendError>;
      errorMessage = axiosError.response?.data?.message || axiosError.message;
    }
    return thunkAPI.rejectWithValue(errorMessage);
  }
});

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrders(state) {
      state.orders = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getUserOrders
      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getUserOrders.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.loading = false;
          state.orders = action.payload;
        }
      )
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Nie udało się pobrać zamówień użytkownika";
      })

      // getAllOrders
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getAllOrders.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.loading = false;
          state.orders = action.payload;
        }
      )
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Nie udało się pobrać zamówień admina";
      })

      // refundOrder
      .addCase(refundOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refundOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(refundOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Nie udało się wykonać zwrotu";
      });
  },
});

export const { clearOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
