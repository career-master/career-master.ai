'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import SubjectLeaderboardView from '@/components/SubjectLeaderboardView';

export default function AdminLeaderboardPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, loading, router]);

  if (loading || !isAuthenticated || !user?.roles?.includes('super_admin')) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <SubjectLeaderboardView
      title="Subject leaderboard"
      subtitle="View student rankings per subject. Counts only quiz attempts linked to that subject through topic / quiz set (same as the student-facing leaderboard page)."
      enableDocumentExport
    />
  );
}
