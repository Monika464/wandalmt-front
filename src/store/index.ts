import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import productReducer from "./slices/productSlice";
import resourceReducer from "./slices/resourceSlice";
import productPublicReducer from "./slices/productPublicSlice";
import resourcePublicReducer from "./slices/resourcePublicSlice";
import cartReducer from "./slices/cartSlice";
import ordersReducer from "./slices/orderSlice";
import emailReducer from "./slices/emailSlice";
import userprofileSlice from "./slices/userprofileSlice";
import videoReducer from "./slices/videoSlice";
import progressReducer from "./slices/progressSlice";
import currencySlice from "./slices/currencySlice";
import i18nReducer from "./slices/i18nSlice";

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
    email: emailReducer,
    userprofile: userprofileSlice,
    video: videoReducer,
    progress: progressReducer,
    currency: currencySlice,
    i18n: i18nReducer,
  },
  devTools: true,
  // devTools: {
  //   trace: true,
  //   traceLimit: 25,
  // },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
