// // components/elements/CurrencySelector.tsx

// components/elements/CurrencySelector.tsx
import React from "react";
import { useCurrency } from "../../hooks/useCurrency"; // Użyj hooka!
import { Globe } from "lucide-react";

const CurrencySelector: React.FC = () => {
  const { selectedCurrency, setCurrency, availableCurrencies, loading, error } =
    useCurrency();

  if (error) {
    return (
      <div className="text-sm text-red-400 flex items-center gap-1">
        <Globe size={18} />
        <span>Błąd kursów</span>
      </div>
    );
  }

  if (loading) {
    return <div className="text-sm text-gray-400">Ładowanie...</div>;
  }

  return (
    <div className="flex items-center gap-1">
      <Globe size={18} className="text-gray-400" />
      <select
        value={selectedCurrency}
        onChange={(e) => setCurrency(e.target.value)}
        className="bg-gray-800 text-white text-sm rounded border border-gray-600 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {availableCurrencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} ({currency.symbol})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;
// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import type { RootState, AppDispatch } from "../../store";
// import {
//   fetchExchangeRates,
//   setCurrency,
// } from "../../store/slices/currencySlice";
// import { Globe } from "lucide-react";

// const CurrencySelector: React.FC = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { availableCurrencies, selectedCurrency, loading } = useSelector(
//     (state: RootState) => state.currency,
//   );

//   useEffect(() => {
//     const hasOnlyDefaultCurrency =
//       availableCurrencies.length === 1 &&
//       availableCurrencies[0]?.code === "PLN";

//     if (hasOnlyDefaultCurrency && !loading) {
//       dispatch(fetchExchangeRates());
//     }
//   }, [availableCurrencies, loading, dispatch]);

//   // useEffect(() => {
//   //   dispatch(fetchExchangeRates());
//   // }, [dispatch]);

//   const handleCurrencyChange = (code: string) => {
//     dispatch(setCurrency(code));
//   };

//   console.log("Available Currencies:", availableCurrencies);
//   console.log("Selected Currency:", selectedCurrency);

//   if (loading) return <div className="text-sm text-gray-400">Ładowanie...</div>;

//   if (loading && availableCurrencies.length === 1) {
//     return <div className="text-sm text-gray-400">Ładowanie...</div>;
//   }

//   return (
//     <div className="flex items-center gap-1">
//       <Globe size={18} className="text-gray-400" />
//       <select
//         value={selectedCurrency}
//         onChange={(e) => handleCurrencyChange(e.target.value)}
//         className="bg-gray-800 text-white text-sm rounded border border-gray-600 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
//       >
//         {availableCurrencies.map((currency) => (
//           <option key={currency.code} value={currency.code}>
//             {currency.code} ({currency.symbol})
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// };

// export default CurrencySelector;
