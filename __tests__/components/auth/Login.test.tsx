// __tests__/components/auth/Login.simple.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Login from "../../../src/components/auth/Login";
import authReducer from "../../../src/store/slices/authSlice";
import cartReducer from "../../../src/store/slices/cartSlice";
import type { RootState } from "../../../src/store";

// PROSTE MOCKI BEZ ZMIENNYCH
jest.mock("../../../src/hooks/useAuth", () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: false,
    user: null,
    isLoading: false,
  })),
}));

jest.mock("../../../src/services/tokenRefreshService", () => ({
  tokenRefreshService: {
    setupTokenRefresh: jest.fn(),
    clearRefreshTimer: jest.fn(),
  },
}));

jest.mock("../../../src/utils/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  },
  setStore: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ search: "", pathname: "/login" }),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

const createTestStore = (overrides = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
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
        ...overrides.auth,
      },
      cart: {
        items: [],
        ...overrides.cart,
      },
    } as any,
  });
};

describe("Login Component - Simple", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn(() => "[]");
  });

  test("renders login form", () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Hasło")).toBeInTheDocument();
  });

  test("form inputs work", () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Hasło");

    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput).toHaveValue("test@test.com");
    expect(passwordInput).toHaveValue("password123");
  });
});
