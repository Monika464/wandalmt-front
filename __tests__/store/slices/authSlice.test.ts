// __tests__/store/slices/authSlice.test.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer, {
  logoutUser,
  logoutAdmin,
} from "../../../src/store/slices/authSlice";

// Mock console.error aby nie zaśmiecał outputu testów
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});

// Mock api - UPROŚĆ
jest.mock("../../../src/utils/api", () => {
  const mockPost = jest.fn();
  return {
    __esModule: true,
    default: {
      post: mockPost,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    },
    setStore: jest.fn(),
  };
});

// Zaimportuj mockowany api
import api from "../../../src/utils/api";

describe("authSlice - logout actions", () => {
  // Mock localStorage przed wszystkimi testami
  beforeAll(() => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("logoutUser", () => {
    it("should clear user state on successful logout", async () => {
      // Mock successful API call
      (api.post as jest.Mock).mockResolvedValue({
        data: { message: "Logged out" },
      });

      // Store z zalogowanym użytkownikiem
      const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: {
            user: {
              _id: "123",
              name: "John",
              surname: "Doe",
              email: "john@test.com",
              role: "user" as const,
            },
            token: "user-token-123",
            expiresAt: Date.now() + 3600000,
            loading: false,
            success: null,
            error: null,
            status: "succeeded",
          },
        } as any,
      });

      // Sprawdź stan przed wylogowaniem
      const beforeState = store.getState().auth;
      expect(beforeState.user).not.toBeNull();
      expect(beforeState.token).toBe("user-token-123");

      // Wykonaj wylogowanie
      await store.dispatch(logoutUser());

      // Sprawdź stan po wylogowaniu
      const afterState = store.getState().auth;
      expect(afterState.user).toBeNull();
      expect(afterState.token).toBeNull();
      expect(afterState.expiresAt).toBeNull();
      expect(afterState.status).toBe("idle");

      // Sprawdź czy API zostało wywołane
      expect(api.post).toHaveBeenCalledWith(
        "/auth/logout",
        {},
        { headers: { Authorization: "Bearer user-token-123" } }
      );

      // Sprawdź czy localStorage zostało wyczyszczone
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
      expect(localStorage.removeItem).toHaveBeenCalledWith("token");
      expect(localStorage.removeItem).toHaveBeenCalledWith("expiresAt");
    });

    it("should clear state even when API fails", async () => {
      // Mock failed API
      (api.post as jest.Mock).mockRejectedValue(new Error("Network error"));

      const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: {
            user: {
              _id: "123",
              name: "Test",
              surname: "User",
              email: "test@test.com",
              role: "user" as const,
            },
            token: "token-123",
            expiresAt: Date.now() + 3600000,
            loading: false,
            success: null,
            error: null,
            status: "succeeded",
          },
        } as any,
      });

      await store.dispatch(logoutUser());

      const state = store.getState().auth;
      expect(state.user).toBeNull(); // ← TO MUSI BYĆ NULL!
      expect(state.token).toBeNull();
      expect(state.expiresAt).toBeNull();
    });
  });
});
