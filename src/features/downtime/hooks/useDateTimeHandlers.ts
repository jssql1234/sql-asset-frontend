import { useCallback } from "react";

type DateValue = string | Date | Date[] | string[] | undefined;

export function useDateTimeHandlers<T extends Record<string, unknown>>(
  updateField: <K extends keyof T>(field: K, value: T[K]) => void
) {
  const handleDateTimeChange = useCallback(
    (field: keyof T) => (date: DateValue) => {
      if (date instanceof Date) {
        updateField(field, date.toISOString() as T[keyof T]);
      } else if (typeof date === "string") {
        updateField(field, date as T[keyof T]);
      } else if (date === undefined) {
        updateField(field, undefined as T[keyof T]);
      }
    },
    [updateField]
  );

  return { handleDateTimeChange };
}
