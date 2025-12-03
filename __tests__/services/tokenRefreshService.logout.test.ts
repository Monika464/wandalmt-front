// __tests__/services/tokenRefreshService.simple.test.ts
import { tokenRefreshService } from "../../src/services/tokenRefreshService";

// Wyłącz wszystkie console.log dla testów
beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("TokenRefreshService - Simple Tests", () => {
  beforeEach(() => {
    tokenRefreshService.reset();
    tokenRefreshService.setRefreshBuffer(5000); // 5 sekund buffer
    jest.useFakeTimers();

    // Ustaw prosty force logout callback dla testów
    tokenRefreshService.setForceLogoutCallback(() => {
      // Nic nie rób w testach
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    tokenRefreshService.clearRefreshTimer();
  });

  test("basic timer setup and clear", () => {
    const callback = jest.fn();
    const now = Date.now();

    // Ustaw timer na 10 sekund
    tokenRefreshService.setupTokenRefresh(now + 10000, callback);

    expect(tokenRefreshService.isTimerActive()).toBe(true);

    // Przesuń czas o 6 sekund (czas do odświeżenia: expiresAt - buffer = 10000 - 5000 = 5000ms)
    jest.advanceTimersByTime(6000);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(tokenRefreshService.isTimerActive()).toBe(false);
  });

  test("immediate refresh when token expires soon", () => {
    const callback = jest.fn();
    const now = Date.now();

    // Token wygaśnie za 3 sekundy (mniej niż buffer 5 sekund)
    tokenRefreshService.setupTokenRefresh(now + 3000, callback);

    // Callback powinien być wywołany natychmiast
    expect(callback).toHaveBeenCalledTimes(1);
    expect(tokenRefreshService.isTimerActive()).toBe(false);
  });

  test("no callback for expired token", () => {
    const callback = jest.fn();
    const now = Date.now();

    // Token już wygasł
    tokenRefreshService.setupTokenRefresh(now - 1000, callback);

    expect(callback).not.toHaveBeenCalled();
    expect(tokenRefreshService.isTimerActive()).toBe(false);
  });

  test("manual timer clear", () => {
    const callback = jest.fn();
    const now = Date.now();

    tokenRefreshService.setupTokenRefresh(now + 10000, callback);
    expect(tokenRefreshService.isTimerActive()).toBe(true);

    tokenRefreshService.clearRefreshTimer();
    expect(tokenRefreshService.isTimerActive()).toBe(false);

    // Timer nie powinien już zadziałać
    jest.advanceTimersByTime(20000);
    expect(callback).not.toHaveBeenCalled();
  });
});
