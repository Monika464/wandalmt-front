import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import productReducer from "./slices/productSlice";
import resourceReducer from "./slices/resourceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    products: productReducer,
    resources: resourceReducer,
  },
  devTools: {
    trace: true, // pozwala śledzić, skąd wyszła akcja
    traceLimit: 25, // ile kroków w historii
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
