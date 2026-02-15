'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

const DOMAINS = [
  '3 CLASS', '4 CLASS', '5 CLASS', '6 CLASS', '7 CLASS', '8 CLASS', '9 CLASS', '10 CLASS',
  'INTER (10+2)', 'Technology', 'Olympiad Exams',
  'National Level (All-India) Government Exams', 'STATE LEVEL GOVT EXAMS', 'STATE LEVEL ENTRANCE EXAMS',
  'National Level (All-India) Entrance Exams',
];

type LevelFilter = '' | 'basic' | 'hard';

const subjectInDomain = (s: any, domain: string) =>
  s.domain === domain || (domain === 'Technology' && s.category === 'Technology');

export default function AdminQuizzesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterLevel, setFilterLevel] = useState<LevelFilter>('');
  const [filterDomain, setFilterDomain] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubjectId, setFilterSubjectId] = useState('');
  const [filterTopicId, setFilterTopicId] = useState('');
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filterTopics, setFilterTopics] = useState<any[]>([]);
  const [updatingLevelId, setUpdatingLevelId] = useState<string | null>(null);

  const categoriesInDomain = useMemo(() => {
    if (!filterDomain) return [];
    const list = subjects.filter((s: any) => subjectInDomain(s, filterDomain));
    const cats = Array.from(new Set(list.map((s: any) => s.category).filter(Boolean))) as string[];
    return cats.filter((c) => c !== 'Technology' && c !== 'Olympiad Exams');
  }, [subjects, filterDomain]);

  const subjectsForFilter = useMemo(() => {
    let list = subjects.filter((s: any) => filterDomain ? subjectInDomain(s, filterDomain) : true);
    if (filterDomain && filterDomain !== 'Olympiad Exams' && filterCategory) list = list.filter((s: any) => s.category === filterCategory);
    return list;
  }, [subjects, filterDomain, filterCategory]);

  const loadQuizzes = useCallback(async (pageNumber: number) => {
    try {
      setLoading(true);
      const opts: { all?: boolean; domain?: string; subjectId?: string; topicId?: string } = {};
      if (filterTopicId) opts.topicId = filterTopicId;
      else if (filterSubjectId) opts.subjectId = filterSubjectId;
      else if (filterDomain) opts.domain = filterDomain;
      else opts.all = true;
      const res = await apiService.getQuizzes(pageNumber, 10, opts);
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
  }, [filterDomain, filterSubjectId, filterTopicId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin')) {
      router.push('/dashboard');
      return;
    }
    (async () => {
      const res = await apiService.getSubjects({ limit: 500 });
      if (res.success && res.data?.items) setSubjects(res.data.items);
    })();
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (!filterSubjectId) {
      setFilterTopics([]);
      setFilterTopicId('');
      return;
    }
    (async () => {
      const res = await apiService.getTopics(filterSubjectId);
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data as any)?.items ?? [];
        setFilterTopics(list);
      } else setFilterTopics([]);
    })();
  }, [filterSubjectId]);

  useEffect(() => {
    if (!isAuthenticated || !user?.roles?.includes('super_admin')) return;
    loadQuizzes(1);
  }, [isAuthenticated, user, loadQuizzes]);

  const filteredQuizzes = filterLevel
    ? quizzes.filter((q) => q.level === filterLevel)
    : quizzes;

  const handleLevelChange = async (quizId: string, value: string) => {
    setUpdatingLevelId(quizId);
    try {
      const level = value === '' ? null : (value as 'basic' | 'hard');
      await apiService.updateQuiz(quizId, { level });
      await loadQuizzes(page);
    } catch (err: any) {
      alert(err?.message || 'Failed to update level');
    } finally {
      setUpdatingLevelId(null);
    }
  };

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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-900">Existing Quizzes</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-600">Domain:</span>
                <select
                  value={filterDomain}
                  onChange={(e) => {
                    setFilterDomain(e.target.value);
                    setFilterCategory('');
                    setFilterSubjectId('');
                    setFilterTopicId('');
                  }}
                  className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="">All</option>
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              {filterDomain && filterDomain !== 'Olympiad Exams' && categoriesInDomain.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-600">Category:</span>
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setFilterSubjectId('');
                      setFilterTopicId('');
                    }}
                    className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  >
                    <option value="">All</option>
                    {categoriesInDomain.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-600">Subject:</span>
                <select
                  value={filterSubjectId}
                  onChange={(e) => {
                    setFilterSubjectId(e.target.value);
                    setFilterTopicId('');
                  }}
                  className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 min-w-[120px]"
                >
                  <option value="">All</option>
                  {subjectsForFilter.map((s) => (
                    <option key={s._id} value={s._id}>{s.title}</option>
                  ))}
                </select>
              </div>
              {filterSubjectId && filterTopics.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-600">Topic:</span>
                  <select
                    value={filterTopicId}
                    onChange={(e) => setFilterTopicId(e.target.value)}
                    className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 min-w-[120px]"
                  >
                    <option value="">All</option>
                    {filterTopics.map((t) => (
                      <option key={t._id} value={t._id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-600">Level:</span>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value as LevelFilter)}
                  className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="">All</option>
                  <option value="basic">Basic</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading quizzes...</p>
          ) : filteredQuizzes.length === 0 ? (
            <p className="text-sm text-gray-500">
              {filterLevel
                ? `No quizzes for ${filterLevel === 'basic' ? 'Basic' : 'Hard'}.`
                : 'No quizzes created yet.'}
            </p>
          ) : (
            <>
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 mb-4">
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">{quiz.title}</h3>
                      <span className="text-xs text-gray-500">
                        {quiz.durationMinutes} min • {
                          quiz.useSections && quiz.sections
                            ? quiz.sections.reduce((total: number, section: any) => total + (section.questions?.length || 0), 0)
                            : quiz.questions?.length || 0
                        } questions
                        {quiz.useSections && quiz.sections && (
                          <span className="ml-1 text-purple-600">({quiz.sections.length} sections)</span>
                        )}
                      </span>
                    </div>
                    {quiz.description && (
                      <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                        {quiz.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            quiz.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {quiz.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-500">Level:</span>
                          <select
                            value={quiz.level || ''}
                            onChange={(e) => handleLevelChange(quiz._id, e.target.value)}
                            disabled={updatingLevelId === quiz._id}
                            className="rounded border border-gray-300 px-2 py-0.5 text-[11px] text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:opacity-60"
                          >
                            <option value="">All</option>
                            <option value="basic">Basic</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        {quiz.batches && quiz.batches.length > 0 && (
                          <span className="text-[10px] text-gray-500">
                            Batches: {quiz.batches.join(', ')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/quizzes/new?id=${quiz._id}`)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
                              try {
                                const res = await apiService.deleteQuiz(quiz._id);
                                if (res.success) {
                                  await loadQuizzes(page);
                                }
                              } catch (err: any) {
                                alert(err.message || 'Failed to delete quiz');
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
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


