'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

function DashboardQuizzesContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiService.getQuizzes(1, 20);
        if (res.success && res.data) {
          const payload: any = res.data;
          setQuizzes(Array.isArray(payload.items) ? payload.items : []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Available Quizzes</h1>
          <p className="text-gray-600 text-sm">
            Select a quiz and the timer will start as soon as you begin. When time is over, your
            answers are auto-submitted.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading quizzes...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : quizzes.length === 0 ? (
          <p className="text-sm text-gray-500">No quizzes are available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz._id}
                className="bg-white rounded-xl shadow-md p-4 border border-gray-200 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">{quiz.title}</h2>
                  {quiz.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-3">{quiz.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Duration:{' '}
                    <span className="font-semibold">
                      {quiz.durationMinutes || 30} minutes
                    </span>
                    {' • '}
                    Questions:{' '}
                    <span className="font-semibold">
                      {quiz.questions?.length || 0}
                    </span>
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  {quiz.batches && quiz.batches.length > 0 && (
                    <span className="text-[10px] text-gray-500">
                      Batches: {quiz.batches.join(', ')}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/quizzes/${quiz._id}`)}
                    className="ml-auto rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardQuizzesPage() {
  return (
    <ProtectedRoute>
      <DashboardQuizzesContent />
    </ProtectedRoute>
  );
}


