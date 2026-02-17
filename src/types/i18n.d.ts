// src/types/i18n.d.ts
// src/types/i18n.d.ts
declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: {
        nav: {
          home: string;
          about: string;
          contact: string;
          login: string;
          register: string;
          logout: string;
          userPanel: string;
          adminPanel: string;
          shop: string;
          cart: string;
        };
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
          captchaRequired: string;
          nameRequired: string;
          surnameRequired: string;
          emailRequired: string;
          emailInvalid: string;
          passwordRequired: string;
          passwordMinLength: string;
        };
        captcha: {
          info: string;
          privacy: string;
          and: string;
          terms: string;
          ofGoogle: string;
        };
      };
    };
  }
}
