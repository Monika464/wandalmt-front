// src/types/i18n.d.ts
// src/types/i18n.d.ts
export interface TranslationSchema {
  register: {
    title: string;
    namePlaceholder: string;
    surnamePlaceholder: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    roleUser: string;
    roleAdmin: string;
    roleAdminInfo: string;
    submitButton: string;
    submittingButton: string;
    successUser: string;
    successAdmin: string;
  };
  errors: {
    nameRequired: string;
    surnameRequired: string;
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordMinLength: string;
    captchaRequired: string;
    general: string;
  };
  captcha: {
    info: string;
    privacy: string;
    and: string;
    terms: string;
    ofGoogle: string;
  };
  // ... reszta
}

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: TranslationSchema;
    };
  }
}
