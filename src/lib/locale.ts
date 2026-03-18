// ============================================================
// Multi-region locale/currency system
// Subdomains: pk.nidaaly.com, ae.nidaaly.com, us.nidaaly.com
// ============================================================

export type LocaleCode = "pk" | "ae" | "us";

export interface LocaleConfig {
  code: LocaleCode;
  country: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
  locale: string; // Intl locale string
  taxLabel: string;
  taxRate: number;
  subdomain: string;
}

export const LOCALES: Record<LocaleCode, LocaleConfig> = {
  pk: {
    code: "pk",
    country: "Pakistan",
    countryCode: "PK",
    currency: "PKR",
    currencySymbol: "₨",
    locale: "en-PK",
    taxLabel: "GST",
    taxRate: 0.17,
    subdomain: "pk",
  },
  ae: {
    code: "ae",
    country: "United Arab Emirates",
    countryCode: "AE",
    currency: "AED",
    currencySymbol: "د.إ",
    locale: "en-AE",
    taxLabel: "VAT",
    taxRate: 0.05,
    subdomain: "ae",
  },
  us: {
    code: "us",
    country: "United States",
    countryCode: "US",
    currency: "USD",
    currencySymbol: "$",
    locale: "en-US",
    taxLabel: "Tax",
    taxRate: 0.0, // Varies by state, calculated at checkout
    subdomain: "us",
  },
};

export const DEFAULT_LOCALE: LocaleCode = "pk";

/**
 * Detect locale from hostname subdomain
 * pk.nidaaly.com -> "pk"
 * ae.nidaaly.com -> "ae"
 * us.nidaaly.com -> "us"
 * localhost -> uses default or cookie
 */
export function detectLocaleFromHost(hostname: string): LocaleCode {
  const subdomain = hostname.split(".")[0];
  if (subdomain in LOCALES) return subdomain as LocaleCode;
  return DEFAULT_LOCALE;
}

/**
 * Get the price field name for a given locale
 * Used for dynamic Prisma field selection
 */
export function priceFieldForLocale(locale: LocaleCode): string {
  const map: Record<LocaleCode, string> = {
    pk: "pricePKR",
    ae: "priceAED",
    us: "priceUSD",
  };
  return map[locale];
}

export function compareAtPriceFieldForLocale(locale: LocaleCode): string {
  const map: Record<LocaleCode, string> = {
    pk: "compareAtPKR",
    ae: "compareAtAED",
    us: "compareAtUSD",
  };
  return map[locale];
}

/**
 * Format price for display
 * Prices stored in smallest unit (paisa/fils/cents)
 */
export function formatPrice(
  amountInSmallestUnit: number,
  locale: LocaleCode
): string {
  const config = LOCALES[locale];
  const divisor = locale === "pk" ? 100 : 100; // All use 100 subunits
  const amount = amountInSmallestUnit / divisor;

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: locale === "pk" ? 0 : 2,
    maximumFractionDigits: locale === "pk" ? 0 : 2,
  }).format(amount);
}

/**
 * Convert display price to smallest unit for storage
 */
export function toSmallestUnit(displayPrice: number): number {
  return Math.round(displayPrice * 100);
}

/**
 * Convert smallest unit to display price
 */
export function fromSmallestUnit(smallestUnit: number): number {
  return smallestUnit / 100;
}
