'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { FALLBACK_DOMAINS } from '@/lib/constants';

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
  const [domainNames, setDomainNames] = useState<string[]>(FALLBACK_DOMAINS);
  const [categoriesFromApi, setCategoriesFromApi] = useState<string[]>([]);
  const [deleteModalQuiz, setDeleteModalQuiz] = useState<{ id: string; title: string } | null>(null);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);

  useEffect(() => {
    if (!filterDomain) {
      setCategoriesFromApi([]);
      return;
    }
    apiService.getCategories({ domain: filterDomain }).then((r) => {
      if (r.success && Array.isArray(r.data)) setCategoriesFromApi((r.data as { name: string }[]).map((c) => c.name));
      else setCategoriesFromApi([]);
    });
  }, [filterDomain]);

  // Preserve admin-defined category order (from API); append any from subjects not in API list
  const categoriesInDomain = useMemo(() => {
    if (!filterDomain) return [];
    const ordered = categoriesFromApi.filter((c): c is string => typeof c === 'string').filter((c) => c !== 'Technology' && c !== 'Olympiad Exams');
    const list = subjects.filter((s: any) => subjectInDomain(s, filterDomain));
    const fromSubjects = Array.from(new Set(list.map((s: any) => s.category).filter(Boolean))) as string[];
    fromSubjects.forEach((c) => {
      if (c !== 'Technology' && c !== 'Olympiad Exams' && !ordered.includes(c)) ordered.push(c);
    });
    return ordered;
  }, [subjects, filterDomain, categoriesFromApi]);

  // Preserve admin-defined subject order (from API)
  const subjectsForFilter = useMemo(() => {
    let list = subjects.filter((s: any) => filterDomain ? subjectInDomain(s, filterDomain) : true);
    if (filterDomain && filterDomain !== 'Olympiad Exams' && filterCategory) list = list.filter((s: any) => s.category === filterCategory);
    return list; // subjects from API already sorted by order
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
    (async () => {
      const res = await apiService.getDomains();
      if (res.success && Array.isArray(res.data)) setDomainNames((res.data as { name: string }[]).map((d) => d.name));
      else setDomainNames(FALLBACK_DOMAINS);
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
    ? quizzes.filter((q) => {
        const qLevel = (q.level === 'basic' || q.level === 'hard' ? q.level : (q.level == null || q.level === '' ? 'basic' : q.level));
        return String(qLevel).toLowerCase() === String(filterLevel).toLowerCase();
      })
    : quizzes;

  const handleLevelChange = async (quizId: string, value: string) => {
    setUpdatingLevelId(quizId);
    try {
      const level = value === '' ? null : (value as 'basic' | 'hard');
      await apiService.updateQuiz(quizId, { level });
      await loadQuizzes(page);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update level');
    } finally {
      setUpdatingLevelId(null);
    }
  };

  const handleConfirmDeleteQuiz = async () => {
    if (!deleteModalQuiz) return;
    setDeletingQuizId(deleteModalQuiz.id);
    try {
      const res = await apiService.deleteQuiz(deleteModalQuiz.id);
      if (res.success) {
        toast.success('Quiz deleted successfully.');
        setDeleteModalQuiz(null);
        setPage(1);
        await loadQuizzes(1);
      } else {
        toast.error((res as any).error?.message || (res as any).message || 'Failed to delete quiz');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete quiz');
    } finally {
      setDeletingQuizId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Delete quiz confirmation modal */}
      {deleteModalQuiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => !deletingQuizId && setDeleteModalQuiz(null)}
        >
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h5 className="font-bold text-gray-900 mb-2">Delete quiz?</h5>
            <p className="text-gray-600 text-sm mb-4">
              &quot;{deleteModalQuiz.title}&quot; will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteModalQuiz(null)}
                disabled={!!deletingQuizId}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQuiz}
                disabled={!!deletingQuizId}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingQuizId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
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
                  {domainNames.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              {filterDomain && filterDomain !== 'Olympiad Exams' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-600">Category:</span>
                  <select
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setFilterSubjectId('');
                      setFilterTopicId('');
                    }}
                    className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 min-w-[120px]"
                  >
                    <option value="">All</option>
                    {categoriesInDomain.length > 0 ? (
                      categoriesInDomain.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))
                    ) : (
                      <option value="" disabled>No categories yet</option>
                    )}
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
                  disabled={!filterDomain || (filterDomain !== 'Olympiad Exams' && !filterCategory)}
                  className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 min-w-[120px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!filterDomain ? 'Select domain first' : filterDomain !== 'Olympiad Exams' && !filterCategory ? 'Select category first' : 'All'}
                  </option>
                  {subjectsForFilter.map((s) => (
                    <option key={s._id} value={s._id}>{s.title}</option>
                  ))}
                </select>
              </div>
              {filterSubjectId && filterDomain && (filterDomain === 'Olympiad Exams' || filterCategory) && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm text-gray-600">Topic:</span>
                  <select
                    value={filterTopicId}
                    onChange={(e) => setFilterTopicId(e.target.value)}
                    className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500 min-w-[120px]"
                  >
                    <option value="">All</option>
                    {filterTopics.length > 0 ? (
                      filterTopics.map((t) => (
                        <option key={t._id} value={t._id}>{t.title}</option>
                      ))
                    ) : (
                      <option value="" disabled>No topics yet</option>
                    )}
                  </select>
                  {filterSubjectId && filterTopics.length === 0 && (
                    <Link
                      href={`/admin/subjects/new?subjectId=${filterSubjectId}`}
                      className="text-xs text-red-600 hover:text-red-800 font-medium whitespace-nowrap"
                    >
                      + Add topic
                    </Link>
                  )}
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
                  <option value="basic">Easy</option>
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
                ? `No quizzes for ${filterLevel === 'basic' ? 'Easy' : 'Hard'}.`
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
                            <option value="basic">Easy</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        {quiz.batches && quiz.batches.length > 0 && (
                          <span className="text-[10px] text-gray-500">
                            Batches: {quiz.batches.join(', ')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/quizzes/new?id=${quiz._id}`)}
                          title="Edit quiz"
                          className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteModalQuiz({ id: quiz._id, title: quiz.title || 'Untitled quiz' })}
                          title="Delete quiz"
                          className="p-1.5 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-900">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => loadQuizzes(page - 1)}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-500"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => loadQuizzes(page + 1)}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-500"
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


