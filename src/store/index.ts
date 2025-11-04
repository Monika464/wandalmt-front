import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import productReducer from "./slices/productSlice";
import resourceReducer from "./slices/resourceSlice";
import productPublicReducer from "./slices/productPublicSlice";
import resourcePublicReducer from "./slices/resourcePublicSlice";
import cartReducer from "./slices/cartSlice";
import ordersReducer from "./slices/orderSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    products: productReducer,
    productsPublic: productPublicReducer,
    resources: resourceReducer,
    resourcesPublic: resourcePublicReducer,
    cart: cartReducer,
    orders: ordersReducer,
  },
  devTools: {
    trace: true,
    traceLimit: 25,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
