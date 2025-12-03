// hooks/useAutoRefresh.ts
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setupAutoRefresh, clearAutoRefresh } from "../store/slices/authSlice";
import type { RootState } from "../store/index";

export const useAutoRefresh = () => {
  const dispatch = useDispatch();
  const { expiresAt, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token && expiresAt && expiresAt > Date.now()) {
      dispatch(setupAutoRefresh());
    } else {
      dispatch(clearAutoRefresh());
    }

    // Cleanup przy odmontowaniu komponentu
    return () => {
      dispatch(clearAutoRefresh());
    };
  }, [dispatch, token, expiresAt]);
};
