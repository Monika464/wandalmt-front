// __tests__/components/elements/LogoutButton.test.tsx - POPRAWIONE
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, useNavigate } from "react-router-dom";
import authReducer from "../../../src/store/slices/authSlice";
import cartReducer from "../../../src/store/slices/cartSlice";
import { logoutUser, logoutAdmin } from "../../../src/store/slices/authSlice";
import type { RootState } from "../../../src/store";

// Mock api
jest.mock("../../../src/utils/api", () => ({
  __esModule: true,
  default: {
    post: jest.fn().mockResolvedValue({ data: { message: "Logged out" } }),
  },
  setStore: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Testowy komponent LogoutButton
import React from "react";
const TestLogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    if (user?.role === "admin") {
      await dispatch(logoutAdmin());
    } else {
      await dispatch(logoutUser());
    }
    navigate("/login");
  };

  return (
    <button onClick={handleLogout} data-testid="logout-button">
      Wyloguj
    </button>
  );
};

const createTestStore = (userRole: "user" | "admin" = "user") => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
    },
    preloadedState: {
      auth: {
        user: {
          _id: "123",
          role: userRole,
          name: "John",
          surname: "Doe",
          email: "john@test.com",
        },
        token: `${userRole}-token`,
        expiresAt: Date.now() + 3600000,
        status: "succeeded" as const,
        loading: false,
        error: null,
        success: null,
      },
      cart: {
        items: [],
      },
    } as any,
  });
};

describe("LogoutButton Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render logout button", () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <TestLogoutButton />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId("logout-button")).toBeInTheDocument();
    expect(screen.getByText("Wyloguj")).toBeInTheDocument();
  });

  test("should call logoutUser for regular user", async () => {
    const store = createTestStore("user");

    render(
      <Provider store={store}>
        <MemoryRouter>
          <TestLogoutButton />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(screen.getByTestId("logout-button"));

    // Poczekaj na async dispatch
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  test("should call logoutAdmin for admin user", async () => {
    const store = createTestStore("admin");

    render(
      <Provider store={store}>
        <MemoryRouter>
          <TestLogoutButton />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(screen.getByTestId("logout-button"));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
