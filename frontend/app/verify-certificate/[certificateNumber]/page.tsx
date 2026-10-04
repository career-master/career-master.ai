'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiService } from '@/lib/api';

type VerifiedCertificate = {
  valid: boolean;
  certificateNumber: string;
  recipientName: string;
  subjectTitle: string;
  averagePercentage: number;
  assignedQuizCount?: number;
  issuedOnText?: string;
  issuedAt?: string;
  certificateScope?: 'subject' | 'topics';
  scopeDescription?: string;
  hasPdf?: boolean;
};

export default function VerifyCertificatePage() {
  const params = useParams<{ certificateNumber: string }>();
  const certificateNumber = decodeURIComponent(String(params?.certificateNumber || '')).trim();
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'valid'; cert: VerifiedCertificate } | { status: 'invalid'; message: string }
  >({ status: 'loading' });

  useEffect(() => {
    if (!certificateNumber) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiService.verifyCertificate(certificateNumber);
        if (cancelled) return;
        if (res.success && res.data) {
          setState({ status: 'valid', cert: res.data as VerifiedCertificate });
        } else {
          setState({ status: 'invalid', message: 'No certificate found with this number.' });
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setState({ status: 'invalid', message: e instanceof Error ? e.message : 'Verification failed.' });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [certificateNumber]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-[#152c52]">
            CareerMaster.AI
          </Link>
          <Link href="/verify-certificate" className="text-sm text-purple-700 hover:underline">
            Verify another certificate
          </Link>
        </div>

        {state.status === 'loading' ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            Verifying certificate…
          </div>
        ) : null}

        {state.status === 'invalid' ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-xl font-bold text-red-700">Certificate not verified</p>
            <p className="mt-2 text-sm text-red-700">{state.message}</p>
            <p className="mt-4 font-mono text-sm text-gray-700">{certificateNumber}</p>
          </div>
        ) : null}

        {state.status === 'valid' ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
              <p className="text-xl font-bold text-green-800">✓ Verified certificate</p>
              <p className="mt-1 text-sm text-green-800">
                This certificate was issued by CareerMaster.AI and is valid.
              </p>
              <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500">Awarded to</dt>
                  <dd className="font-semibold text-gray-900">{state.cert.recipientName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Course</dt>
                  <dd className="font-semibold text-gray-900">{state.cert.subjectTitle}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Score achieved</dt>
                  <dd className="font-semibold text-gray-900">
                    {Number(state.cert.averagePercentage).toFixed(1)}%
                    {state.cert.assignedQuizCount != null
                      ? ` across ${state.cert.assignedQuizCount} quiz${state.cert.assignedQuizCount === 1 ? '' : 'zes'}`
                      : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Date of issue</dt>
                  <dd className="font-semibold text-gray-900">{state.cert.issuedOnText || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Certificate number</dt>
                  <dd className="font-mono font-semibold text-gray-900">{state.cert.certificateNumber}</dd>
                </div>
                {state.cert.certificateScope === 'topics' && state.cert.scopeDescription ? (
                  <div>
                    <dt className="text-gray-500">Scope</dt>
                    <dd className="font-semibold text-gray-900">{state.cert.scopeDescription}</dd>
                  </div>
                ) : null}
              </dl>
              {state.cert.hasPdf ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={apiService.certificateVerifyPdfUrl(state.cert.certificateNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                  >
                    View original certificate
                  </a>
                  <a
                    href={apiService.certificateVerifyPdfUrl(state.cert.certificateNumber, true)}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    Download PDF
                  </a>
                </div>
              ) : null}
            </div>
        ) : null}
      </div>
    </main>
  );
}
