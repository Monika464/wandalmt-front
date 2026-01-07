// store/slices/cartSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem } from "../../types";

interface CartState {
  items: CartItem[];
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
      state.items = [];
      saveCartToStorage([]);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i._id === action.payload.productId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (i) => i._id !== action.payload.productId
          );
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      saveCartToStorage(state.items);
    },
  },
});

export const { addToCart, removeFromCart, clearCart, updateQuantity } =
  cartSlice.actions;
export default cartSlice.reducer;

// import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// interface CartItem {
//   _id: string;
//   title: string;
//   price: number;
//   quantity: number;
// }

// interface CartState {
//   items: CartItem[];
// }

// // 🧩 Wczytywanie i zapisywanie koszyka z/do localStorage
// const loadCartFromStorage = (): CartItem[] => {
//   try {
//     const data = localStorage.getItem("cart");
//     return data ? JSON.parse(data) : [];
//   } catch {
//     return [];
//   }
// };

// const saveCartToStorage = (items: CartItem[]) => {
//   try {
//     localStorage.setItem("cart", JSON.stringify(items));
//   } catch (err) {
//     console.error("❌ Błąd zapisu koszyka do localStorage:", err);
//   }
// };

// // 🧩 Stan początkowy
// const initialState: CartState = {
//   items: loadCartFromStorage(),
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     addToCart: (state, action: PayloadAction<CartItem>) => {
//       const existing = state.items.find((i) => i._id === action.payload._id);
//       if (existing) {
//         existing.quantity += 1;
//       } else {
//         state.items.push({ ...action.payload, quantity: 1 });
//       }
//       saveCartToStorage(state.items);
//     },

//     // 🆕 Usuwanie tylko jednej sztuki produktu
//     removeFromCart: (state, action: PayloadAction<string>) => {
//       const item = state.items.find((i) => i._id === action.payload);
//       if (item) {
//         if (item.quantity > 1) {
//           item.quantity -= 1;
//         } else {
//           state.items = state.items.filter((i) => i._id !== action.payload);
//         }
//       }
//       saveCartToStorage(state.items);
//     },

//     clearCart: (state) => {
//       state.items = [];
//       saveCartToStorage([]);
//     },
//   },
// });

// export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
// export default cartSlice.reducer;
