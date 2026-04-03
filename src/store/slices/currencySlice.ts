// store/slices/currencySlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { currencyService } from "../../services/currencyService";

export interface CurrencyState {
  availableCurrencies: Array<{
    code: string;
    name: string;
    rate: number;
    symbol: string;
  }>;
  selectedCurrency: string;
  baseCurrency: string;
  loading: boolean;
  error: string | null;
}

const initialState: CurrencyState = {
  availableCurrencies: [
    { code: "PLN", name: "Polski złoty", rate: 1, symbol: "zł" },
  ],
  selectedCurrency: "PLN",
  baseCurrency: "PLN",
  loading: false,
  error: null,
};

export const fetchExchangeRates = createAsyncThunk(
  "currency/fetchRates",
  async () => {
    const rates = await currencyService.getRatesFromNBP();

    const usdRate = rates.find((r) => r.code === "USD");

    return [
      { code: "PLN", name: "Polski złoty", rate: 1, symbol: "zł" },
      {
        code: "USD",
        name: "Dolar amerykański",
        rate: usdRate?.mid || 4.0,
        symbol: "$",
      },
    ];
  },
);

console.log("Initial Currency State:", initialState);
console.log("Fetch Exchange Rates Thunk:", fetchExchangeRates);
console.log("selectedCurrency:", initialState.selectedCurrency);
const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.selectedCurrency = action.payload;

      localStorage.setItem("preferredCurrency", action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.loading = false;
        state.availableCurrencies = action.payload;

        const saved = localStorage.getItem("preferredCurrency");
        if (saved && action.payload.some((c) => c.code === saved)) {
          state.selectedCurrency = saved;
        }
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Błąd pobierania kursów";
      });
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
