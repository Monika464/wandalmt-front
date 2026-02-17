// src/i18n.ts
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

i18n
  .use(LanguageDetector) // Wykryj język przeglądarki
  .use(initReactI18next) // Przekaż i18next do react-i18next
  .init({
    resources,
    fallbackLng: "pl", // Język awaryjny, gdyby coś poszło nie tak
    interpolation: {
      escapeValue: false, // React już chroni przed XSS
    },
    // ... inne opcje
  });

export default i18n;
