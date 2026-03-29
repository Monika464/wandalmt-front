// __tests__/utils/authUtils.test.ts
import {
  checkTokenExpiry,
  formatTimeRemaining,
} from "../../src/utils/authUtils";

describe("authUtils", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe("checkTokenExpiry", () => {
    it("should return true for expired token", () => {
      const now = Date.now();
      jest.setSystemTime(now);

      const expiredTime = now - 5 * 60 * 1000;
      expect(checkTokenExpiry(expiredTime)).toBe(true);
    });

    it("should return false for valid token", () => {
      const now = Date.now();
      jest.setSystemTime(now);

      const validTime = now + 5 * 60 * 1000;
      expect(checkTokenExpiry(validTime)).toBe(false);
    });

    it("should return true for null expiresAt", () => {
      expect(checkTokenExpiry(null)).toBe(true);
    });
  });

  describe("formatTimeRemaining", () => {
    it("should format days correctly", () => {
      expect(formatTimeRemaining(2 * 24 * 60 * 60 * 1000)).toBe("2d 0h");
    });

    it("should format hours and minutes correctly", () => {
      expect(formatTimeRemaining(3 * 60 * 60 * 1000 + 30 * 60 * 1000)).toBe(
        "3h 30m",
      );
    });

    it("should format minutes and seconds correctly", () => {
      expect(formatTimeRemaining(5 * 60 * 1000 + 30 * 1000)).toBe("5m 30s");
    });
  });
});
