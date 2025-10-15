// Generic CSV row interface
export type CSVRow = Record<string, string>;

// Configuration for different data types
export interface CSVConfig<T> {
  headers: string[];
  transformToRow: (item: T) => CSVRow;
  transformFromRow: (row: CSVRow) => { data: T; errors: string[] };
  filename: string;
}

// Generic CSV service functions
export function exportToCSV<T>(items: T[], config: CSVConfig<T>): void {
  const csvData: CSVRow[] = items.map(config.transformToRow);
  const csvContent = convertToCSV(csvData);
  downloadCSV(csvContent, config.filename);
}

export function importFromCSV<T>(
  csvText: string,
  config: CSVConfig<T>
): { items: T[]; errors: string[] } {
  const errors: string[] = [];
  const items: T[] = [];

  try {
    const rows = parseCSV(csvText);

    // Validate headers
    if (rows.length === 0) {
      errors.push('CSV file is empty');
      return { items, errors };
    }

    const headers = rows[0];
    const expectedHeaders = config.headers;

    for (const expected of expectedHeaders) {
      if (!headers.includes(expected)) {
        errors.push(`Missing required column: ${expected}`);
      }
    }

    if (errors.length > 0) {
      return { items, errors };
    }

    // Process data rows
    for (let i = 1; i < rows.length; i++) {
      const rowData: CSVRow = {};
      const row = rows[i];

      if (row.length !== expectedHeaders.length) {
        errors.push(`Row ${(i + 1).toString()}: Invalid number of columns`);
        continue;
      }

      // Map row values to headers
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });

      const { data, errors: rowErrors } = config.transformFromRow(rowData);

      if (rowErrors.length > 0) {
        errors.push(`Row ${(i + 1).toString()}: ${rowErrors.join(', ')}`);
        continue;
      }

      items.push(data);
    }
  } catch (error) {
    errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { items, errors };
}

// Utility functions
function convertToCSV(data: CSVRow[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      // End of row
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
        currentRow = [];
        currentField = '';
      }
      if (char === '\r' && nextChar === '\n') {
        i++; // Skip \n after \r
      }
    } else {
      currentField += char;
    }
  }

  // Handle last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows;
}