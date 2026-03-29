// __tests__/services/tokenRefreshService.simple.test.ts
import { tokenRefreshService } from "../../src/services/tokenRefreshService";

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
    tokenRefreshService.setRefreshBuffer(5000);
    jest.useFakeTimers();

    tokenRefreshService.setForceLogoutCallback(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    tokenRefreshService.clearRefreshTimer();
  });

  test("basic timer setup and clear", () => {
    const callback = jest.fn();
    const now = Date.now();

    tokenRefreshService.setupTokenRefresh(now + 10000, callback);

    expect(tokenRefreshService.isTimerActive()).toBe(true);

    jest.advanceTimersByTime(6000);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(tokenRefreshService.isTimerActive()).toBe(false);
  });

  test("immediate refresh when token expires soon", () => {
    const callback = jest.fn();
    const now = Date.now();

    tokenRefreshService.setupTokenRefresh(now + 3000, callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(tokenRefreshService.isTimerActive()).toBe(false);
  });

  test("no callback for expired token", () => {
    const callback = jest.fn();
    const now = Date.now();

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

    jest.advanceTimersByTime(20000);
    expect(callback).not.toHaveBeenCalled();
  });
});
