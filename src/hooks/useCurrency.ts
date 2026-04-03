// hooks/useCurrency.ts
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { currencyService } from "../services/currencyService";
import { setCurrency, fetchExchangeRates } from "../store/slices/currencySlice";
import { useEffect } from "react";

export const useCurrency = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { availableCurrencies, selectedCurrency, loading } = useSelector(
    (state: RootState) => state.currency,
  );

  useEffect(() => {
    const hasOnlyPln =
      availableCurrencies.length === 1 &&
      availableCurrencies[0]?.code === "PLN";

    if (hasOnlyPln && !loading) {
      dispatch(fetchExchangeRates());
    }
  }, [availableCurrencies, loading, dispatch]);

  // const ensureRatesLoaded = useCallback(() => {
  //   const hasRates =
  //     availableCurrencies.length > 1 ||
  //     (availableCurrencies.length === 1 &&
  //       availableCurrencies[0]?.code !== "PLN");

  //   if (!hasRates && !loading) {
  //     dispatch(fetchExchangeRates());
  //   }
  // }, [availableCurrencies, loading, dispatch]);

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

  // useEffect(() => {
  //   ensureRatesLoaded();
  // }, [ensureRatesLoaded]);

  const formatPrice = (priceInPLN: number): string => {
    //ensureRatesLoaded();

    if (loading) {
      return `${priceInPLN.toFixed(2)} zł`;
    }

    const currency = availableCurrencies.find(
      (c) => c.code === selectedCurrency,
    );
    if (!currency) return `${priceInPLN.toFixed(2)} zł`;

    const convertedPrice = currencyService.convertPrice(
      priceInPLN,
      currency.rate,
      selectedCurrency,
    );
    return currencyService.formatPrice(convertedPrice, currency.symbol);

    // const formatPrice = (priceInPLN: number): string => {
    //   return getFormattedPrice(priceInPLN);
    // };
  };

  return {
    selectedCurrency,
    availableCurrencies,
    loading,
    setCurrency: (code: string) => dispatch(setCurrency(code)),
    getConvertedPrice,
    getFormattedPrice,
    formatPrice,
  };
};
