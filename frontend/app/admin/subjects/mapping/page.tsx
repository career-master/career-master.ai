'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect to unified Subjects & Topics page.
 * Mapping is now part of /admin/subjects (same page, quiz-style filters + table).
 */
export default function ManageMappingRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/subjects');
  }, [router]);
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Redirecting to Subjects & Topics...</p>
    </div>
  );
}
