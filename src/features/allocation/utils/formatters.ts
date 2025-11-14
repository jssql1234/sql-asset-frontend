const DEFAULT_LOCALE = "en-MY";

export const formatCount = (value: number): string =>
  Number.isFinite(value) ? value.toLocaleString(DEFAULT_LOCALE) : "0";

export const formatPercentage = (value: number, fractionDigits = 1): string => {
  if (!Number.isFinite(value)) {
    return "0%";
  }

  const normalized = Math.max(0, value);
  return `${normalized.toFixed(fractionDigits)}%`;
};

export interface FormatCurrencyOptions {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export const formatCurrency = (
  value: number,
  {
    currency = "MYR",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  }: FormatCurrencyOptions = {}
): string => {
  if (!Number.isFinite(value)) {
    return `${currency} 0.00`;
  }

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

export type DateLike = string | Date | undefined;

export const parseDateLike = (value: DateLike): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const toIsoString = (value: DateLike): string | undefined => {
  const parsed = parseDateLike(value);
  return parsed ? parsed.toISOString() : undefined;
};

export const formatDate = (value: string | undefined): string => {
  if (!value) {
    return "TBD";
  }

  const parsed = parseDateLike(value);
  return parsed ? parsed.toLocaleDateString(DEFAULT_LOCALE) : "TBD";
};
