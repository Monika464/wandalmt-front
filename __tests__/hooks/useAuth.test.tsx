// __tests__/hooks/useAuth.test.tsx
import { renderHook, act, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useAuth } from "../../src/hooks/useAuth";
import authReducer from "../../src/store/slices/authSlice";
import type { RootState } from "../../src/store";

// Mock tokenRefreshService
jest.mock("../../src/services/tokenRefreshService", () => ({
  tokenRefreshService: {
    setupTokenRefresh: jest.fn(),
    clearRefreshTimer: jest.fn(),
    isTimerActive: jest.fn(() => false),
  },
}));

// Mock checkTokenExpiry
jest.mock("../../src/utils/authUtils", () => ({
  checkTokenExpiry: jest.fn(),
  formatTimeRemaining: jest.fn(() => "1h 30m"),
  isTokenExpiringSoon: jest.fn(() => false),
}));

const createTestStore = (preloadedState: Partial<RootState["auth"]>) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        expiresAt: null,
        loading: false,
        success: null,
        error: null,
        status: "idle",
        ...preloadedState,
      },
    } as any,
  });
};

describe("useAuth hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return correct values for unauthenticated user", () => {
    const store = createTestStore({});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isTokenValid).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("should return correct values for authenticated user with valid token", () => {
    const mockExpiresAt = Date.now() + 3600000; // 1 hour from now
    const mockUser = {
      _id: "123",
      role: "user" as const,
      name: "John",
      surname: "Doe",
      email: "john@test.com",
    };

    const store = createTestStore({
      user: mockUser,
      token: "fake-token-123",
      expiresAt: mockExpiresAt,
      status: "succeeded",
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.expiresAt).toBe(mockExpiresAt);
  });

  it("should setup token refresh timer when user is authenticated", () => {
    const {
      tokenRefreshService,
    } = require("../../src/services/tokenRefreshService");
    const { checkTokenExpiry } = require("../../src/utils/authUtils");

    // Mock checkTokenExpiry to return false (token valid)
    (checkTokenExpiry as jest.Mock).mockReturnValue(false);

    const mockExpiresAt = Date.now() + 7200000; // 2 hours
    const mockUser = {
      _id: "123",
      role: "admin" as const,
      name: "Admin",
      surname: "User",
      email: "admin@test.com",
    };

    const store = createTestStore({
      user: mockUser,
      token: "fake-admin-token",
      expiresAt: mockExpiresAt,
      status: "succeeded",
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useAuth(), { wrapper });

    expect(tokenRefreshService.setupTokenRefresh).toHaveBeenCalledTimes(1);
    expect(tokenRefreshService.setupTokenRefresh).toHaveBeenCalledWith(
      mockExpiresAt,
      expect.any(Function)
    );
  });

  it("should clear timer on unmount", () => {
    const {
      tokenRefreshService,
    } = require("../../src/services/tokenRefreshService");

    const store = createTestStore({
      user: {
        _id: "123",
        role: "user" as const,
        name: "Test",
        surname: "User",
        email: "test@test.com",
      },
      token: "token",
      expiresAt: Date.now() + 3600000,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { unmount } = renderHook(() => useAuth(), { wrapper });

    unmount();

    expect(tokenRefreshService.clearRefreshTimer).toHaveBeenCalledTimes(1);
  });

  it("should not setup timer for expired token", () => {
    const {
      tokenRefreshService,
    } = require("../../src/services/tokenRefreshService");
    const { checkTokenExpiry } = require("../../src/utils/authUtils");

    // Mock checkTokenExpiry to return true (token expired)
    (checkTokenExpiry as jest.Mock).mockReturnValue(true);

    const mockExpiresAt = Date.now() - 1000; // 1 second ago (expired)
    const mockUser = {
      _id: "123",
      role: "user" as const,
      name: "Expired",
      surname: "User",
      email: "expired@test.com",
    };

    const store = createTestStore({
      user: mockUser,
      token: "expired-token",
      expiresAt: mockExpiresAt,
      status: "succeeded",
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useAuth(), { wrapper });

    expect(tokenRefreshService.setupTokenRefresh).not.toHaveBeenCalled();
  });
});
