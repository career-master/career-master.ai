'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

type Subject = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  batches?: string[];
};

type Topic = {
  _id: string;
  subjectId: string;
  title: string;
  description?: string;
  order?: number;
  parentTopicId?: string | null;
};

type QuizSet = {
  _id: string;
  topicId: string;
  quizId: string | { _id: string; title?: string; durationMinutes?: number; description?: string; useSections?: boolean; sections?: any[]; questions?: any[] };
  setName?: string;
  order?: number;
};

type TopicProgress = {
  completedQuizzes?: Array<{
    quizId: string | { _id: string };
    percentage?: number;
  }>;
};

type TopicWithQuizzes = {
  topic: Topic;
  quizSets: QuizSet[];
  progress: TopicProgress | null;
};

type StandaloneQuiz = {
  _id: string;
  name?: string;
  title?: string;
  description?: string;
  durationMinutes?: number;
  questionCount?: number;
  totalMarks?: number;
  attemptsMade?: number;
  maxAttempts?: number;
  canAttempt?: boolean;
  isCompleted?: boolean;
  level?: 'beginner' | 'intermediate' | 'advanced' | null;
};

export default function DashboardQuizzesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [topicsWithQuizzes, setTopicsWithQuizzes] = useState<TopicWithQuizzes[]>([]);
  const [standaloneQuizzes, setStandaloneQuizzes] = useState<StandaloneQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRootIds, setExpandedRootIds] = useState<Set<string>>(new Set());
  // Pagination for sub-topics when they exceed the limit (per root)
  const [subTopicPageByRoot, setSubTopicPageByRoot] = useState<Record<string, number>>({});
  const [subSidebarPageByRoot, setSubSidebarPageByRoot] = useState<Record<string, number>>({});
  // Pagination for the main list of topic cards (roots) on the right when there are many
  const [rootTopicPage, setRootTopicPage] = useState(1);
  // When set: right panel shows ONLY this topic's card (main quiz + sub-topics). Clicking a topic in sidebar sets this.
  const [selectedRootId, setSelectedRootId] = useState<string | null>(null);
  // User preference: selected levels (multi-select). Empty = show all. Persisted in localStorage.
  const [selectedLevels, setSelectedLevels] = useState<Set<'beginner' | 'intermediate' | 'advanced'>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const v = localStorage.getItem('quiz_level_preference');
      if (!v || v === 'all') return new Set();
      if (['beginner', 'intermediate', 'advanced'].includes(v)) return new Set([v]);
      const arr = JSON.parse(v);
      if (Array.isArray(arr)) {
        const valid = arr.filter((x: string) => ['beginner', 'intermediate', 'advanced'].includes(x));
        return new Set(valid);
      }
    } catch {}
    return new Set();
  });

  const SUB_TOPICS_PER_PAGE = 4;
  const SUB_SIDEBAR_PER_PAGE = 5;
  const ROOT_TOPICS_PER_PAGE = 6;

  useEffect(() => {
    const s = searchParams.get('subject');
    if (s) setSelectedSubjectId(s);
  }, [searchParams]);

  // Reset root-topic pagination and focused topic when subject changes
  useEffect(() => {
    setRootTopicPage(1);
    setSelectedRootId(null);
  }, [selectedSubjectId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [authLoading, isAuthenticated, router]);

  // Persist selected levels to localStorage when they change
  useEffect(() => {
    try {
      const raw = selectedLevels.size === 0 ? 'all' : JSON.stringify([...selectedLevels]);
      localStorage.setItem('quiz_level_preference', raw);
    } catch {}
  }, [selectedLevels]);

  // Load subjects and standalone (no level filter here; level filters only topic quizzes when a subject is selected)
  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [subjRes, standRes] = await Promise.all([
          apiService.getSubjects({ page: 1, limit: 200, isActive: true }),
          apiService.getAvailableQuizzesForUser((user as any)?.email || ''),
        ]);
        if (subjRes.success && subjRes.data?.items) {
          setSubjects(subjRes.data.items);
        }
        const stand: any = standRes;
        if (standRes?.success && (stand?.presentQuizzes || stand?.data?.items)) {
          const list = Array.isArray(stand.presentQuizzes) ? stand.presentQuizzes : (stand.data?.items || []);
          setStandaloneQuizzes(list);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, (user as any)?.email]);

  // Load topics + quiz sets + progress for selected subject (used on mount and when refetching after quiz)
  const loadTopicsWithProgress = useCallback(async (forceFresh = false) => {
    if (!selectedSubjectId || !isAuthenticated) return;
    setLoadingQuizzes(true);
    const cacheBuster = forceFresh ? Date.now() : undefined;
    try {
      const allRes = await apiService.getTopics(selectedSubjectId, true);
      const all: Topic[] = (allRes.success && Array.isArray(allRes.data)) ? allRes.data : [];
      const roots = all.filter((t) => !t.parentTopicId || t.parentTopicId === null).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const ordered: Topic[] = [];
      roots.forEach((r) => {
        ordered.push(r);
        const children = all.filter((t) => t.parentTopicId === r._id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        ordered.push(...children);
      });
      const inOrder = new Set(ordered.map((t) => t._id));
      all.forEach((t) => {
        if (!inOrder.has(t._id)) ordered.push(t);
      });

      const withData = await Promise.all(
        ordered.map(async (topic) => {
          const [qsRes, progRes] = await Promise.all([
            apiService.getQuizSetsByTopic(topic._id, true),
            apiService.getTopicProgress(topic._id, cacheBuster).catch(() => ({ success: false, data: null })),
          ]);
          const quizSets: QuizSet[] = (qsRes.success && Array.isArray(qsRes.data)) ? qsRes.data : [];
          const progress: TopicProgress | null = progRes?.success && progRes?.data ? (progRes.data as TopicProgress) : null;
          return { topic, quizSets, progress };
        })
      );
      setTopicsWithQuizzes(withData);
    } catch {
      setTopicsWithQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  }, [selectedSubjectId, isAuthenticated]);

  // When subject selected: load topics + progress (always force fresh so progress bars stay current)
  useEffect(() => {
    if (!isAuthenticated || !selectedSubjectId) {
      setTopicsWithQuizzes([]);
      return;
    }
    loadTopicsWithProgress(true);
  }, [selectedSubjectId, isAuthenticated, loadTopicsWithProgress]);

  // Refetch progress when user returns to this page (e.g. after finishing a quiz) so progress bars update
  useEffect(() => {
    if (!selectedSubjectId) return;
    let lastRefetch = 0;
    const refetch = () => {
      const now = Date.now();
      if (now - lastRefetch < 2000) return; // throttle 2s
      lastRefetch = now;
      loadTopicsWithProgress(true);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) refetch(); // restored from bfcache (e.g. back button)
    };
    window.addEventListener('focus', refetch); // refetch when window gains focus (e.g. after returning from quiz)
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('focus', refetch);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [selectedSubjectId, loadTopicsWithProgress]);

  const userBatches = (user as any)?.batches || [];
  const hasAccess = (s: Subject) =>
    !s.batches || s.batches.length === 0 || userBatches.some((b: string) => s.batches?.includes(b));

  // Group subjects by category (like subjects page)
  const groupedByCategory = useMemo(() => {
    const filtered = subjects.filter((s) => {
      const q = (searchQuery || '').toLowerCase();
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        (s.category || '').toLowerCase().includes(q)
      );
    });
    const acc: Record<string, Subject[]> = {};
    filtered.forEach((s) => {
      const cat = s.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(s);
    });
    return acc;
  }, [subjects, searchQuery]);

  const filteredStandalone = useMemo(() => {
    const q = (searchQuery || '').toLowerCase();
    if (!q) return standaloneQuizzes;
    return standaloneQuizzes.filter(
      (c) =>
        (c.name || c.title || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
    );
  }, [standaloneQuizzes, searchQuery]);

  const selectedSubject = subjects.find((s) => s._id === selectedSubjectId);
  const showStandaloneOnly = !selectedSubjectId;

  // When a subject is selected, filter by selected levels. Empty = show all. Otherwise show only quizzes
  // whose level is in the selection; quizzes with no level are excluded when any level is selected.
  const filteredTopicsWithQuizzes = useMemo(() => {
    if (selectedLevels.size === 0) return topicsWithQuizzes;
    return topicsWithQuizzes.map((tw) => ({
      ...tw,
      quizSets: tw.quizSets.filter((qs) => {
        const q = qs.quizId && typeof qs.quizId === 'object' ? (qs.quizId as { level?: string }) : null;
        if (!q) return false;
        return !!q.level && selectedLevels.has(q.level as 'beginner' | 'intermediate' | 'advanced');
      }),
    }));
  }, [topicsWithQuizzes, selectedLevels]);

  // Build tree: roots (no parent) and their children (parentTopicId = root). Use level-filtered quiz sets.
  const topicTree = useMemo(() => {
    const roots = filteredTopicsWithQuizzes.filter((tw) => !tw.topic.parentTopicId || tw.topic.parentTopicId === null);
    return roots.map((r) => {
      const children = filteredTopicsWithQuizzes.filter((tw) => tw.topic.parentTopicId === r.topic._id);
      return { ...r, children };
    });
  }, [filteredTopicsWithQuizzes]);

  // Paginated roots for the right-panel topic list (avoids IIFE in JSX)
  const rootsPagination = useMemo(() => {
    const filtered = topicTree.filter((r) => r.quizSets.length > 0 || r.children.some((c) => c.quizSets.length > 0));
    const total = filtered.length;
    const need = total > ROOT_TOPICS_PER_PAGE;
    const page = need ? rootTopicPage : 1;
    const totalPages = need ? Math.ceil(total / ROOT_TOPICS_PER_PAGE) : 1;
    const list = need ? filtered.slice((page - 1) * ROOT_TOPICS_PER_PAGE, page * ROOT_TOPICS_PER_PAGE) : filtered;
    const start = (page - 1) * ROOT_TOPICS_PER_PAGE + 1;
    const end = Math.min(page * ROOT_TOPICS_PER_PAGE, total);
    return { list, total, need, page, totalPages, start, end };
  }, [topicTree, rootTopicPage]);

  // When user clicks a topic in sidebar (e.g. MONGODB): show ONLY that topic's card. focusedRoot is that topic; rootsToShow is [focusedRoot] or rootsPagination.list.
  const filteredRoots = topicTree.filter((r) => r.quizSets.length > 0 || r.children.some((c) => c.quizSets.length > 0));
  const focusedRoot = selectedRootId ? filteredRoots.find((r) => String(r.topic._id) === String(selectedRootId)) ?? null : null;
  const rootsToShow = focusedRoot ? [focusedRoot] : rootsPagination.list;
  const showMainPagination = !focusedRoot && rootsPagination.need;

  const toggleExpanded = (topicId: string) => {
    setExpandedRootIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  const setSubTopicPage = (rootId: string, page: number) => {
    setSubTopicPageByRoot((prev) => ({ ...prev, [rootId]: page }));
  };
  const setSubSidebarPage = (rootId: string, page: number) => {
    setSubSidebarPageByRoot((prev) => ({ ...prev, [rootId]: page }));
  };

  // Sub-header: "C - Intro" -> "Intro", "C - Arrays & Strings" -> "Arrays & Strings"
  const getSubTopicLabel = (childTitle: string) => {
    if (!childTitle || !childTitle.includes(' - ')) return childTitle;
    return childTitle.split(' - ').slice(1).join(' - ').trim();
  };

  const handleStartQuiz = (quizId: string, duration?: number, isStandalone?: boolean) => {
    if (!(user as any)?.email) return;
    const returnUrl = isStandalone ? '/dashboard/quizzes' : `/dashboard/quizzes?subject=${selectedSubjectId || ''}`;
    try {
      localStorage.setItem(`quiz_return_url_${(user as any).email}_${quizId}`, returnUrl);
    } catch {}
    const durKey = `quiz_duration_${(user as any).email}_${quizId}`;
    const limitKey = `quiz_time_limit_${(user as any).email}_${quizId}`;
    if (duration) try { localStorage.setItem(durKey, String(duration)); } catch {}
    try { localStorage.setItem(limitKey, 'true'); } catch {}
    router.push(`/dashboard/quizzes/${quizId}/instructions`);
  };

  const updateUrl = (subject: string | null) => {
    if (subject) {
      router.replace(`/dashboard/quizzes?subject=${subject}`, { scroll: false });
    } else {
      router.replace('/dashboard/quizzes', { scroll: false });
    }
  };

  // Helper: get attempted and passed counts for a topic (for progress bar — bar shows attempted so it updates after retake)
  const getTopicProgressCounts = (quizSets: QuizSet[], progress: TopicProgress | null) => {
    const total = quizSets.length;
    if (!progress?.completedQuizzes?.length || total === 0) return { attempted: 0, passed: 0, total };
    const attemptedIds = new Set(
      progress.completedQuizzes.map((c) => String(typeof c.quizId === 'string' ? c.quizId : (c.quizId as any)?._id))
    );
    const passedIds = new Set(
      progress.completedQuizzes
        .filter((c) => (typeof c.percentage === 'number' ? c.percentage : 0) >= 60)
        .map((c) => String(typeof c.quizId === 'string' ? c.quizId : (c.quizId as any)?._id))
    );
    let attempted = 0;
    let passed = 0;
    quizSets.forEach((qs) => {
      const id = typeof qs.quizId === 'object' ? (qs.quizId as any)?._id : qs.quizId;
      if (!id) return;
      if (attemptedIds.has(String(id))) attempted++;
      if (passedIds.has(String(id))) passed++;
    });
    return { attempted, passed, total };
  };

  // Helper: get quiz status from progress
  const getQuizStatus = (progress: TopicProgress | null, quizId: string) => {
    if (!progress?.completedQuizzes) return 'not_attempted';
    const q = progress.completedQuizzes.find(
      (c) => String(typeof c.quizId === 'string' ? c.quizId : (c.quizId as any)?._id) === String(quizId)
    );
    if (!q) return 'not_attempted';
    const pct = typeof q.percentage === 'number' ? q.percentage : 0;
    return pct >= 60 ? 'completed' : 'attempted';
  };

  // Colored tag for quiz level (Beginner=green, Intermediate=amber, Advanced=rose)
  const LevelTag = ({ level }: { level: 'beginner' | 'intermediate' | 'advanced' }) => {
    const styles: Record<string, string> = {
      beginner: 'bg-emerald-100 text-emerald-800',
      intermediate: 'bg-amber-100 text-amber-800',
      advanced: 'bg-rose-100 text-rose-800',
    };
    const labels: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[level]}`}>
        {labels[level]}
      </span>
    );
  };

  // Helper: normalize quiz from QuizSet for list row
  const quizRow = (qs: QuizSet, progress: TopicProgress | null, canAttempt: boolean) => {
    const quiz = typeof qs.quizId === 'object' ? qs.quizId : null;
    const id = quiz?._id || (typeof qs.quizId === 'string' ? qs.quizId : null);
    if (!id) return null;
    const q = quiz as any;
    let qCount = 0;
    let marks = 0;
    if (q?.useSections && Array.isArray(q?.sections)) {
      q.sections.forEach((s: any) => {
        (s.questions || []).forEach((qq: any) => {
          qCount++;
          marks += qq?.marks ?? 1;
        });
      });
    } else if (Array.isArray(q?.questions)) {
      q.questions.forEach((qq: any) => {
        qCount++;
        marks += qq?.marks ?? 1;
      });
    }
    const status = getQuizStatus(progress, String(id));
    const lvl = (quiz as any)?.level;
    return {
      _id: String(id),
      title: (quiz as any)?.title || 'Quiz',
      durationMinutes: (quiz as any)?.durationMinutes,
      questionCount: qCount,
      totalMarks: marks,
      status,
      canAttempt,
      level: lvl === 'beginner' || lvl === 'intermediate' || lvl === 'advanced' ? lvl : null,
    };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-purple-200 border-t-purple-600 mb-4" />
          <p className="text-gray-600 font-medium">Getting your quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Practice Quizzes</h1>
          <p className="text-lg text-gray-600 mb-2">
            Pick a subject → see topics → take a quiz. Simple.
          </p>
          <p className="text-sm text-gray-500 mb-4">Subjects on the left → Quizzes on the right</p>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Find a subject or quiz..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Something went wrong. Please try again.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Sidebar — subjects or, after click, topics for selected subject */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {selectedSubjectId ? (
                /* After clicking subject: show topics + Change subject */
                <div key="topics-view" className="animate-slide-in-right">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => { setSelectedSubjectId(null); updateUrl(null); }}
                      className="flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium mb-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      All subjects
                    </button>
                    <h2 className="text-lg font-bold text-white truncate">{selectedSubject?.title || 'Subject'}</h2>
                    <p className="text-purple-100 text-sm mt-0.5">Topics & quizzes</p>
                  </div>
                  <div className="p-3 max-h-[calc(100vh-320px)] overflow-y-auto">
                    {loadingQuizzes ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-200 border-t-purple-600" />
                      </div>
                    ) : topicTree.filter((r) => r.quizSets.length > 0 || r.children.some((c) => c.quizSets.length > 0)).length === 0 ? (
                      <p className="text-sm text-gray-500 py-6 text-center">No topics with quizzes</p>
                    ) : (
                      <div className="space-y-2">
                        {topicTree
                          .filter((r) => r.quizSets.length > 0 || r.children.some((c) => c.quizSets.length > 0))
                          .map((root, idx) => {
                            const delayClass = ['animate-delay-1', 'animate-delay-2', 'animate-delay-3', 'animate-delay-4', 'animate-delay-5', 'animate-delay-6'][idx % 6];
                            const hasSubTopics = root.children.some((c) => c.quizSets.length > 0);
                            const isExpanded = expandedRootIds.has(root.topic._id);
                            const totalQuizzes = root.quizSets.length + root.children.reduce((s, c) => s + c.quizSets.length, 0);
                            return (
                              <div key={root.topic._id} className="space-y-1">
                                <div className={`flex items-center gap-1 rounded-xl border overflow-hidden animate-fade-in ${delayClass} ${
                                  selectedRootId && String(root.topic._id) === String(selectedRootId) ? 'border-purple-500 bg-purple-50/80 ring-1 ring-purple-200' : 'border-gray-100 bg-gray-50/80 hover:bg-purple-50 hover:border-purple-200'
                                }`}>
                                  {hasSubTopics && (
                                    <button
                                      type="button"
                                      onClick={() => toggleExpanded(root.topic._id)}
                                      className="p-2 flex-shrink-0 text-gray-500 hover:text-purple-600 transition-colors"
                                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                    >
                                      <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedRootId(root.topic._id)}
                                    className={`flex-1 text-left p-3 flex items-center gap-3 min-w-0 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 ${!hasSubTopics ? 'pl-3' : ''}`}
                                  >
                                    <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-900 truncate text-sm">{root.topic.title}</h4>
                                      <p className="text-xs text-gray-500">{totalQuizzes} quiz{totalQuizzes !== 1 ? 'zes' : ''}</p>
                                      {(() => {
                                        const rootCounts = getTopicProgressCounts(root.quizSets, root.progress);
                                        const childCounts = root.children.reduce((acc, c) => {
                                          const { attempted, total } = getTopicProgressCounts(c.quizSets, c.progress);
                                          return { attempted: acc.attempted + attempted, total: acc.total + total };
                                        }, { attempted: 0, total: 0 });
                                        const attempted = rootCounts.attempted + childCounts.attempted;
                                        const total = rootCounts.total + childCounts.total;
                                        const pct = total > 0 ? Math.round((attempted / total) * 100) : 0;
                                        return total > 0 ? (
                                          <div className="mt-1.5">
                                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                              <div
                                                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                                                style={{ width: `${pct}%` }}
                                              />
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-0.5">{attempted}/{total} attempted</p>
                                          </div>
                                        ) : null;
                                      })()}
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                </div>
                                {hasSubTopics && isExpanded && (() => {
                                  const sidebarChildren = root.children.filter((c) => c.quizSets.length > 0);
                                  const totalSidebar = sidebarChildren.length;
                                  const sidebarNeedsPagination = totalSidebar > SUB_SIDEBAR_PER_PAGE;
                                  const sidebarPage = sidebarNeedsPagination ? (subSidebarPageByRoot[root.topic._id] || 1) : 1;
                                  const sidebarTotalPages = sidebarNeedsPagination ? Math.ceil(totalSidebar / SUB_SIDEBAR_PER_PAGE) : 1;
                                  const paginatedSidebar = sidebarNeedsPagination
                                    ? sidebarChildren.slice((sidebarPage - 1) * SUB_SIDEBAR_PER_PAGE, sidebarPage * SUB_SIDEBAR_PER_PAGE)
                                    : sidebarChildren;
                                  return (
                                    <div className="ml-4 pl-2 border-l-2 border-purple-100 space-y-1">
                                      {paginatedSidebar.map((child) => (
                                        <button
                                          key={child.topic._id}
                                          type="button"
                                          onClick={() => {
                                            setSelectedRootId(root.topic._id);
                                            setTimeout(() => document.getElementById(`topic-${child.topic._id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                                          }}
                                          className="w-full text-left rounded-lg border border-gray-100 bg-white/80 hover:bg-purple-50/80 hover:border-purple-200 p-2.5 flex flex-col gap-1 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1"
                                        >
                                          <div className="flex items-center gap-2 w-full">
                                            <span className="font-medium text-gray-900 text-sm truncate flex-1">{getSubTopicLabel(child.topic.title)}</span>
                                            <span className="text-xs text-gray-500 flex-shrink-0">{child.quizSets.length} quiz</span>
                                            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                          </div>
                                          {(() => {
                                            const { attempted, total } = getTopicProgressCounts(child.quizSets, child.progress);
                                            if (total === 0) return null;
                                            const pct = Math.round((attempted / total) * 100);
                                            return (
                                              <div className="w-full">
                                                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                                  <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-[10px] text-gray-500">{attempted}/{total} attempted</span>
                                              </div>
                                            );
                                          })()}
                                        </button>
                                      ))}
                                      {sidebarNeedsPagination && (
                                        <div className="flex items-center justify-between gap-1 pt-1">
                                          <button
                                            type="button"
                                            
                                            onClick={() => setSubSidebarPage(root.topic._id, sidebarPage - 1)}
                                            disabled={sidebarPage <= 1}
                                            className="p-1.5 rounded text-gray-500 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                            aria-label="Previous page"
                                          >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                          </button>
                                          <span className="text-xs text-gray-500">{sidebarPage}/{sidebarTotalPages}</span>
                                          <button
                                            type="button"
                                            onClick={() => setSubSidebarPage(root.topic._id, sidebarPage + 1)}
                                            disabled={sidebarPage >= sidebarTotalPages}
                                            className="p-1.5 rounded text-gray-500 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                            aria-label="Next page"
                                          >
                                            <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* No subject selected: categories + subjects */
                <div key="subjects-view" className="animate-slide-in-left">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                    <h2 className="text-lg font-bold text-white">Pick a subject</h2>
                    <p className="text-purple-100 text-sm mt-0.5">Choose one to see its quizzes</p>
                  </div>
                  <div className="p-3 max-h-[calc(100vh-320px)] overflow-y-auto">
                    {Object.keys(groupedByCategory).length === 0 ? (
                      <p className="text-sm text-gray-500 py-6 text-center">No subjects yet</p>
                    ) : (
                      <div className="space-y-5">
                        {Object.entries(groupedByCategory).map(([category, categorySubjects]) => (
                          <div key={category}>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                              {category}
                            </h3>
                            <div className="space-y-2">
                              {categorySubjects.map((s, idx) => {
                                const isSelected = s._id === selectedSubjectId;
                                const access = hasAccess(s);
                                const delayClass = ['animate-delay-1', 'animate-delay-2', 'animate-delay-3', 'animate-delay-4', 'animate-delay-5', 'animate-delay-6'][idx % 6];
                                return (
                                  <button
                                    key={s._id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedSubjectId(isSelected ? null : s._id);
                                      updateUrl(isSelected ? null : s._id);
                                    }}
                                    className={`w-full text-left rounded-xl border-2 p-3 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 animate-fade-in ${delayClass} ${
                                      isSelected ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-100 bg-gray-50/80 hover:bg-gray-100 hover:border-gray-200'
                                    } ${!access ? 'opacity-60' : ''}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-purple-500' : 'bg-gray-200'}`}>
                                        <svg className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 truncate">{s.title}</h4>
                                      </div>
                                      {isSelected && (
                                        <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Topics-wise list of quizzes (when subject selected) or Other Quizzes */}
          <div className="lg:col-span-3 animate-fade-in animate-delay-1">
            {showStandaloneOnly ? (
              <div className="space-y-6">
                {filteredStandalone.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Quick quizzes</h2>
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {filteredStandalone.length} available
                      </span>
                    </div>
                    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                      {filteredStandalone.map((quiz, idx) => {
                        const delayClass = ['animate-delay-1', 'animate-delay-2', 'animate-delay-3', 'animate-delay-4', 'animate-delay-5', 'animate-delay-6'][idx % 6];
                        return (
                        <div
                          key={quiz._id}
                          className={`bg-white rounded-xl border border-gray-200 p-5 hover:border-purple-200 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-scale-in ${delayClass}`}
                        >
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-bold text-gray-900">{quiz.name || quiz.title || 'Quiz'}</h3>
                            {quiz.level && (quiz.level === 'beginner' || quiz.level === 'intermediate' || quiz.level === 'advanced') && (
                              <LevelTag level={quiz.level} />
                            )}
                          </div>
                          {quiz.description && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{quiz.description}</p>}
                          <p className="text-sm text-gray-500 mb-4">
                            {quiz.durationMinutes || 30} min · {quiz.questionCount ?? 0} questions
                          </p>
                          <button
                            type="button"
                            onClick={() => handleStartQuiz(quiz._id, quiz.durationMinutes, true)}
                            disabled={!quiz.canAttempt}
                            className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold ${
                              quiz.canAttempt ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {quiz.canAttempt ? (quiz.isCompleted ? 'Retake' : 'Start') : 'Done'}
                          </button>
                        </div>
                      );})}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Pick a subject to start</h3>
                    <p className="text-gray-600 max-w-sm mx-auto mb-2">
                      Subjects are in the list on the left. Click one to see its topics and quizzes here.
                    </p>
                    <p className="text-sm text-gray-500">You can also search above to find a subject quickly.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Topics-wise list of quizzes */
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedSubject?.title || 'Quizzes'}</h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {topicsWithQuizzes.reduce((s, tw) => s + tw.quizSets.length, 0)} quiz
                    {topicsWithQuizzes.reduce((s, tw) => s + tw.quizSets.length, 0) !== 1 ? 'zes' : ''}
                  </span>
                  {focusedRoot && (
                    <button
                      type="button"
                      onClick={() => setSelectedRootId(null)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      <span className="text-gray-600">Showing: {focusedRoot.topic.title}</span>
                      <span>· View all topics</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setSelectedSubjectId(null); updateUrl(null); }}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium ml-auto"
                  >
                    Change subject
                  </button>
                </div>

                {/* Subject-wise progress bar (this subject) */}
                {(() => {
                  const subjectAttempted = topicsWithQuizzes.reduce(
                    (sum, tw) => sum + getTopicProgressCounts(tw.quizSets, tw.progress).attempted,
                    0
                  );
                  const subjectPassed = topicsWithQuizzes.reduce(
                    (sum, tw) => sum + getTopicProgressCounts(tw.quizSets, tw.progress).passed,
                    0
                  );
                  const subjectTotal = topicsWithQuizzes.reduce((s, tw) => s + tw.quizSets.length, 0);
                  if (subjectTotal === 0) return null;
                  const subjectPct = Math.round((subjectAttempted / subjectTotal) * 100);
                  return (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">Subject progress</span>
                        <span className="text-sm font-bold text-gray-900">{subjectAttempted} / {subjectTotal} attempted{subjectPassed !== subjectAttempted ? ` (${subjectPassed} passed)` : ''}</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${subjectPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Level</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedLevels(new Set())}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        selectedLevels.size === 0
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                      }`}
                    >
                      All
                    </button>
                    {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => {
                          setSelectedLevels((prev) => {
                            const next = new Set(prev);
                            if (next.has(l)) next.delete(l);
                            else next.add(l);
                            return next;
                          });
                        }}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                          selectedLevels.has(l)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700'
                        }`}
                      >
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingQuizzes ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-purple-200 border-t-purple-600" />
                    <p className="text-gray-500 text-sm">Loading quizzes...</p>
                  </div>
                ) : topicTree.filter((r) => r.quizSets.length > 0 || r.children.some((c) => c.quizSets.length > 0)).length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No quizzes here yet</h3>
                    <p className="text-gray-600">This subject doesn’t have any quizzes yet. Try another subject or check Quick quizzes.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {showMainPagination && (
                      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200">
                        <span className="text-sm text-gray-600">
                          Topics {rootsPagination.start}–{rootsPagination.end} of {rootsPagination.total}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setRootTopicPage(rootsPagination.page - 1)}
                            disabled={rootsPagination.page <= 1}
                            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-600 px-2">Page {rootsPagination.page} of {rootsPagination.totalPages}</span>
                          <button
                            type="button"
                            onClick={() => setRootTopicPage(rootsPagination.page + 1)}
                            disabled={rootsPagination.page >= rootsPagination.totalPages}
                            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-8">
                    {rootsToShow.map((root, idx) => {
                        const canAttempt = !!selectedSubject && hasAccess(selectedSubject);
                        const delayClass = ['animate-delay-1', 'animate-delay-2', 'animate-delay-3', 'animate-delay-4', 'animate-delay-5', 'animate-delay-6'][idx % 6];
                        const totalQuizzes = root.quizSets.length + root.children.reduce((s, c) => s + c.quizSets.length, 0);
                        return (
                          <div id={`topic-${root.topic._id}`} key={root.topic._id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-4 animate-fadeinup ${delayClass}`}>
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <h3 className="text-lg font-bold text-white">{root.topic.title}</h3>
                                <div className="flex items-center gap-2">
                                  {!focusedRoot && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedRootId(root.topic._id)}
                                      className="text-purple-200 hover:text-white text-sm font-medium underline underline-offset-1"
                                    >
                                      Show only this
                                    </button>
                                  )}
                                  <span className="text-purple-200 text-sm">{totalQuizzes} quiz{totalQuizzes !== 1 ? 'zes' : ''}</span>
                                </div>
                              </div>
                              {root.topic.description && <p className="text-purple-100 text-sm mt-1">{root.topic.description}</p>}
                            </div>
                            <div className="divide-y divide-gray-100">
                              {root.quizSets.map((qs) => {
                                const row = quizRow(qs, root.progress, canAttempt);
                                if (!row) return null;
                                return (
                                <div
                                  key={row._id}
                                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 hover:bg-gray-50/80 transition-all duration-200"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-semibold text-gray-900">{row.title}</h4>
                                      {row.level && <LevelTag level={row.level} />}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {row.durationMinutes ? `${row.durationMinutes} min` : '—'} · {row.questionCount} questions · {row.totalMarks} pts
                                      {row.status === 'completed' && (
                                        <span className="ml-2 inline-flex items-center gap-1 text-green-600 font-medium">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                          Done
                                        </span>
                                      )}
                                      {row.status === 'attempted' && (
                                        <span className="ml-2 text-amber-600 font-medium">Attempted</span>
                                      )}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleStartQuiz(row._id, row.durationMinutes, false)}
                                      disabled={!row.canAttempt}
                                      className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                        row.canAttempt
                                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      }`}
                                    >
                                      {row.status === 'completed' || row.status === 'attempted' ? 'Retake' : 'Start'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                              {(() => {
                                const childrenWithQuizzes = root.children.filter((c) => c.quizSets.length > 0);
                                const totalChild = childrenWithQuizzes.length;
                                const needsPagination = totalChild > SUB_TOPICS_PER_PAGE;
                                const page = needsPagination ? (subTopicPageByRoot[root.topic._id] || 1) : 1;
                                const totalPages = needsPagination ? Math.ceil(totalChild / SUB_TOPICS_PER_PAGE) : 1;
                                const paginatedChildren = needsPagination
                                  ? childrenWithQuizzes.slice((page - 1) * SUB_TOPICS_PER_PAGE, page * SUB_TOPICS_PER_PAGE)
                                  : childrenWithQuizzes;
                                const start = (page - 1) * SUB_TOPICS_PER_PAGE + 1;
                                const end = Math.min(page * SUB_TOPICS_PER_PAGE, totalChild);
                                return (
                                  <>
                                    {paginatedChildren.map((child) => (
                                      <div id={`topic-${child.topic._id}`} key={child.topic._id} className="bg-gray-50/50">
                                        <div className="px-5 py-2.5 border-b border-gray-100">
                                          <h4 className="font-semibold text-gray-800">{getSubTopicLabel(child.topic.title)}</h4>
                                          {child.topic.description && <p className="text-sm text-gray-500 mt-0.5">{child.topic.description}</p>}
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                          {child.quizSets.map((qs) => {
                                            const row = quizRow(qs, child.progress, canAttempt);
                                            if (!row) return null;
                                            return (
                                              <div key={row._id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 pl-6 hover:bg-gray-50/80 transition-all duration-200">
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-semibold text-gray-900">{row.title}</h4>
                                                    {row.level && <LevelTag level={row.level} />}
                                                  </div>
                                                  <p className="text-sm text-gray-500 mt-1">
                                                    {row.durationMinutes ? `${row.durationMinutes} min` : '—'} · {row.questionCount} questions · {row.totalMarks} pts
                                                    {row.status === 'completed' && <span className="ml-2 inline-flex items-center gap-1 text-green-600 font-medium"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Done</span>}
                                                    {row.status === 'attempted' && <span className="ml-2 text-amber-600 font-medium">Attempted</span>}
                                                  </p>
                                                </div>
                                                <div className="flex-shrink-0">
                                                  <button type="button" onClick={() => handleStartQuiz(row._id, row.durationMinutes, false)} disabled={!row.canAttempt}
                                                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${row.canAttempt ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                                                    {row.status === 'completed' || row.status === 'attempted' ? 'Retake' : 'Start'}
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                    {needsPagination && (
                                      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                                        <span className="text-sm text-gray-500">
                                          Sub-topics {start}–{end} of {totalChild}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setSubTopicPage(root.topic._id, page - 1)}
                                            disabled={page <= 1}
                                            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                          >
                                            Previous
                                          </button>
                                          <span className="text-sm text-gray-600 px-1">Page {page} of {totalPages}</span>
                                          <button
                                            type="button"
                                            onClick={() => setSubTopicPage(root.topic._id, page + 1)}
                                            disabled={page >= totalPages}
                                            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                          >
                                            Next
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
