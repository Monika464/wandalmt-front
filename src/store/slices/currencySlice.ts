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
  baseCurrency: string; // PLN
  loading: boolean;
  error: string | null;
}

const initialState: CurrencyState = {
  availableCurrencies: [
    { code: "PLN", name: "Polski złoty", rate: 1, symbol: "zł" },
    // USD doda się po pobraniu kursu
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
    // Znajdź kurs USD
    const usdRate = rates.find((r) => r.code === "USD");

    return [
      { code: "PLN", name: "Polski złoty", rate: 1, symbol: "zł" },
      {
        code: "USD",
        name: "Dolar amerykański",
        rate: usdRate?.mid || 4.0, // fallback
        symbol: "$",
      },
    ];
  },
);

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.selectedCurrency = action.payload;
      // Zapisz wybór w localStorage
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
        // Przywróć poprzedni wybór użytkownika
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
