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
    // Zapobiegaj wielokrotnemu uruchamianiu
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    // Sprawdź czy użytkownik jest zalogowany
    if (!user || !token) {
      isCheckingRef.current = false;
      return;
    }

    // Sprawdź czy token wygasł
    if (expiresAt && Date.now() > expiresAt) {
      console.log("Token wygasł - automatyczne wylogowanie");
      if (user.role === "admin") {
        dispatch(logoutAdmin());
      } else {
        dispatch(logoutUser());
      }
      isCheckingRef.current = false;
      return;
    }

    // Jeśli token jest ważny, ustaw timer odświeżania
    if (expiresAt && expiresAt > Date.now()) {
      // Ustaw timer na odświeżenie tokena
      tokenRefreshService.setupTokenRefresh(expiresAt, () => {
        // Callback wywoływany gdy token ma być odświeżony
        if (user && token) {
          dispatch(refreshToken())
            .unwrap()
            .then(() => {
              console.log("Token odświeżony automatycznie");
            })
            .catch((error) => {
              console.error("Nie udało się odświeżyć tokena:", error);
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

  // Dodatkowe funkcje zwracane przez hook
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
