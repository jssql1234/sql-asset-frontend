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
    const allOrNoneErrors: Record<number, string> = {};
    let allOrNoneMessage = '';
    const duplicateErrors: Record<number, string> = {};
    let duplicateMessage = '';

    if (serialNumbers.length === 0) {
      return { isValid: true, message: '', errors: {} };
    }

    const serialValues = serialNumbers.map(item => item.serial.trim());

    // Check if any serial numbers are filled but not all
    const filledCount = serialValues.filter(value => value !== '').length;
    const totalCount = serialNumbers.length;

    if (totalCount > 0 && filledCount > 0 && filledCount < totalCount) {
      allOrNoneMessage = 'Validation failed: Either all serial numbers must be filled, or all must be empty.';
      serialNumbers.forEach((item, index) => {
        if (item.serial.trim() === '') {
          allOrNoneErrors[index] = 'This field is required as other serial numbers are filled.';
        }
      });
    }

    // Check for duplicate serial numbers
    const seenSerials = new Set<string>();
    const duplicateValues = new Set<string>();

    serialNumbers.forEach((item) => {
      const trimmedSerial = item.serial.trim();
      if (trimmedSerial) {
        if (seenSerials.has(trimmedSerial)) {
          duplicateValues.add(trimmedSerial);
        } else {
          seenSerials.add(trimmedSerial);
        }
      }
    });

    if (duplicateValues.size > 0) {
      duplicateMessage = 'Duplicate serial numbers found. Please ensure all serial numbers are unique.';
      serialNumbers.forEach((item, index) => {
        if (duplicateValues.has(item.serial.trim())) {
          duplicateErrors[index] = 'Duplicate serial number';
        }
      });
    }

    const combinedErrors = { ...duplicateErrors, ...allOrNoneErrors };
    const isValid = Object.keys(combinedErrors).length === 0;

    return {
      isValid,
      message: allOrNoneMessage || duplicateMessage, // Prioritize the 'all or none' message
      errors: combinedErrors,
    };
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
