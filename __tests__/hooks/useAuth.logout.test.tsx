// __tests__/hooks/useAuth.logout.simple.test.tsx
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { useAuth } from "../../src/hooks/useAuth";
import authReducer from "../../src/store/slices/authSlice";

jest.mock("../../src/services/tokenRefreshService", () => ({
  tokenRefreshService: {
    setupTokenRefresh: jest.fn(),
    clearRefreshTimer: jest.fn(),
    isTimerActive: jest.fn(() => false),
  },
}));

jest.mock("../../src/utils/api", () => ({
  __esModule: true,
  default: {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
  setStore: jest.fn(),
}));

let mockCheckTokenExpiryValue = false;
jest.mock("../../src/utils/authUtils", () => ({
  checkTokenExpiry: jest.fn(() => mockCheckTokenExpiryValue),
  formatTimeRemaining: jest.fn(() => "1h"),
  isTokenExpiringSoon: jest.fn(() => false),
}));

const createTestStore = (initialState: any) => {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: initialState },
  });
};

describe("useAuth - logout behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckTokenExpiryValue = false;
  });

  test("sets up token refresh for valid token", () => {
    // Pobierz mocki PO zainicjalizowaniu
    const {
      tokenRefreshService,
    } = require("../../src/services/tokenRefreshService");
    const { checkTokenExpiry } = require("../../src/utils/authUtils");

    // Ustaw że token jest ważny
    (checkTokenExpiry as jest.Mock).mockReturnValue(false);

    const expiresAt = Date.now() + 3600000;
    const store = createTestStore({
      user: { _id: "1", role: "user", name: "Test", email: "test@test.com" },
      token: "token",
      expiresAt,
      status: "succeeded",
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    renderHook(() => useAuth(), { wrapper });

    expect(tokenRefreshService.setupTokenRefresh).toHaveBeenCalledWith(
      expiresAt,
      expect.any(Function),
    );
  });
});
