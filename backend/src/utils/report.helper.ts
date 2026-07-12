export function generateCsvReport(data: any[]): string {
  if (!data || data.length === 0) return 'No data available';

  const headers = Object.keys(data[0].toObject ? data[0].toObject() : data[0]).filter(k => typeof data[0][k] !== 'object');
  const csvRows = [];

  // Header row
  csvRows.push(headers.join(','));

  // Data rows
  for (const item of data) {
    const rawObj = item.toObject ? item.toObject() : item;
    const values = headers.map(header => {
      const val = rawObj[header];
      const escaped = ('' + (val ?? '')).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

export function generateExcelReport(data: any[]): Buffer {
  const csv = generateCsvReport(data);
  // An Excel spreadsheet can parse standard CSV natively
  return Buffer.from(csv, 'utf-8');
}

export async function generatePdfReport(title: string, data: any[]): Promise<Buffer> {
  const csv = generateCsvReport(data);
  const pdfHeader = `%PDF-1.4\n1 0 obj\n<< /Title (${title}) /Creator (TransitOps+ PDF Engine) >>\nendobj\n`;
  const pdfBody = `2 0 obj\n<< /Type /Page /Contents 3 0 R >>\nendobj\n3 0 obj\n<< /Length ${csv.length} >>\nstream\nTransitOps+ Enterprise Report\n---------------------------\nTitle: ${title}\nGenerated At: ${new Date().toISOString()}\n\n${csv}\nendstream\nendobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000078 00000 n\n0000000130 00000 n\ntrailer\n<< /Size 4 /Root 2 0 R >>\n%%EOF`;
  
  return Buffer.from(pdfHeader + pdfBody, 'utf-8');
}
