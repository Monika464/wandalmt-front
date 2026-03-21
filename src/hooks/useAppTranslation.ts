// src/hooks/useAppTranslation.ts
import { useTranslation } from "react-i18next";

export const useAppTranslation = () => {
  const { t, i18n } = useTranslation();

  // Simplified typing
  const translate = (...args: Parameters<typeof t>): string => {
    return t(...args) as string;
  };

  return { t: translate, i18n };
};
