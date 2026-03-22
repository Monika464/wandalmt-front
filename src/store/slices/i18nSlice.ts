// store/slices/i18nSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface I18nState {
  language: string;
}

const getInitialLanguage = (): string => {
  const savedLanguage = localStorage.getItem("language");
  if (savedLanguage === "en" || savedLanguage === "pl") {
    return savedLanguage;
  }
  return "en";
};

const initialState: I18nState = {
  language: getInitialLanguage(),
};

const i18nSlice = createSlice({
  name: "i18n",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
      localStorage.setItem("language", action.payload);
    },
  },
});

export const { setLanguage } = i18nSlice.actions;
export default i18nSlice.reducer;
