import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: {
    trace: true, // pozwala śledzić, skąd wyszła akcja
    traceLimit: 25, // ile kroków w historii
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
