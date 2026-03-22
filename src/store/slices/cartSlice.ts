// store/slices/cartSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "../../types/types";

interface CartState {
  items: CartItem[];
  lastCleared: string | null;
}

const loadCartFromStorage = (): CartItem[] => {
  try {
    const data = localStorage.getItem("cart");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem("cart", JSON.stringify(items));
  } catch (err) {
    console.error("❌ Błąd zapisu koszyka do localStorage:", err);
  }
};

const initialState: CartState = {
  items: loadCartFromStorage(),
  lastCleared: localStorage.getItem("cart_last_cleared") || null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find((i) => i._id === action.payload._id);
      if (existing) {
        existing.quantity += action.payload.quantity || 1;
        // Also update imageUrl if provided
        if (action.payload.imageUrl) {
          existing.imageUrl = action.payload.imageUrl;
        }
      } else {
        state.items.push({
          ...action.payload,
          quantity: action.payload.quantity || 1,
        });
      }
      saveCartToStorage(state.items);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i._id === action.payload);
      if (item) {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items = state.items.filter((i) => i._id !== action.payload);
        }
      }
      saveCartToStorage(state.items);
    },

    clearCart: (state) => {
      console.log("🔄 CartSlice: Clearing cart...");
      state.items = [];
      state.lastCleared = new Date().toISOString();

      // Complete cleaning of all traces of the basket
      try {
        // 1. Clear main basket
        localStorage.removeItem("cart");

        // 2. Clear payment details
        localStorage.removeItem("cartCheckoutData");

        // 3. Clear Stripe session data if present
        localStorage.removeItem("stripe_checkout_session");
        localStorage.removeItem("stripe_session_id");

        // 4. Save cleaning timestamp
        localStorage.setItem("cart_last_cleared", new Date().toISOString());

        // 5. Clear sessionStorage too
        sessionStorage.removeItem("cart");
        sessionStorage.removeItem("cart_temp");

        //console.log("✅ CartSlice: Cart cleared from all storage");
      } catch (err) {
        console.error("❌ CartSlice: Error clearing cart storage:", err);
      }
    },

    // force clean with additional options
    forceClearCart: (
      state,
      action: PayloadAction<{ reason?: string } | undefined>,
    ) => {
      const reason = action.payload?.reason ?? "manual";
      console.log(`🔄 CartSlice: Force clearing cart (reason: ${reason})`);

      state.items = [];
      state.lastCleared = new Date().toISOString();

      // Kompletne czyszczenie
      const storageKeys = [
        "cart",
        "cartCheckoutData",
        "stripe_checkout_session",
        "stripe_session_id",
        "cart_temp",
        "checkout_items",
      ];

      storageKeys.forEach((key) => {
        try {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        } catch (e) {
          // Ignore errors for individual keys
        }
      });

      // Save timestamp
      localStorage.setItem("cart_last_cleared", new Date().toISOString());

      // Dispatch custom event for other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cart:cleared", {
            detail: { reason, timestamp: new Date().toISOString() },
          }),
        );
      }
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      const item = state.items.find((i) => i._id === action.payload.productId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i) => i._id !== action.payload.productId,
          );
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      saveCartToStorage(state.items);
    },

    // Add products back to your cart (e.g. after canceling a payment)
    restoreCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      saveCartToStorage(state.items);
      console.log(
        `🔄 CartSlice: Restored ${action.payload.length} items to cart`,
      );
    },

    // Reset all cart status (for logout etc.)
    resetCart: (state) => {
      state.items = [];
      state.lastCleared = null;

      try {
        localStorage.removeItem("cart");
        localStorage.removeItem("cart_last_cleared");
        sessionStorage.removeItem("cart");
      } catch (err) {
        console.error("❌ CartSlice: Error resetting cart:", err);
      }

      console.log("🔄 CartSlice: Cart fully reset");
    },

    //  removes the product completely, regardless of the quantity
    removeItemCompletely: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      saveCartToStorage(state.items);
      console.log(`🗑️ Product ${action.payload} completely removed from cart`);
    },
  },
});

// Add login middleware (optional)
export const cartMiddleware = (store: any) => (next: any) => (action: any) => {
  if (action.type === "cart/clearCart") {
    console.log("🎯 Cart Middleware: clearCart action detected");
    console.log("Before:", store.getState().cart.items.length, "items");
  }

  const result = next(action);

  if (action.type === "cart/clearCart") {
    console.log("After:", store.getState().cart.items.length, "items");
  }

  return result;
};

export const {
  addToCart,
  removeFromCart,
  clearCart,
  forceClearCart,
  updateQuantity,
  restoreCart,
  resetCart,
  removeItemCompletely,
} = cartSlice.actions;

export default cartSlice.reducer;
