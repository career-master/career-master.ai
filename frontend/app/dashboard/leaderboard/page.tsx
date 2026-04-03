'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import SubjectLeaderboardView from '@/components/SubjectLeaderboardView';

export default function DashboardLeaderboardPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="py-4">
      <SubjectLeaderboardView />
    </div>
  );
}
