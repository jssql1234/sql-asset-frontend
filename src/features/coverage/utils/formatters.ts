export interface FormatCurrencyOptions {
  locale?: string;
  currencyPrefix?: string;
}

const DEFAULT_CURRENCY_OPTIONS: Required<FormatCurrencyOptions> = {
  locale: "en-MY",
  currencyPrefix: "RM",
};

export const formatCurrency = (value: number, options: FormatCurrencyOptions = {}): string => {
  const { locale, currencyPrefix } = { ...DEFAULT_CURRENCY_OPTIONS, ...options };
  const formattingOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  };

  return `${currencyPrefix} ${value.toLocaleString(locale, formattingOptions)}`;
};

export interface FormatDateOptions {
  locale?: string;
  dateStyle?: "full" | "long" | "medium" | "short";
}

const DEFAULT_DATE_OPTIONS: Required<FormatDateOptions> = {
  locale: "en-GB",
  dateStyle: "medium",
};

export const formatDate = (isoDate: string, options: FormatDateOptions = {}): string => {
  const { locale, dateStyle } = { ...DEFAULT_DATE_OPTIONS, ...options };
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat(locale, { dateStyle }).format(date);
};