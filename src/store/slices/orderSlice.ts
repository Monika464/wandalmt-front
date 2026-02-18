// src/store/slices/orderSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import api from "../../utils/api";

// ==================== INTERFACE DEFINITIONS ====================

export interface ResourceChapter {
  title: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
}

export interface Resource {
  _id: string;
  title: string;
  description: string;
  chapters?: ResourceChapter[];
  productId: string;
}

export interface ProductDetails {
  _id: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  content: string;
  userId: string;
  // Dodatkowe opcjonalne pola
  productId?: string;
  thumbnail?: string;
  chapters?: ResourceChapter[];
}

export interface OrderProduct {
  productId: string; // <-- zmiana: zamiast product._id
  title: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  imageUrl?: string;
  content?: string;
  description?: string;

  // Pola do częściowych zwrotów
  refunded?: boolean;
  refundedAt?: string;
  refundId?: string;
  refundAmount?: number;
  refundQuantity?: number;
}

export interface Order {
  _id: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  products: OrderProduct[];
  user: {
    email: string;
    userId: string;
    name?: string;
  };
  createdAt: string;
  paidAt?: string;
  status:
    | "pending"
    | "paid"
    | "refunded"
    | "partially_refunded"
    | "failed"
    | "canceled";
  totalAmount: number;

  couponCode?: string;
  discount?: {
    amount: number;
    description: string;
  };

  // Faktura
  requireInvoice?: boolean;
  invoiceData?: {
    companyName: string;
    taxId: string;
    address: string;
  };
  invoiceId?: string;
  invoiceUrl?: string;

  // Dane billingowe
  billingDetails?: {
    name: string;
    email: string;
    phone?: string;
    address: any;
  };

  //Invoice details
  invoiceDetails?: {
    invoicePdf?: string;
    invoiceNumber?: string;
    invoiceDate?: string;
  };

  // Zasoby użytkownika
  userResources?: Resource[];

  // Zwrot (całkowity)
  refundedAt?: string;
  refundId?: string | null;
  refundAmount?: number;

  // Częściowe zwroty
  partialRefunds?: Array<{
    refundId: string;
    amount: number;
    createdAt: string;
    reason?: string;
    products: Array<{
      productId: string;
      quantity: number;
      amount: number;
    }>;
  }>;
}

interface OrderState {
  userOrders: Order[];
  allOrders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  refundLoading: { [orderId: string]: boolean };
  partialRefundLoading: { [orderId: string]: boolean };
}

const initialState: OrderState = {
  userOrders: [],
  allOrders: [],
  currentOrder: null,
  loading: false,
  error: null,
  refundLoading: {},
  partialRefundLoading: {},
};

interface RejectValue {
  message: string;
}

interface Chapter {
  title: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
}

export const selectUserProducts = (state: RootState) => {
  const userOrders = state.orders.userOrders;

  // Filtruj zamówienia aktywne (paid lub partially_refunded)
  const activeOrders = userOrders.filter(
    (order) => order.status === "paid" || order.status === "partially_refunded",
  );

  const products: any[] = [];
  const productIds = new Set();

  activeOrders.forEach((order) => {
    order.products.forEach((item) => {
      // Pomiń w pełni zwrócone produkty
      if ((item.refundQuantity || 0) >= item.quantity) return;

      const productId = item.productId?.toString();
      const imageUrl = item.imageUrl || "/placeholder-product.png";
      const chapters: Chapter[] = [];

      if (productId && !productIds.has(productId)) {
        productIds.add(productId);
        products.push({
          id: productId,
          title: item.title,
          imageUrl: imageUrl,
          description: item.description || "",
          purchasedDate: order.createdAt,
          chapters: chapters,
          orderId: order._id,
          isPartiallyRefunded: (item.refundQuantity || 0) > 0,
          refundedQuantity: item.refundQuantity || 0,
          originalQuantity: item.quantity,
        });
      }
    });
  });

  return products;
};
// ==================== ASYNC THUNKS ====================

// 🔹 Zamówienia użytkownika
export const fetchUserOrders = createAsyncThunk<
  any[],
  void,
  { state: RootState }
