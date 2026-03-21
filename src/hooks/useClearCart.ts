// hooks/useClearCart.ts
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { clearCart, forceClearCart } from "../store/slices/cartSlice";

export const useClearCart = () => {
  const dispatch = useDispatch();

  const clearCartAfterPurchase = useCallback(async () => {
    console.log("🛒 useClearCart: Clearing cart after successful purchase");

    // 1. Clear Redux state
    dispatch(clearCart());

    // 2. Extra cleaning to be sure
    setTimeout(() => {
      try {
        // Delete all keys related to the basket
        const cartRelatedKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.toLowerCase().includes("cart")) {
            cartRelatedKeys.push(key);
          }
        }

        cartRelatedKeys.forEach((key) => {
          localStorage.removeItem(key);
        });

        console.log("✅ useClearCart: Additional cleanup completed");
      } catch (err) {
        console.error("❌ useClearCart: Error in additional cleanup:", err);
      }
    }, 100);

    // 3. Return a promise for async operations
    return Promise.resolve();
  }, [dispatch]);

  return {
    clearCartAfterPurchase,
    forceClearCart: (reason?: string) => dispatch(forceClearCart({ reason })),
  };
};
