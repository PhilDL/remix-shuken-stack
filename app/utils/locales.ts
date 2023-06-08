import { getClientLocales } from "remix-utils";

import { Currency } from "~/services/stripe/plans.ts";

export function getDefaultCurrency(request: Request) {
  const locales = getClientLocales(request);

  // Set a default currency if no locales are found.
  if (!locales) return Currency.DEFAULT_CURRENCY;

  return locales?.find((locale) => locale === "en-US")
    ? Currency.USD
    : Currency.EUR;
}

export const formatCurrency = (amount: number | null, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format((amount || 0) / 100);
};
