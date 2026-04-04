import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fileDateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Tabular data export — landscape PDF with auto page breaks. */
export function exportRowsToPdf(
  title: string,
  subtitle: string | undefined,
  headers: string[],
  rows: string[][],
  fileBase: string
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(title, 14, 16);
  let y = 20;
  if (subtitle) {
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(subtitle, 260);
    doc.text(lines, 14, 22);
    y = 22 + lines.length * 4 + 4;
    doc.setTextColor(30, 30, 30);
  }
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: y,
    styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
    headStyles: { fillColor: [185, 28, 28], textColor: 255 },
    margin: { left: 10, right: 10 },
    tableWidth: 'auto',
  });
  doc.save(`${fileBase}-${fileDateStamp()}.pdf`);
}

/** Word-compatible HTML table (.doc download). */
export function exportRowsToDoc(
  title: string,
  subtitle: string | undefined,
  headers: string[],
  rows: string[][],
  fileBase: string
): void {
  const esc = escapeHtml;
  let table = '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse;font-family:Arial;font-size:11px"><thead><tr>';
  for (const h of headers) {
    table += `<th style="background:#f3f4f6">${esc(h)}</th>`;
  }
  table += '</tr></thead><tbody>';
  for (const row of rows) {
    table += '<tr>';
    for (const c of row) {
      table += `<td>${esc(String(c))}</td>`;
    }
    table += '</tr>';
  }
  table += '</tbody></table>';
  const sub = subtitle ? `<p style="font-size:12px;color:#444">${esc(subtitle)}</p>` : '';
  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><title>${esc(
    title
  )}</title></head><body><h1 style="font-family:Arial;font-size:18px">${esc(title)}</h1>${sub}${table}<p style="font-size:10px;color:#888;font-family:Arial">Generated ${esc(
    new Date().toLocaleString()
  )}</p></body></html>`;
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${fileBase}-${fileDateStamp()}.doc`;
  a.click();
  URL.revokeObjectURL(a.href);
}
