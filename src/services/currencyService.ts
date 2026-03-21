// services/currencyService.ts
import axios from "axios";

export interface ExchangeRate {
  currency: string;
  code: string;
  mid: number; // average course
}

export const currencyService = {
  // Get exchange rates from NBP
  async getRatesFromNBP(): Promise<ExchangeRate[]> {
    try {
      const response = await axios.get(
        "https://api.nbp.pl/api/exchangerates/tables/A?format=json",
      );

      // console.log("exchange rates NBP:", response.data[0].rates);
      return response.data[0].rates;
    } catch (error) {
      console.error("Error fetching exchange rates from NBP:", error);
      throw error;
    }
  },

  // Convert the price from PLN to the selected currency
  convertPrice(
    priceInPLN: number,
    rate: number,
    targetCurrency: string,
  ): number {
    // console.log(
    // `Price conversion: ${priceInPLN} PLN to ${targetCurrency} at the exchange rate ${rate}`,
    // );
    // For PLN, we return the original price
    if (targetCurrency === "PLN") {
      return priceInPLN;
    }

    // For other currencies, divide by the exchange rate (because the NBP exchange rate is how much PLN per 1 currency unit).
    // For example, the USD exchange rate = 4.0 means that 1 $ = 4 PLN, so 100 PLN = 100/4 = 25 $
    return priceInPLN / rate;
  },

  // Additional function for formatting the price with a symbol
  formatPrice(price: number, currencySymbol: string): string {
    return `${price.toFixed(2)} ${currencySymbol}`;
  },
};
