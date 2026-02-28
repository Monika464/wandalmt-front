// hooks/useCurrency.ts
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { currencyService } from "../services/currencyService";
import { setCurrency } from "../store/slices/currencySlice";

export const useCurrency = () => {
  const dispatch = useDispatch();
  const { availableCurrencies, selectedCurrency, loading } = useSelector(
    (state: RootState) => state.currency,
  );

  const getConvertedPrice = (priceInPLN: number): number => {
    const currency = availableCurrencies.find(
      (c) => c.code === selectedCurrency,
    );
    if (!currency) return priceInPLN;

    return currencyService.convertPrice(
      priceInPLN,
      currency.rate,
      selectedCurrency,
    );
  };

  const getFormattedPrice = (priceInPLN: number): string => {
    const currency = availableCurrencies.find(
      (c) => c.code === selectedCurrency,
    );
    if (!currency) return `${priceInPLN.toFixed(2)} zł`;

    const convertedPrice = getConvertedPrice(priceInPLN);
    return currencyService.formatPrice(convertedPrice, currency.symbol);
  };

  // DODAJEMY TĘ FUNKCJĘ - to jest to czego szukasz!
  const formatPrice = (priceInPLN: number): string => {
    return getFormattedPrice(priceInPLN);
  };

  return {
    selectedCurrency,
    availableCurrencies,
    loading,
    setCurrency: (code: string) => dispatch(setCurrency(code)),
    getConvertedPrice,
    getFormattedPrice,
    formatPrice, // TERAZ TO DZIAŁA!
  };
};
