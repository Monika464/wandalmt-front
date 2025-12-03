// __tests__/services/tokenRefreshService.logout.test.ts - POPRAWIONY
import { tokenRefreshService } from "../../src/services/tokenRefreshService";

// Mock console.log aby nie zaśmiecał outputu
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe("TokenRefreshService", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    tokenRefreshService.clearRefreshTimer(); // Zawsze czyść przed testem
  });

  afterEach(() => {
    jest.useRealTimers();
    tokenRefreshService.clearRefreshTimer(); // Zawsze czyść po teście
  });

  test("should clear previous timer when setting up new one", () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    const now = Date.now();

    // Pierwszy timer - wygaśnie za 30 sekund
    const expiresAt1 = now + 30000;
    tokenRefreshService.setupTokenRefresh(expiresAt1, callback1);

    // Drugi timer natychmiast - powinien wyczyścić pierwszy
    const expiresAt2 = now + 60000; // 60 sekund
    tokenRefreshService.setupTokenRefresh(expiresAt2, callback2);

    // Timer 1 NIE powinien być aktywny po ustawieniu timer 2
    expect(callback1).not.toHaveBeenCalled();

    // Przesuń czas o 30 sekund - callback1 NIE powinien być wywołany
    jest.advanceTimersByTime(30000);
    expect(callback1).not.toHaveBeenCalled();

    // Przesuń kolejne 30 sekund (łącznie 60) - callback2 powinien być wywołany
    jest.advanceTimersByTime(30000);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  test("should call callback immediately if token expires soon", () => {
    const callback = jest.fn();
    const now = Date.now();
    const expiresAt = now + 5000; // 5 sekund (mniej niż 15 minut buffer)

    tokenRefreshService.setupTokenRefresh(expiresAt, callback);

    // Callback powinien być wywołany natychmiast
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test("should not call callback if token already expired", () => {
    const callback = jest.fn();
    const now = Date.now();
    const expiresAt = now - 1000; // wygasł 1 sekundę temu

    tokenRefreshService.setupTokenRefresh(expiresAt, callback);

    expect(callback).not.toHaveBeenCalled();
  });

  test("should clear timer manually", () => {
    const callback = jest.fn();
    const now = Date.now();
    const expiresAt = now + 30000;

    tokenRefreshService.setupTokenRefresh(expiresAt, callback);
    tokenRefreshService.clearRefreshTimer();

    // Przesuń czas - callback nie powinien być wywołany
    jest.advanceTimersByTime(30000);
    expect(callback).not.toHaveBeenCalled();
  });

  test("should check if timer is active", () => {
    const callback = jest.fn();
    const now = Date.now();

    // Bez timera
    expect(tokenRefreshService.isTimerActive()).toBe(false);

    // Z timerem
    tokenRefreshService.setupTokenRefresh(now + 30000, callback);
    expect(tokenRefreshService.isTimerActive()).toBe(true);

    // Po wyczyszczeniu
    tokenRefreshService.clearRefreshTimer();
    expect(tokenRefreshService.isTimerActive()).toBe(false);
  });
});
