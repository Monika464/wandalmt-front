// store/slices/cartSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "../../types/types";

interface CartState {
  items: CartItem[];
  lastCleared: string | null; // Dodajemy timestamp ostatniego czyszczenia
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
        // Aktualizuj też imageUrl jeśli dostarczono
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

      // Kompletne czyszczenie wszystkich śladów koszyka
      try {
        // 1. Wyczyść główny koszyk
        localStorage.removeItem("cart");

        // 2. Wyczyść dane płatności
        localStorage.removeItem("cartCheckoutData");

        // 3. Wyczyść dane sesji Stripe jeśli istnieją
        localStorage.removeItem("stripe_checkout_session");
        localStorage.removeItem("stripe_session_id");

        // 4. Zapisz timestamp czyszczenia
        localStorage.setItem("cart_last_cleared", new Date().toISOString());

        // 5. Wyczyść sessionStorage też
        sessionStorage.removeItem("cart");
        sessionStorage.removeItem("cart_temp");

        console.log("✅ CartSlice: Cart cleared from all storage");
      } catch (err) {
        console.error("❌ CartSlice: Error clearing cart storage:", err);
      }
    },

    // Nowa akcja: wymuś czyszczenie z dodatkowymi opcjami
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
          // Ignoruj błędy dla poszczególnych kluczy
        }
      });

      // Zapisz timestamp
      localStorage.setItem("cart_last_cleared", new Date().toISOString());

      // Dispatch custom event dla innych komponentów
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

    // Dodaj produkty z powrotem do koszyka (np. po anulowaniu płatności)
    restoreCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      saveCartToStorage(state.items);
      console.log(
        `🔄 CartSlice: Restored ${action.payload.length} items to cart`,
      );
    },

    // Resetuj cały stan koszyka (dla logout itp.)
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
  },
});

// Dodaj middleware do logowania (opcjonalnie)
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
} = cartSlice.actions;

export default cartSlice.reducer;
