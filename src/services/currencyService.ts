// services/currencyService.ts
import axios from "axios";

export interface ExchangeRate {
  currency: string;
  code: string;
  mid: number; // kurs średni
}

export const currencyService = {
  // Pobierz kursy z NBP
  async getRatesFromNBP(): Promise<ExchangeRate[]> {
    try {
      const response = await axios.get(
        "https://api.nbp.pl/api/exchangerates/tables/A?format=json",
      );

      // console.log("Pobrane kursy z NBP:", response.data[0].rates);
      return response.data[0].rates;
    } catch (error) {
      console.error("Błąd pobierania kursów z NBP:", error);
      throw error;
    }
  },

  // Przelicz cenę z PLN na wybraną walutę
  convertPrice(
    priceInPLN: number,
    rate: number,
    targetCurrency: string,
  ): number {
    // console.log(
    //   `Przeliczanie ceny: ${priceInPLN} PLN na ${targetCurrency} przy kursie ${rate}`,
    // );
    // Dla PLN zwracamy oryginalną cenę
    if (targetCurrency === "PLN") {
      return priceInPLN;
    }

    // Dla innych walut dzielimy przez kurs (bo kurs NBP to ile PLN za 1 jednostkę waluty)
    // Np. kurs USD = 4.0 oznacza, że 1$ = 4zł, więc 100zł = 100/4 = 25$
    return priceInPLN / rate;
  },

  // Dodatkowa funkcja do formatowania ceny z symbolem
  formatPrice(price: number, currencySymbol: string): string {
    return `${price.toFixed(2)} ${currencySymbol}`;
  },
};
