// hooks/useLanguageSync.ts
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "../store/slices/i18nSlice";
import type { RootState } from "../store";

export const useLanguageSync = () => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const reduxLanguage = useSelector((state: RootState) => state.i18n?.language);

  // Sync i18n -> Redux
  useEffect(() => {
    // Initial synchronization
    if (i18n.language && (!reduxLanguage || i18n.language !== reduxLanguage)) {
      console.log(
        "🔄 Initial language sync from i18n to Redux:",
        i18n.language,
      );
      dispatch(setLanguage(i18n.language));
    }

    // Listen for changes in i18n
    const handleLanguageChange = (lng: string) => {
      console.log("🔄 Language changed in i18n, updating Redux:", lng);
      dispatch(setLanguage(lng));
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n, dispatch, reduxLanguage]);

  // Sync Redux -> i18n
  useEffect(() => {
    if (reduxLanguage && reduxLanguage !== i18n.language) {
      console.log("🔄 Redux language changed, updating i18n:", reduxLanguage);
      i18n.changeLanguage(reduxLanguage);
    }
  }, [reduxLanguage, i18n]);
};
