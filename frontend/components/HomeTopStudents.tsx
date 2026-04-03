'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import ProfileAvatar3D from '@/components/ProfileAvatar3D';

type Row = {
  userId: string;
  name: string;
  email?: string;
  rank: number;
  averageScore: number;
  totalAttempts: number;
  bestScore?: number;
  profilePicture?: string;
};

export default function HomeTopStudents() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiService.getTopPerformers({ limit: 3, sortBy: 'averageScore' });
        if (!cancelled && res.success && Array.isArray(res.data)) {
          setRows(res.data as Row[]);
        }
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || loading) {
    return (
      <div className="mb-4 rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 shadow-sm">
        <div className="h-24 animate-pulse rounded-lg bg-amber-100/60" />
      </div>
    );
  }

  if (rows.length === 0) {
    return null;
  }

  const cardRings = ['ring-amber-300', 'ring-slate-200', 'ring-orange-200'];

  return (
    <div className="mb-4 rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-6 shadow-md">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>
              🏆
            </span>
            Top students
          </h3>
          <p className="text-sm text-gray-600">
            Leading learners by average quiz score (all subjects). Complete quizzes to climb the board.
          </p>
        </div>
        <Link
          href="/dashboard/leaderboard"
          className="text-sm font-semibold text-purple-700 hover:text-purple-900 whitespace-nowrap"
        >
          Subject leaderboards →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {rows.slice(0, 3).map((r, i) => (
          <div
            key={r.userId}
            className={`relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm ring-2 ${cardRings[i] || 'ring-gray-200'} ${i === 0 ? 'sm:scale-[1.02]' : ''}`}
          >
            <div className="absolute right-3 top-3 text-3xl font-black text-black/10">#{r.rank}</div>
            <div className="flex items-center gap-3">
              <ProfileAvatar3D
                src={r.profilePicture}
                name={r.name}
                size="xl"
                className="ring-2 ring-white shadow-md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{r.name}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-purple-700">{r.averageScore?.toFixed(1) ?? '0'}%</span>
                  <span className="text-gray-400"> · </span>
                  {r.totalAttempts} attempt{r.totalAttempts !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
