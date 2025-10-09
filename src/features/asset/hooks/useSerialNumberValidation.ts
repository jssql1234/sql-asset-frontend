import { useMemo } from "react";

export interface SerialNumberData {
  serial: string;
  remark: string;
}

export interface SerialNumberValidationResult {
  isValid: boolean;
  message: string;
  errors: Record<number, string>;
}

export interface ParsedSerialNumberData {
  serial?: string;
  serialNumber?: string;
  remark?: string;
  notes?: string;
  [key: string]: unknown;
}

export type SerialNumberObjectData = Record<string, string | undefined>;

export const useSerialNumberValidation = (
  serialNumbers: SerialNumberData[]
): SerialNumberValidationResult => {
  return useMemo(() => {
    const errors: Record<number, string> = {};

    if (serialNumbers.length === 0) {
      return { isValid: true, message: '', errors: {} };
    }

    const serialValues = serialNumbers.map(item => item.serial.trim());
    const hasAnySerialNumber = serialValues.some(value => value !== '');

    if (!hasAnySerialNumber) {
      return { isValid: true, message: '', errors: {} };
    }

    // Check if any serial numbers are filled but not all
    const emptySerialNumbers = serialValues.filter(value => value === '');
    const filledCount = serialNumbers.length - emptySerialNumbers.length;

    if (emptySerialNumbers.length > 0) {
      return {
        isValid: false,
        message: `Serial number validation failed: You have filled ${filledCount.toString()} out of ${serialNumbers.length.toString()} serial number fields. Please fill all serial number fields or leave them all empty.`,
        errors: {}
      };
    }

    // Check for duplicate serial numbers
    const seenSerials = new Set<string>();
    serialNumbers.forEach((item, index) => {
      if (item.serial.trim()) {
        if (seenSerials.has(item.serial.trim())) {
          errors[index] = 'Duplicate serial number';
        } else {
          seenSerials.add(item.serial.trim());
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      return {
        isValid: false,
        message: 'Duplicate serial numbers found. Please ensure all serial numbers are unique.',
        errors
      };
    }

    return { isValid: true, message: '', errors: {} };
  }, [serialNumbers]);
};

export const formatSerialNumbersForSubmission = (serialNumbers: SerialNumberData[]) => {
  return serialNumbers
    .filter(item => item.serial.trim() !== '')
    .map(item => ({
      serial: item.serial.trim(),
      remark: item.remark.trim()
    }));
};

export const parseSerialNumbersFromData = (
  data: ParsedSerialNumberData[] | SerialNumberObjectData,
  totalFields: number
): SerialNumberData[] => {
  const serialNumbers: SerialNumberData[] = [];

  // Handle different data formats
  if (Array.isArray(data)) {
    // If data is already an array of serial number objects
    data.forEach((item, index) => {
      if (index < totalFields) {
        serialNumbers.push({
          serial: (item.serial ?? item.serialNumber) ?? '',
          remark: (item.remark ?? item.notes) ?? ''
        });
      }
    });
  } else {
    // If data is an object with serial number fields
    for (let i = 1; i <= totalFields; i++) {
      const serialKey = `serial-${i.toString()}`;
      const remarkKey = `remark-${i.toString()}`;

      serialNumbers.push({
        serial: data[serialKey] ?? '',
        remark: data[remarkKey] ?? ''
      });
    }
  }

  // Fill remaining fields if needed
  while (serialNumbers.length < totalFields) {
    serialNumbers.push({ serial: '', remark: '' });
  }

  return serialNumbers;
};
