import type { UserGroup } from '@/types/user-group';

export interface CSVRow {
  ID: string;
  Name: string;
  Description: string;
}

export function exportToCSV(groups: UserGroup[]): void {
  const csvData: CSVRow[] = groups.map(group => ({
    ID: group.id,
    Name: group.name,
    Description: group.description || ''
  }));

  const csvContent = convertToCSV(csvData);
  downloadCSV(csvContent, 'user-groups.csv');
}

export function importFromCSV(csvText: string): { groups: UserGroup[]; errors: string[] } {
  const errors: string[] = [];
  const groups: UserGroup[] = [];

  try {
    const rows = parseCSV(csvText);

    // Validate headers
    if (rows.length === 0) {
      errors.push('CSV file is empty');
      return { groups, errors };
    }

    const headers = rows[0];
    const expectedHeaders = ['ID', 'Name', 'Description'];

    for (const expected of expectedHeaders) {
      if (!headers.includes(expected)) {
        errors.push(`Missing required column: ${expected}`);
      }
    }

    if (errors.length > 0) {
      return { groups, errors };
    }

    // Process data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length !== 3) {
        errors.push(`Row ${i + 1}: Invalid number of columns`);
        continue;
      }

      const [id, name, description] = row;

      // Validate required fields
      if (!id?.trim()) {
        errors.push(`Row ${i + 1}: ID is required`);
        continue;
      }

      if (!name?.trim()) {
        errors.push(`Row ${i + 1}: Name is required`);
        continue;
      }

      // Check for duplicate IDs in the import
      if (groups.some(g => g.id === id.trim())) {
        errors.push(`Row ${i + 1}: Duplicate ID "${id.trim()}" in import file`);
        continue;
      }

      // Create group with empty permissions (can be edited later)
      groups.push({
        id: id.trim(),
        name: name.trim(),
        description: description?.trim() || '',
        defaultPermissions: {} // Empty permissions for imported groups
      });
    }
  } catch (error) {
    errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { groups, errors };
}

function convertToCSV(data: CSVRow[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header as keyof CSVRow];
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

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
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