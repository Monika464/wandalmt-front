// hooks/useAuth.ts
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import {
  logoutUser,
  logoutAdmin,
  refreshToken,
} from "../store/slices/authSlice";
import { tokenRefreshService } from "../services/tokenRefreshService";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { expiresAt, user, token, status } = useSelector(
    (state: RootState) => state.auth,
  );
  const isCheckingRef = useRef(false);

  useEffect(() => {
    // Prevent multiple restarts
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    // Check if user is logged in
    if (!user || !token) {
      isCheckingRef.current = false;
      return;
    }

    // Check if token has expired
    if (expiresAt && Date.now() > expiresAt) {
      console.log("Token has expired - automatic logout");
      if (user.role === "admin") {
        dispatch(logoutAdmin());
      } else {
        dispatch(logoutUser());
      }
      isCheckingRef.current = false;
      return;
    }

    // If the token is valid, set a refresh timer
    if (expiresAt && expiresAt > Date.now()) {
      // Set timer for token refresh
      tokenRefreshService.setupTokenRefresh(expiresAt, () => {
        // Callback called when token needs to be refreshed
        if (user && token) {
          dispatch(refreshToken())
            .unwrap()
            .then(() => {
              console.log("Token refreshed automatically");
            })
            .catch((error) => {
              console.error("Failed to refresh token:", error);
            });
        }
      });
    }

    isCheckingRef.current = false;

    // Cleanup function
    return () => {
      tokenRefreshService.clearRefreshTimer();
    };
  }, [dispatch, expiresAt, user, token, status]);

  // Additional functions returned by hook
  const isTokenValid = expiresAt ? Date.now() < expiresAt : false;
  const timeUntilExpiry = expiresAt ? Math.max(0, expiresAt - Date.now()) : 0;

  return {
    isAuthenticated: !!user && !!token,
    isTokenValid,
    timeUntilExpiry,
    user,
    expiresAt,
    isLoading: status === "loading",
  };
};
