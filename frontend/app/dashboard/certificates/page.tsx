'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { CertificateAchievementPreview } from '@/components/CertificateAchievementPreview';
import { downloadCertificatePdf } from '@/lib/downloadCertificatePdf';

type Row = {
  _id: string;
  subjectTitle: string;
  recipientName: string;
  averagePercentage: number;
  pdfUrl: string;
  issuedOnText?: string;
  createdAt?: string;
  certificateScope?: 'subject' | 'topics';
  scopeDescription?: string;
  certificateNumber?: string;
  assignedQuizCount?: number;
};

export default function DashboardCertificatesPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Row[]>([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const res = await apiService.getMyCertificates();
        if (res.success && res.data) {
          const d = res.data as { items?: Row[] };
          setItems(Array.isArray(d.items) ? d.items : []);
        } else {
          setErr('Could not load certificates');
        }
      } catch (e: unknown) {
        setErr(e instanceof Error ? e.message : 'Failed to load');
      }
    })();
  }, [isAuthenticated]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My certificates</h1>
        <p className="mt-1 text-sm text-gray-600">
          Certificates appear here only after your institution issues them. You must <strong>pass every assigned quiz</strong>{' '}
          in that subject (and meet the average score rule) to be eligible; attempted-but-failed quizzes do not qualify.
          Each row shows a <strong>preview</strong> using your details (same layout as the PDF). Use <strong>Download PDF</strong>{' '}
          for the official file your school generated.
        </p>
      </div>

      {err ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
      ) : null}

      {items.length === 0 ? (
        <p className="text-sm text-gray-600">You don&apos;t have any certificates yet.</p>
      ) : (
        <ul className="space-y-8">
          {items.map((row) => (
            <li
              key={row._id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-3">
                <p className="font-semibold text-gray-900">{row.subjectTitle}</p>
                <p className="text-xs text-gray-500">
                  Preview below matches your data; download for the signed-off PDF file.
                </p>
              </div>
              <div className="p-4">
                <CertificateAchievementPreview
                  recipientName={row.recipientName}
                  subjectTitle={row.subjectTitle}
                  averagePercentage={row.averagePercentage}
                  issuedOnText={row.issuedOnText}
                  quizAchievementDateText={row.issuedOnText}
                  certificateNumber={row.certificateNumber}
                  scopeDescription={
                    row.certificateScope === 'topics' && row.scopeDescription
                      ? `Scope: ${row.scopeDescription}`
                      : undefined
                  }
                  assignedQuizCount={row.assignedQuizCount}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void downloadCertificatePdf(row.pdfUrl, `${row.subjectTitle}-${row.certificateNumber || row._id}`)
                    }
                    className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                  >
                    Download PDF
                  </button>
                  <a
                    href={row.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    Open in new tab
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
