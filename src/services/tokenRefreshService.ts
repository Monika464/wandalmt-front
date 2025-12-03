// services/tokenRefreshService.ts

class TokenRefreshService {
  private refreshTimeout: number | null = null;
  private refreshBufferMs: number = 5 * 60 * 1000; // 5 minut domyślnie (łatwiejsze testy)

  // Callback dla testów i logiki wylogowania
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
    onRefreshCallback?: () => Promise<void> | void
  ): void {
    // Zawsze czyść poprzedni timer
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
      // Token wygaśnie wkrótce - odśwież natychmiast
      if (onRefreshCallback) {
        Promise.resolve(onRefreshCallback()).catch(() => {
          this.clearRefreshTimer();
        });
      }
    } else {
      // Token już wygasł
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
      // Tylko dla przeglądarki - w testach to nie zadziała
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

  // Metoda dla testów
  reset(): void {
    this.clearRefreshTimer();
    this.refreshBufferMs = 5 * 60 * 1000;
    this.onForceLogout = undefined;
  }
}

export const tokenRefreshService = new TokenRefreshService();

// // services/tokenRefreshService.ts

// class TokenRefreshService {
//   setForceLogoutCallback(arg0: () => void) {
//     throw new Error("Method not implemented.");
//   }
//   private refreshTimeout: number | null = null;
//   private readonly DEFAULT_REFRESH_BUFFER_MS = 15 * 60 * 1000; // 15 minut

//   // Konfigurowalny buffer czasu
//   private refreshBufferMs: number = this.DEFAULT_REFRESH_BUFFER_MS;

//   /**
//    * Konfiguruje buffer czasu odświeżania
//    */
//   setRefreshBuffer(bufferMs: number): void {
//     if (bufferMs > 0) {
//       this.refreshBufferMs = bufferMs;
//       console.log(`Ustawiono buffer odświeżania na ${bufferMs / 1000} sekund`);
//     }
//   }

//   /**
//    * Konfiguruje automatyczne odświeżanie tokena
//    * @param expiresAt - timestamp wygaśnięcia tokena (w milisekundach)
//    * @param onRefreshCallback - funkcja do wywołania przy odświeżaniu
//    */
//   setupTokenRefresh(
//     expiresAt: number,
//     onRefreshCallback?: () => Promise<void> | void
//   ): void {
//     console.log("[TokenRefresh] Konfigurowanie odświeżania", {
//       expiresAt: new Date(expiresAt).toISOString(),
//       expiresInSeconds: Math.round((expiresAt - Date.now()) / 1000),
//       refreshBufferSeconds: this.refreshBufferMs / 1000,
//     });

//     this.clearRefreshTimer();

//     const refreshTime = expiresAt - this.refreshBufferMs;
//     const timeUntilRefresh = refreshTime - Date.now();

//     if (timeUntilRefresh > 0) {
//       this.scheduleRefresh(timeUntilRefresh, onRefreshCallback);
//     } else if (Date.now() < expiresAt) {
//       console.log(
//         "[TokenRefresh] Token wygaśnie wkrótce - odświeżanie natychmiast"
//       );
//       this.executeRefresh(onRefreshCallback);
//     } else {
//       console.warn("[TokenRefresh] Token już wygasł!");
//       // Token już wygasł - wymagane ponowne logowanie
//       this.handleTokenExpired();
//     }
//   }

//   /**
//    * Planuje odświeżenie tokena
//    */
//   private scheduleRefresh(
//     timeUntilRefresh: number,
//     onRefreshCallback?: () => Promise<void> | void
//   ): void {
//     const minutes = Math.floor(timeUntilRefresh / 1000 / 60);
//     const seconds = Math.floor((timeUntilRefresh / 1000) % 60);

//     console.log(
//       `[TokenRefresh] Automatyczne odświeżenie za ${minutes}min ${seconds}s ` +
//         `(o ${new Date(Date.now() + timeUntilRefresh).toLocaleTimeString()})`
//     );

//     this.refreshTimeout = window.setTimeout(async () => {
//       console.log("[TokenRefresh] Czas na odświeżenie tokena!");
//       try {
//         await this.executeRefresh(onRefreshCallback);
//       } catch (error) {
//         console.error("[TokenRefresh] Błąd podczas odświeżania:", error);
//         this.handleRefreshError(error);
//       }
//     }, timeUntilRefresh);
//   }

//   /**
//    * Wykonuje odświeżenie tokena
//    */
//   private async executeRefresh(
//     onRefreshCallback?: () => Promise<void> | void
//   ): Promise<void> {
//     if (onRefreshCallback) {
//       const result = onRefreshCallback();
//       if (result instanceof Promise) {
//         await result;
//       }
//     }
//     this.refreshTimeout = null;
//   }

//   /**
//    * Obsługuje błąd odświeżania
//    */
//   private handleRefreshError(error: any): void {
//     // Tutaj możesz dodać logikę np.:
//     // - Powiadomienie użytkownika
//     // - Przekierowanie do logowania
//     // - Ponowienie próby po czasie
//     console.error("[TokenRefresh] Krytyczny błąd odświeżania:", error);

//     // Przykład: ponów próbę za 30 sekund
//     if (this.refreshTimeout === null) {
//       setTimeout(() => {
//         // Wywołaj callback ponownie lub wymuś logout
//         this.forceLogout();
//       }, 30000);
//     }
//   }

//   /**
//    * Obsługuje wygaśnięty token
//    */
//   private handleTokenExpired(): void {
//     console.warn(
//       "[TokenRefresh] Token już wygasł - wymagane ponowne logowanie"
//     );
//     this.forceLogout();
//   }

//   /**
//    * Wymusza wylogowanie użytkownika
//    */
//   private forceLogout(): void {
//     // Tutaj dodaj logikę wylogowania
//     // np. wyczyść localStorage, przekieruj do strony logowania
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//     window.location.href = "/login";
//   }

//   /**
//    * Czyści timer odświeżania
//    */
//   clearRefreshTimer(): void {
//     if (this.refreshTimeout !== null) {
//       window.clearTimeout(this.refreshTimeout);
//       this.refreshTimeout = null;
//       console.log("[TokenRefresh] Timer odświeżania wyczyszczony");
//     }
//   }

//   /**
//    * Sprawdza czy timer jest aktywny
//    */
//   isTimerActive(): boolean {
//     return this.refreshTimeout !== null;
//   }

//   /**
//    * Zwraca czas do następnego odświeżenia
//    */
//   getTimeUntilRefresh(): number | null {
//     if (this.refreshTimeout === null) return null;
//     // Uwaga: To przybliżenie, ponieważ nie przechowujemy dokładnego czasu
//     return this.refreshTimeout ? 0 : null;
//   }
// }

// export const tokenRefreshService = new TokenRefreshService();
