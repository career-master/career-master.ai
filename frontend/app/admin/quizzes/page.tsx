'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

export default function AdminQuizzesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const loadQuizzes = useCallback(async (pageNumber: number) => {
    try {
      setLoading(true);
      const res = await apiService.getQuizzes(pageNumber, 10);
      if (res.success && res.data) {
        const payload: any = res.data;
        setQuizzes(Array.isArray(payload.items) ? payload.items : []);
        setPage(payload.page || pageNumber);
        setTotalPages(payload.totalPages || 1);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin')) {
      router.push('/dashboard');
      return;
    }
    loadQuizzes(1);
  }, [isAuthenticated, user, router, loadQuizzes]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1>
            <p className="text-gray-600 text-sm">
              Quiz list with pagination and quick actions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push('/admin/quizzes/new')}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              + Add Quiz
            </button>
          </div>
        </div>

        {/* Existing Quizzes List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Existing Quizzes</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading quizzes...</p>
          ) : quizzes.length === 0 ? (
            <p className="text-sm text-gray-500">No quizzes created yet.</p>
          ) : (
            <>
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 mb-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">{quiz.title}</h3>
                      <span className="text-xs text-gray-500">
                        {quiz.durationMinutes} min • {quiz.questions?.length || 0} questions
                      </span>
                    </div>
                    {quiz.description && (
                      <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                        {quiz.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          quiz.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {quiz.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      {quiz.batches && quiz.batches.length > 0 && (
                        <span className="text-[10px] text-gray-500">
                          Batches: {quiz.batches.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => loadQuizzes(page - 1)}
                    className="rounded-lg border border-gray-300 px-2 py-1 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => loadQuizzes(page + 1)}
                    className="rounded-lg border border-gray-300 px-2 py-1 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