>("orders/fetchUserOrders", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await api.get("/api/orders/user", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data.orders) {
      return res.data.orders; // zwracamy tylko tablicę zamówień
    }

    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// 🔹 Wszystkie zamówienia (admin)
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

// 🔹 Pojedyncze zamówienie
export const fetchOrderById = createAsyncThunk<
  Order,
  string,
  { state: RootState }
>("orders/fetchOrderById", async (orderId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await api.get(`/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// 🔹 ZWROT CAŁKOWITY całego zamówienia
export const refundOrder = createAsyncThunk<
  { order: Order; message: string },
  string, // id zamówienia
  { state: RootState; rejectValue: RejectValue }
>("orders/refundOrder", async (orderId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await api.post(
      `/api/orders/refund/${orderId}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// 🔹 ZWROT CZĘŚCIOWY - konkretnych produktów
export const partialRefundOrder = createAsyncThunk<
  { order: Order; message: string },
  {
    orderId: string;
    refundItems: Array<{
      productId: string;
      quantity: number; // ile sztuk zwrócić
      reason?: string;
    }>;
  },
  { state: RootState; rejectValue: RejectValue }
>("orders/partialRefundOrder", async ({ orderId, refundItems }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await api.post(
      `/api/orders/refund/${orderId}/partial`,
      { refundItems },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ==================== SLICE ====================

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // 🔹 Dodaj nowe zamówienie po zakupie
    addNewOrder: (state, action: PayloadAction<Order>) => {
      // Sprawdź czy już istnieje
      const existingIndex = state.userOrders.findIndex(
        (order) => order._id === action.payload._id,
      );

      if (existingIndex >= 0) {
        state.userOrders[existingIndex] = action.payload;
      } else {
        state.userOrders.unshift(action.payload);
      }
      state.currentOrder = action.payload;
    },

    // 🔹 Ustaw aktualne zamówienie
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },

    // 🔹 Aktualizuj pojedyncze zamówienie
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.userOrders.findIndex(
        (o) => o._id === action.payload._id,
      );
      if (index >= 0) {
        state.userOrders[index] = action.payload;
      }

      const allIndex = state.allOrders.findIndex(
        (o) => o._id === action.payload._id,
      );
      if (allIndex >= 0) {
        state.allOrders[allIndex] = action.payload;
      }

      if (state.currentOrder?._id === action.payload._id) {
        state.currentOrder = action.payload;
      }
    },

    // 🔹 Wyczyść błąd
    clearError: (state) => {
      state.error = null;
    },

    // 🔹 Wyczyść stan (np. przy wylogowaniu)
    clearOrders: (state) => {
      state.userOrders = [];
      state.allOrders = [];
      state.currentOrder = null;
      state.error = null;
    },

    // 🔹 Ustaw loading dla konkretnego zamówienia (refund)
    setRefundLoading: (
      state,
      action: PayloadAction<{ orderId: string; loading: boolean }>,
    ) => {
      state.refundLoading[action.payload.orderId] = action.payload.loading;
    },

    // 🔹 Ustaw loading dla częściowego refundu
    setPartialRefundLoading: (
      state,
      action: PayloadAction<{ orderId: string; loading: boolean }>,
    ) => {
      state.partialRefundLoading[action.payload.orderId] =
        action.payload.loading;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔹 User orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 All orders (admin)
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 Single order
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        //state.error = action.payload as string;
        state.error =
          (action.payload as RejectValue)?.message ||
          action.error.message ||
          "Wystąpił błąd";
      })

      // 🔹 Full refund
      .addCase(refundOrder.pending, (state, action) => {
        state.refundLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(refundOrder.fulfilled, (state, action) => {
        state.refundLoading[action.meta.arg] = false;

        // Aktualizacja zamówienia
        const refundedOrder = action.payload.order;
        state.userOrders = state.userOrders.map((order) =>
          order._id === refundedOrder._id ? refundedOrder : order,
        );

        state.allOrders = state.allOrders.map((order) =>
          order._id === refundedOrder._id ? refundedOrder : order,
        );

        if (state.currentOrder?._id === refundedOrder._id) {
          state.currentOrder = refundedOrder;
        }
      })
      .addCase(refundOrder.rejected, (state, action) => {
        state.refundLoading[action.meta.arg] = false;
        state.error =
          (action.payload as RejectValue)?.message ||
          action.error.message ||
          "Błąd zwrotu";
        //state.error = action.payload as string;
      })

      // 🔹 Partial refund
      .addCase(partialRefundOrder.pending, (state, action) => {
        state.partialRefundLoading[action.meta.arg.orderId] = true;
        state.error = null;
      })
      .addCase(partialRefundOrder.fulfilled, (state, action) => {
        state.partialRefundLoading[action.meta.arg.orderId] = false;

        // Aktualizacja zamówienia
        const updatedOrder = action.payload.order;
        state.userOrders = state.userOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order,
        );

        state.allOrders = state.allOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order,
        );

        if (state.currentOrder?._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(partialRefundOrder.rejected, (state, action) => {
        state.partialRefundLoading[action.meta.arg.orderId] = false;
        //state.error = action.payload as string;
        state.error =
          (action.payload as RejectValue)?.message ||
          action.error.message ||
          "Błąd zwrotu";
      });
  },
});

// ==================== SELECTORS ====================

export const selectUserOrders = (state: RootState) => state.orders.userOrders;
export const selectAllOrders = (state: RootState) => state.orders.allOrders;
export const selectCurrentOrder = (state: RootState) =>
  state.orders.currentOrder;
export const selectOrderLoading = (state: RootState) => state.orders.loading;
export const selectOrderError = (state: RootState) => state.orders.error;
export const selectRefundLoading = (orderId: string) => (state: RootState) =>
  state.orders.refundLoading[orderId] || false;
export const selectPartialRefundLoading =
  (orderId: string) => (state: RootState) =>
    state.orders.partialRefundLoading[orderId] || false;

// Helper do obliczania dostępnych do zwrotu produktów
export const selectRefundableProducts =
  (orderId: string) => (state: RootState) => {
    const order = state.orders.userOrders.find((o) => o._id === orderId);
    if (!order) return [];

    return order.products
      .filter((product) => {
        // Sprawdź czy produkt nie jest w pełni zwrócony
        const refundedQuantity = product.refundQuantity || 0;
        return product.quantity > refundedQuantity;
      })
      .map((product) => ({
        ...product,
        availableToRefund: product.quantity - (product.refundQuantity || 0),
        refundAmountPerUnit: product.product.price,
      }));
  };

// ==================== EXPORTS ====================

export const {
  addNewOrder,
  setCurrentOrder,
  updateOrder,
  clearError,
  clearOrders,
  setRefundLoading,
  setPartialRefundLoading,
} = orderSlice.actions;

export default orderSlice.reducer;
