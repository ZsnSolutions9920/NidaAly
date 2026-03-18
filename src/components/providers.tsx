"use client";

import { SessionProvider } from "next-auth/react";
import { LocaleProvider } from "@/hooks/use-locale";
import { CartProvider } from "@/hooks/use-cart";
import type { LocaleCode } from "@/lib/locale";

export function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale?: LocaleCode;
}) {
  return (
    <SessionProvider>
      <LocaleProvider initialLocale={locale}>
        <CartProvider>{children}</CartProvider>
      </LocaleProvider>
    </SessionProvider>
  );
}
