import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "./locales";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // French at /, Arabic at /ar
  localePrefix: "as-needed",
  // Always serve French at the root; visitors switch language explicitly.
  localeDetection: false,
});
