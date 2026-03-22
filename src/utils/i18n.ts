/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Załaduj swoje pliki z tłumaczeniami
import translationPL from "../locales/pl/translation.json";
import translationEN from "../locales/en/translations.json";

const resources = {
  pl: { translation: translationPL },
  en: { translation: translationEN },
};

// Inicjalizacja i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "pl",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage", "cookie"],
    },
    returnNull: false,
    returnEmptyString: false,
  });

export default i18n;
