'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyCertificateSearchPage() {
  const router = useRouter();
  const [value, setValue] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const num = value.trim();
    if (num) router.push(`/verify-certificate/${encodeURIComponent(num)}`);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Verify a certificate</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the certificate number printed on a CareerMaster.AI certificate, or scan its QR code.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label htmlFor="certificate-number" className="block text-sm font-medium text-gray-700">
            Certificate number
          </label>
          <input
            id="certificate-number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="CM-XXXXXXXX-XXXXXXXX"
            autoComplete="off"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm uppercase tracking-wide focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            Verify
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-500">
          <Link href="/" className="hover:underline">
            CareerMaster.AI
          </Link>
        </p>
      </div>
    </main>
  );
}
