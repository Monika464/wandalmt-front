// services/tokenRefreshService.ts

class TokenRefreshService {
  private refreshTimeout: number | null = null;

  setupTokenRefresh(expiresAt: number, onRefreshCallback?: () => void): void {
    this.clearRefreshTimer();

    const refreshBuffer = 15 * 60 * 1000; // 15 minut
    const refreshTime = expiresAt - refreshBuffer;
    const timeUntilRefresh = refreshTime - Date.now();

    if (timeUntilRefresh > 0) {
      console.log(
        `Automatyczne odświeżenie tokena za ${Math.round(
          timeUntilRefresh / 1000 / 60
        )} minut`
      );

      this.refreshTimeout = window.setTimeout(() => {
        console.log("Czas na odświeżenie tokena!");
        onRefreshCallback?.();
        this.refreshTimeout = null;
      }, timeUntilRefresh);
    } else if (Date.now() < expiresAt) {
      console.log("Token wygaśnie wkrótce - odświeżanie natychmiast");
      onRefreshCallback?.();
    }
  }

  clearRefreshTimer() {
    if (this.refreshTimeout !== null) {
      window.clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }
  isTimerActive(): boolean {
    return this.refreshTimeout !== null;
  }
}

export const tokenRefreshService = new TokenRefreshService();

// // services/tokenRefreshService.ts
// class TokenRefreshService {
//   private refreshTimeout: ReturnType<typeof setTimeout> | null = null;

//   /**
//    * Ustaw timer na odświeżenie tokena
//    * @param expiresAt - timestamp wygaśnięcia w ms
//    * @param onRefreshCallback - funkcja do wywołania gdy token ma być odświeżony
//    */
//   setupTokenRefresh(expiresAt: number, onRefreshCallback?: () => void) {
//     this.clearRefreshTimer();

//     // Odśwież 15 minut przed wygaśnięciem (możesz zmienić)
//     const refreshTime = expiresAt - 15 * 60 * 1000;
//     const timeUntilRefresh = refreshTime - Date.now();

//     if (timeUntilRefresh > 0) {
//       console.log(
//         `Automatyczne odświeżenie tokena za ${Math.round(
//           timeUntilRefresh / 1000 / 60
//         )} minut`
//       );

//       this.refreshTimeout = setTimeout(() => {
//         console.log("Czas na odświeżenie tokena!");
//         if (onRefreshCallback) {
//           onRefreshCallback();
//         }
//       }, timeUntilRefresh);
//     } else if (Date.now() < expiresAt) {
//       // Jeśli zostało mniej niż 15 minut, odśwież natychmiast
//       console.log("Token wygaśnie wkrótce - odświeżanie natychmiast");
//       if (onRefreshCallback) {
//         onRefreshCallback();
//       }
//     }
//   }

//   clearRefreshTimer() {
//     if (this.refreshTimeout) {
//       clearTimeout(this.refreshTimeout);
//       this.refreshTimeout = null;
//     }
//   }
// }

// export const tokenRefreshService = new TokenRefreshService();
