import { apiService } from '@/lib/api';

/** Save the issued certificate PDF (fetched through the backend with the user's token). */
export async function downloadCertificatePdf(certificateId: string, filenameBase: string): Promise<void> {
  const safe = filenameBase.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '-').slice(0, 80) || 'certificate';
  const filename = safe.toLowerCase().endsWith('.pdf') ? safe : `${safe}.pdf`;

  const blob = await apiService.getCertificatePdfBlob(certificateId);
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
}

/** Open the issued certificate PDF in a new tab. */
export async function openCertificatePdf(certificateId: string): Promise<void> {
  // Open synchronously (inside the click) so popup blockers allow it; fill it once the PDF arrives.
  const win = window.open('', '_blank');
  try {
    const blob = await apiService.getCertificatePdfBlob(certificateId);
    const objectUrl = URL.createObjectURL(blob);
    if (win) {
      win.location.href = objectUrl;
    } else {
      window.location.href = objectUrl;
    }
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (e) {
    win?.close();
    throw e;
  }
}
