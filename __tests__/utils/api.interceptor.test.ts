// __tests__/utils/api.interceptor.test.ts - POPRAWIONY
import api, { setStore } from "../../src/utils/api";

// Mock store
const createMockStore = (userRole: "user" | "admin" | null = null) => {
  const mockDispatch = jest.fn();

  const store = {
    getState: jest.fn(() => ({
      auth: {
        user: userRole ? { role: userRole, name: "Test" } : null,
        token: userRole ? `${userRole}-token` : null,
      },
    })),
    dispatch: mockDispatch,
  };

  return { store, mockDispatch };
};

describe("API Interceptor - auto logout on 401", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle 401 error", () => {
    const { store, mockDispatch } = createMockStore("user");
    setStore(store);

    // Symuluj błąd 401
    const error = {
      response: {
        status: 401,
        data: { message: "Unauthorized" },
      },
    };

    // Pobierz interceptor (musi istnieć)
    const responseInterceptors = api.interceptors.response as any;

    // Znajdź i wywołaj rejected handler jeśli istnieje
    if (
      responseInterceptors.handlers &&
      responseInterceptors.handlers.length > 0
    ) {
      const rejectedHandler = responseInterceptors.handlers.find(
        (h: any) => h.rejected,
      );

      if (rejectedHandler) {
        const result = rejectedHandler.rejected(error);
        if (result && result.catch) {
          result.catch(() => {});
        }
      }
    }

    expect(mockDispatch).toHaveBeenCalled();
  });

  it("should not crash when no store is set", () => {
    setStore(null);

    const error = {
      response: { status: 401 },
    };

    const responseInterceptors = api.interceptors.response as any;

    if (
      responseInterceptors.handlers &&
      responseInterceptors.handlers.length > 0
    ) {
      const rejectedHandler = responseInterceptors.handlers.find(
        (h: any) => h.rejected,
      );

      if (rejectedHandler) {
        expect(() => {
          const result = rejectedHandler.rejected(error);
          if (result && result.catch) {
            result.catch(() => {});
          }
        }).not.toThrow();
      }
    }
  });
});
