/**
 * Try to save the PDF locally. If the file is on another origin and CORS blocks it, opens a new tab.
 */
export async function downloadCertificatePdf(pdfUrl: string, filenameBase: string): Promise<void> {
  const safe = filenameBase.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '-').slice(0, 80) || 'certificate';
  const filename = safe.toLowerCase().endsWith('.pdf') ? safe : `${safe}.pdf`;

  try {
    const res = await fetch(pdfUrl, { mode: 'cors' });
    if (!res.ok) throw new Error('bad status');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  }
}
