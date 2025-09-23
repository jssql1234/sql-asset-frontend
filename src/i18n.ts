import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translations
import enPagination from "@/locales/en/pagination.json";
import enCommon from "@/locales/en/common.json";

import cnPagination from "@/locales/cn/pagination.json";
import cnCommon from "@/locales/cn/common.json";

import myPagination from "@/locales/my/pagination.json";
import myCommon from "@/locales/my/common.json";

const resources = {
  en: {
    pagination: enPagination,
    common: enCommon,
  },
  cn: {
    pagination: cnPagination,
    common: cnCommon,
  },
  my: {
    pagination: myPagination,
    common: myCommon,
  },
};

const savedLanguage = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "en",
  supportedLngs: ["en", "cn", "my"],
  ns: ["pagination", "common"],
  defaultNS: "common",
  fallbackNS: "common",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
