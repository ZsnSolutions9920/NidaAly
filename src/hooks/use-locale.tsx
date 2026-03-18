"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  LOCALES,
  DEFAULT_LOCALE,
  formatPrice as formatPriceFn,
  type LocaleCode,
  type LocaleConfig,
} from "@/lib/locale";

interface LocaleContext {
  locale: LocaleCode;
  config: LocaleConfig;
  setLocale: (locale: LocaleCode) => void;
  formatPrice: (amountInSmallestUnit: number) => string;
}

const LocaleContext = createContext<LocaleContext | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: LocaleCode;
}) {
  const [locale, setLocaleState] = useState<LocaleCode>(
    initialLocale ?? DEFAULT_LOCALE
  );

  const setLocale = (newLocale: LocaleCode) => {
    setLocaleState(newLocale);
    // In production, this would redirect to the correct subdomain
    document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
  };

  const formatPrice = (amountInSmallestUnit: number) => {
    return formatPriceFn(amountInSmallestUnit, locale);
  };

  return (
    <LocaleContext.Provider
      value={{
        locale,
        config: LOCALES[locale],
        setLocale,
        formatPrice,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
