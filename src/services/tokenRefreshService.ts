// services/tokenRefreshService.ts

class TokenRefreshService {
  private refreshTimeout: number | null = null;
  private refreshBufferMs: number = 5 * 60 * 1000; // 5 minut domyślnie (łatwiejsze testy)

  // Callback for tests and logout logic
  private onForceLogout?: () => void;

  setForceLogoutCallback(callback: () => void): void {
    this.onForceLogout = callback;
  }

  setRefreshBuffer(bufferMs: number): void {
    if (bufferMs > 0) {
      this.refreshBufferMs = bufferMs;
    }
  }

  setupTokenRefresh(
    expiresAt: number,
    onRefreshCallback?: () => Promise<void> | void,
  ): void {
    // Always clear the previous timer
    this.clearRefreshTimer();

    if (!expiresAt || expiresAt <= 0) {
      return;
    }

    const refreshTime = expiresAt - this.refreshBufferMs;
    const timeUntilRefresh = refreshTime - Date.now();

    if (timeUntilRefresh > 0) {
      this.refreshTimeout = window.setTimeout(() => {
        if (onRefreshCallback) {
          Promise.resolve(onRefreshCallback()).catch(() => {
            this.clearRefreshTimer();
          });
        }
        this.refreshTimeout = null;
      }, timeUntilRefresh);
    } else if (Date.now() < expiresAt) {
      // The token has already expired
      if (onRefreshCallback) {
        Promise.resolve(onRefreshCallback()).catch(() => {
          this.clearRefreshTimer();
        });
      }
    } else {
      // The token has already expired
      this.forceLogout();
    }
  }

  clearRefreshTimer(): void {
    if (this.refreshTimeout !== null) {
      window.clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  isTimerActive(): boolean {
    return this.refreshTimeout !== null;
  }

  private forceLogout(): void {
    this.clearRefreshTimer();

    if (this.onForceLogout) {
      this.onForceLogout();
    } else if (typeof window !== "undefined") {
      // Browser only - this will not work in tests
      try {
        if (window.localStorage) {
          window.localStorage.removeItem("accessToken");
          window.localStorage.removeItem("refreshToken");
          window.localStorage.removeItem("token");
          window.localStorage.removeItem("user");
          window.localStorage.removeItem("expiresAt");
        }

        if (window.location && window.location.href) {
          window.location.href = "/login";
        }
      } catch (error) {
        // Ignoruj błędy w testach
      }
    }
  }

  // Method for tests
  reset(): void {
    this.clearRefreshTimer();
    this.refreshBufferMs = 5 * 60 * 1000;
    this.onForceLogout = undefined;
  }
}

export const tokenRefreshService = new TokenRefreshService();
