import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn<T> {
  id: string;
  header: string;
  key: string;
  getValue: (item: T, context?: unknown) => string | number;
}

interface ExportOptions {
  rootTag?: string;
  itemTag?: string;
  htmlTitle?: string;
}

export function exportTableData<T>(
  data: T[],
  columns: ExportColumn<T>[],
  selectedColumnIds: string[],
  format: string,
  filenamePrefix: string,
  extraContext?: unknown,
  options?: ExportOptions
): void {
  if (data.length === 0 || typeof window === 'undefined') {
    return;
  }

  const includedKeys = [...selectedColumnIds];
  // Note: Specific logic for adding extra columns like description should be handled by the caller

  const selectedColumns = columns.filter(c => includedKeys.includes(c.id));

  if (selectedColumns.length === 0) {
    return;
  }

  const headers = selectedColumns.map(c => c.header);
  const bodyRows = data.map(item => 
    selectedColumns.map(c => String(c.getValue(item, extraContext)))
  );

  const dateStr = new Date().toISOString().split('T')[0];
  const ext = format.toLowerCase();
  const filename = `${filenamePrefix}-${format.toUpperCase()}-${dateStr}.${ext}`;
  let blob: Blob | undefined;

  const escapeCsvField = (field: string): string => {
    return `"${field.replace(/"/g, '""')}"`;
  };

  const escapeXml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  switch (ext) {
    case 'csv': {
      const csvRows = [headers.map(escapeCsvField), ...bodyRows.map(row => row.map(escapeCsvField))];
      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      break;
    }

    case 'json': {
      const jsonData = data.map(item => {
        const obj: Record<string, string> = {};
        selectedColumns.forEach(col => {
          obj[col.key] = String(col.getValue(item, extraContext));
        });
        return obj;
      });
      blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      break;
    }

    case 'txt': {
      const txtContent = [headers.join('\t'), ...bodyRows.map(row => row.join('\t'))].join('\n');
      blob = new Blob([txtContent], { type: 'text/plain' });
      break;
    }

    case 'html': {
      const htmlTitle = options?.htmlTitle ?? 'Data Export';
      const htmlContent = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${htmlTitle}</title>
          <style>table { border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #f2f2f2; }</style>
        </head>
        <body>
          <h1>${htmlTitle}</h1>
          <table>
            <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${bodyRows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </body>
      </html>`;
      blob = new Blob([htmlContent], { type: 'text/html' });
      break;
    }

    case 'xml': {
      const rootTag = options?.rootTag ?? 'data';
      const itemTag = options?.itemTag ?? 'item';
      let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n`;
      data.forEach(item => {
        xmlContent += `  <${itemTag}>\n`;
        selectedColumns.forEach(col => {
          const value = String(col.getValue(item, extraContext));
          const escapedValue = escapeXml(value);
          xmlContent += `    <${col.key}>${escapedValue}</${col.key}>\n`;
        });
        xmlContent += `  </${itemTag}>\n`;
      });
      xmlContent += `</${rootTag}>`;
      blob = new Blob([xmlContent], { type: 'application/xml' });
      break;
    }

    case 'xlsx': {
      const wsData = data.map(item => {
        const row: Record<string, string> = {};
        selectedColumns.forEach(col => {
          row[col.header] = String(col.getValue(item, extraContext));
        });
        return row;
      });
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, filenamePrefix.replace(/[^a-zA-Z0-9]/g, '_'));
      const arrayBuffer = XLSX.write(wb, { type: 'array' }) as ArrayBuffer;
      blob = new Blob([arrayBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      break;
    }

    case 'pdf': {
      const doc = new jsPDF('l', 'mm', 'a4');
      autoTable(doc, {
        head: [headers],
        body: bodyRows,
        startY: 20,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        margin: { top: 20 }
      });
      blob = doc.output('blob');
      break;
    }

    default:
      console.warn('Unsupported export format:', format);
      return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
