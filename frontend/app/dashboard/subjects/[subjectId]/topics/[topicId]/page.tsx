'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

// Fix for rehype-highlight types
const rehypeHighlightPlugin = rehypeHighlight as any;

type Topic = {
  _id: string;
  subjectId: string;
  title: string;
  description?: string;
};

type CheatSheet = {
  _id: string;
  topicId: string;
  content: string;
  contentType: 'html' | 'markdown' | 'text';
  estReadMinutes?: number;
};

type QuizSet = {
  _id: string;
  topicId: string;
  quizId: string | { _id: string; title: string; durationMinutes?: number };
  setName?: string;
  isActive?: boolean;
};

type TopicProgress = {
  cheatSheetRead: boolean;
  completedQuizzes: Array<{ 
    quizId: string | { _id: string; title?: string; durationMinutes?: number }; 
    score: number; 
    percentage: number 
  }>;
  totalQuizzesCompleted: number;
  isCompleted: boolean;
};

export default function TopicDetailPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const subjectId = params?.subjectId as string;
  const topicId = params?.topicId as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [cheatsheet, setCheatsheet] = useState<CheatSheet | null>(null);
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [progress, setProgress] = useState<TopicProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [cheatsheetViewed, setCheatsheetViewed] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showReadingToast, setShowReadingToast] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [showTimeLimitModal, setShowTimeLimitModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedQuizDuration, setSelectedQuizDuration] = useState<number | null>(null);
  const [useTimeLimit, setUseTimeLimit] = useState(true);
  const cheatsheetRef = useRef<HTMLDivElement | null>(null);
  const loadDataLock = useRef(false);
  const lastLoadTime = useRef<number>(0);

  const profileCompletion = useMemo(() => {
    if (!user) return 0;
    const fields = [
      user.name,
      (user as any).phone,
      (user as any).profile?.currentStatus,
      (user as any).profile?.college,
      (user as any).profile?.school,
      (user as any).profile?.jobTitle,
      (user as any).profile?.interests?.length > 0,
      (user as any).profile?.learningGoals,
      (user as any).profile?.city,
      (user as any).profile?.country,
      (user as any).profilePicture,
    ];
    const filled = fields.filter((field) => {
      if (Array.isArray(field)) return field.length > 0;
      return field && String(field).trim().length > 0;
    }).length;
    return Math.round((filled / fields.length) * 100);
  }, [user]);

  // Calculate topic progress percentage
  // Attempted quiz IDs set (all attempts, regardless of score)
  const attemptedQuizIds = useMemo(() => {
    return new Set(
      (progress?.completedQuizzes || [])
        .map((q) => {
          const id = typeof q.quizId === 'string' ? q.quizId : (q.quizId?._id || q.quizId);
          return id ? String(id) : null;
        })
        .filter(Boolean) as string[]
    );
  }, [progress?.completedQuizzes]);

  // Completed quiz IDs set for quick lookup (only passed quizzes with >= 60%)
  const completedQuizIds = useMemo(() => {
    const allQuizzes = progress?.completedQuizzes || [];
    const passedQuizzes = allQuizzes.filter((q) => {
      const percentage = typeof q.percentage === 'number' ? q.percentage : parseFloat(q.percentage) || 0;
      return percentage >= 60;
    });
    
    const allQuizzesDebug = allQuizzes.map(q => {
      const percentage = typeof q.percentage === 'number' ? q.percentage : parseFloat(q.percentage) || 0;
      return {
        quizId: String(typeof q.quizId === 'string' ? q.quizId : (q.quizId?._id || q.quizId)),
        percentage: percentage,
        percentageRaw: q.percentage,
        percentageType: typeof q.percentage,
        score: q.score,
        passed: percentage >= 60
      };
    });
    
    console.log('CompletedQuizIds calculation:', {
      totalCompletedQuizzes: allQuizzes.length,
      passedQuizzes: passedQuizzes.length,
      allQuizzes: allQuizzesDebug,
      threshold: 60
    });
    
    return new Set(
      passedQuizzes.map((q) => {
        const id = typeof q.quizId === 'string' ? q.quizId : (q.quizId?._id || q.quizId);
        return id ? String(id) : null;
      }).filter(Boolean) as string[]
    );
  }, [progress?.completedQuizzes]);

  // Get quiz status (attempted but not passed, or completed)
  const getQuizStatus = useMemo(() => {
    const statusMap = new Map<string, 'completed' | 'attempted' | 'not_attempted'>();
    (progress?.completedQuizzes || []).forEach((q) => {
      const quizId = typeof q.quizId === 'string' ? q.quizId : (q.quizId?._id || q.quizId);
      if (quizId) {
        const idStr = String(quizId);
        const percentage = typeof q.percentage === 'number' ? q.percentage : parseFloat(q.percentage) || 0;
        if (percentage >= 60) {
          statusMap.set(idStr, 'completed');
        } else {
          statusMap.set(idStr, 'attempted');
        }
      }
    });
    return statusMap;
  }, [progress?.completedQuizzes]);

  // Group quiz sets by setName and compute per-set progress
  const groupedSets = useMemo(() => {
    const groups = new Map<
      string,
      { setName: string; quizzes: Array<{ quizId: string; duration?: number; title?: string }>; completed: number; attempted: number; total: number }
    >();

    quizSets.forEach((qs) => {
      const setName = qs.setName || 'Quiz Set';
      const quizId = typeof qs.quizId === 'string' ? qs.quizId : qs.quizId?._id;
      const duration = typeof qs.quizId === 'object' ? qs.quizId?.durationMinutes : undefined;
      const title = typeof qs.quizId === 'object' ? qs.quizId?.title : undefined;
      if (!quizId) return;

      const quizIdStr = String(quizId);
      const existing = groups.get(setName) || { setName, quizzes: [], completed: 0, attempted: 0, total: 0 };
      existing.quizzes.push({ quizId: quizIdStr, duration, title });
      existing.total += 1;
      // Check both completed and attempted sets
      const isCompleted = completedQuizIds.has(quizIdStr);
      const isAttempted = attemptedQuizIds.has(quizIdStr);
      
      if (isCompleted) {
        existing.completed += 1;
        existing.attempted += 1;
      } else if (isAttempted) {
        existing.attempted += 1;
      }
      
      // Debug logging for each quiz
      if (isCompleted || isAttempted) {
        console.log(`Quiz ${quizIdStr} in set "${setName}":`, {
          isCompleted,
          isAttempted,
          completedQuizIds: Array.from(completedQuizIds),
          attemptedQuizIds: Array.from(attemptedQuizIds)
        });
      }
      
      groups.set(setName, existing);
    });

    const result = Array.from(groups.values());
    
    // Debug: Log final grouped sets calculation
    console.log('Grouped sets result:', {
      sets: result.map(set => ({
        setName: set.setName,
        total: set.total,
        completed: set.completed,
        attempted: set.attempted,
        quizzes: set.quizzes.map(q => q.quizId)
      })),
      completedQuizIds: Array.from(completedQuizIds),
      attemptedQuizIds: Array.from(attemptedQuizIds)
    });

    return result;
  }, [quizSets, completedQuizIds, attemptedQuizIds]);

  const completedSetsCount = useMemo(
    () => groupedSets.filter((set) => set.total > 0 && set.completed >= set.total).length,
    [groupedSets]
  );

  // Overall topic progress (cheatsheet + per set)
  const progressPercentage = useMemo(() => {
    if (!progress) {
      console.log('Progress percentage: 0 (no progress data)');
      return 0;
    }

    // If no quiz sets, progress is 100% if cheatsheet is read, 0% otherwise
    if (!groupedSets.length) {
      const result = progress.cheatSheetRead ? 100 : 0;
      console.log('Progress percentage:', result, '(no quiz sets, cheatsheet read:', progress.cheatSheetRead, ')');
      return result;
    }

    const totalItems = 1 + groupedSets.length; // 1 for cheatsheet + each set
    let completed = 0;

    if (progress.cheatSheetRead) completed++;
    const completedSets = groupedSets.filter((set) => set.total > 0 && set.completed >= set.total);
    completed += completedSets.length;

    const result = Math.round((completed / totalItems) * 100);
    
    console.log('Progress percentage calculation:', {
      totalItems,
      completed,
      cheatsheetRead: progress.cheatSheetRead,
      groupedSets: groupedSets.map(set => ({
        setName: set.setName,
        total: set.total,
        completed: set.completed,
        isComplete: set.total > 0 && set.completed >= set.total
      })),
      completedSets: completedSets.length,
      result
    });

    return result;
  }, [progress, groupedSets]);

  // Reading progress (cheatsheet scroll)
  useEffect(() => {
    const handleScroll = () => {
      const el = cheatsheetRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewHeight = window.innerHeight || document.documentElement.clientHeight;
      const total = rect.height;
      const visibleTop = Math.max(0, -rect.top);
      const visibleBottom = Math.min(rect.height, viewHeight - rect.top);
      const visible = Math.max(0, Math.min(total, visibleBottom) - visibleTop);
      const progressValue = total > 0 ? Math.min(100, Math.max(0, Math.round(((visibleTop + visible) / total) * 100))) : 0;
      setReadingProgress(progressValue);
      setShowReadingToast(true);
      window.clearTimeout((handleScroll as any)._timeout);
      (handleScroll as any)._timeout = window.setTimeout(() => setShowReadingToast(false), 1200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && topicId) {
      loadData();
    }
  }, [isAuthenticated, authLoading, router, topicId]);

  // Reload data when URL changes (e.g., refresh parameter added)
  useEffect(() => {
    if (isAuthenticated && topicId) {
      const refreshParam = searchParams.get('_refresh');
      if (refreshParam) {
        // Remove the refresh parameter from URL immediately
        const newUrl = window.location.pathname;
        router.replace(newUrl);
        // Force reload data immediately, bypassing lock and adding delay for backend processing
        loadDataLock.current = false;
        lastLoadTime.current = 0;
        // Add a delay and retry mechanism to ensure backend has processed the quiz completion
        const retryLoad = async (attempt = 0) => {
          if (attempt < 3) {
            setTimeout(async () => {
              await loadData();
              // Check if progress was updated, if not retry
              if (attempt < 2) {
                retryLoad(attempt + 1);
              }
            }, attempt === 0 ? 500 : 1000);
          }
        };
        retryLoad();
      }
    }
  }, [searchParams, isAuthenticated, topicId]);

  // Reload data when page becomes visible (e.g., returning from quiz) - with debouncing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && topicId && !loading) {
        const now = Date.now();
        // Debounce: only reload if last load was more than 2 seconds ago
        if (now - lastLoadTime.current > 2000) {
          loadData();
        }
      }
    };

    const handleFocus = () => {
      if (isAuthenticated && topicId && !loading) {
        const now = Date.now();
        // Debounce: only reload if last load was more than 2 seconds ago
        if (now - lastLoadTime.current > 2000) {
          loadData();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, topicId, loading]);

  const loadData = useCallback(async () => {
    // Prevent concurrent loads
    if (loadDataLock.current) {
      return;
    }
    
    try {
      loadDataLock.current = true;
      setLoading(true);
      lastLoadTime.current = Date.now();
      
      // Add cache-busting timestamp to ensure fresh data after quiz completion
      const cacheBuster = Date.now();
      const [topicsRes, cheatRes, quizSetsRes, progressRes] = await Promise.all([
        apiService.getTopics(subjectId, true),
        apiService.getCheatSheetByTopic(topicId),
        apiService.getQuizSetsByTopic(topicId, true),
        apiService.getTopicProgress(topicId, cacheBuster).catch(() => ({ success: false, data: null })),
      ]);

      // Determine access based on subject batches
      try {
        const subjectsRes = await apiService.getSubjects({ page: 1, limit: 200, isActive: true });
        if (subjectsRes.success && subjectsRes.data?.items) {
          const foundSubject = subjectsRes.data.items.find((s: any) => s._id === subjectId);
          if (foundSubject) {
            const userBatches = (user as any)?.batches || [];
            const access =
              !foundSubject.batches ||
              (Array.isArray(foundSubject.batches) && foundSubject.batches.length === 0) ||
              userBatches.some((b: string) => foundSubject.batches?.includes(b));
            setHasAccess(access);
          }
        }
      } catch (err) {
        // Non-blocking
        console.warn('Failed to determine access', err);
      }

      if (topicsRes.success && Array.isArray(topicsRes.data)) {
        const found = topicsRes.data.find((t: Topic) => t._id === topicId);
        setTopic(found || null);
      }

      if (cheatRes.success && cheatRes.data) {
        setCheatsheet(cheatRes.data);
      }

      if (quizSetsRes.success && Array.isArray(quizSetsRes.data)) {
        console.log('QuizSets loaded:', quizSetsRes.data.length, quizSetsRes.data.map(qs => ({
          quizId: typeof qs.quizId === 'string' ? qs.quizId : qs.quizId?._id,
          quizIdStr: String(typeof qs.quizId === 'string' ? qs.quizId : qs.quizId?._id),
          setName: qs.setName
        })));
        setQuizSets(quizSetsRes.data);
      } else {
        console.warn('QuizSets not loaded:', quizSetsRes);
      }

      if (progressRes.success && progressRes.data) {
        const progressData = progressRes.data as TopicProgress;
        setProgress(progressData);
        setCheatsheetViewed(progressData.cheatSheetRead || false);
        
        // Check if any quizzes have percentage >= 60 - use quizSets from the API response, not state
        const currentQuizSets = quizSetsRes.success && Array.isArray(quizSetsRes.data) ? quizSetsRes.data : quizSets;
        const allQuizzesForDebug = (progressData.completedQuizzes || []).map(q => {
          const percentage = typeof q.percentage === 'number' ? q.percentage : parseFloat(String(q.percentage)) || 0;
          const quizId = typeof q.quizId === 'string' ? q.quizId : (q.quizId?._id || q.quizId);
          return {
            quizId: String(quizId),
            percentage: percentage,
            percentageRaw: q.percentage,
            percentageType: typeof q.percentage,
            score: q.score,
            passed: percentage >= 60
          };
        });
        const passedQuizzes = allQuizzesForDebug.filter(q => q.passed);
        
        console.log('Progress updated:', {
          cheatSheetRead: progressData.cheatSheetRead,
          completedQuizzes: progressData.completedQuizzes?.length || 0,
          allQuizzesWithPercentages: allQuizzesForDebug,
          passedQuizzes: passedQuizzes.length,
          passedQuizzesDetails: passedQuizzes,
          quizSetsLoaded: currentQuizSets.length,
          quizSetIds: currentQuizSets.map(qs => {
            const id = typeof qs.quizId === 'string' ? qs.quizId : qs.quizId?._id;
            return id ? String(id) : null;
          }).filter(Boolean)
        });
        
        // Debug: Check if completed quiz IDs match quiz set IDs
        const completedIds = new Set(
          (progressData.completedQuizzes || [])
            .filter((q) => q.percentage >= 60)
            .map((q) => {
              const id = typeof q.quizId === 'string' ? q.quizId : (q.quizId?._id || q.quizId);
              return id ? String(id) : null;
            })
            .filter(Boolean)
        );
        const quizSetIds = new Set(
          quizSets.map(qs => {
            const id = typeof qs.quizId === 'string' ? qs.quizId : qs.quizId?._id;
            return id ? String(id) : null;
          }).filter(Boolean)
        );
        console.log('Debug - Quiz ID matching:', {
          completedQuizIds: Array.from(completedIds),
          quizSetIds: Array.from(quizSetIds),
          matches: Array.from(completedIds).filter(id => quizSetIds.has(id))
        });
      } else {
        // Initialize with default progress if none exists
        setProgress({
          cheatSheetRead: false,
          completedQuizzes: [],
          totalQuizzesCompleted: 0,
          isCompleted: false
        } as TopicProgress);
        setCheatsheetViewed(false);
      }
    } catch (err: any) {
      console.error(err);
      // Don't show error toast for rate limiting - it's already shown by the API
      if (!err.message?.includes('Too many requests')) {
      toast.error(err.message || 'Failed to load topic details');
      }
    } finally {
      setLoading(false);
      loadDataLock.current = false;
    }
  }, [subjectId, topicId, user]);

  const handleStartQuizClick = (quizId: string, duration?: number) => {
    if (!hasAccess) {
      toast.error('Access locked. Request access from the subject page.');
      return;
    }

    // Check profile completion
    if (profileCompletion < 70) {
      toast.error(
        `Please complete your profile first. Your profile is ${profileCompletion}% complete. Minimum required: 70%.`,
        {
          duration: 5000,
          icon: '⚠️',
        }
      );
      // Redirect to profile page
      setTimeout(() => {
        router.push('/dashboard/profile');
      }, 2000);
      return;
    }

    setSelectedQuizId(quizId);
    setSelectedQuizDuration(duration || null);
    setShowTimeLimitModal(true);
  };

  const handleStartQuiz = () => {
    if (!selectedQuizId) return;
    
    // Store time limit preference in localStorage
    if (user?.email) {
      const timeLimitKey = `quiz_time_limit_${user.email}_${selectedQuizId}`;
      localStorage.setItem(timeLimitKey, useTimeLimit ? 'true' : 'false');
      
      // If using time limit, store duration
      if (useTimeLimit && selectedQuizDuration) {
        const durationKey = `quiz_duration_${user.email}_${selectedQuizId}`;
        localStorage.setItem(durationKey, selectedQuizDuration.toString());
      }
      
      // Store return URL to redirect back to topic page after quiz completion
      const returnUrl = `/dashboard/subjects/${subjectId}/topics/${topicId}`;
      const returnUrlKey = `quiz_return_url_${user.email}_${selectedQuizId}`;
      localStorage.setItem(returnUrlKey, returnUrl);
    }
    
    setShowTimeLimitModal(false);
    router.push(`/dashboard/quizzes/${selectedQuizId}/instructions`);
  };

  const handleMarkCheatsheetRead = async () => {
    if (!hasAccess) {
      toast.error('Access locked. Request access from the subject page.');
      return;
    }
    try {
      const res = await apiService.markCheatSheetRead(topicId);
      if (res.success && res.data) {
        // Use the progress data returned from the API instead of making another call
      setCheatsheetViewed(true);
        setProgress(res.data as TopicProgress);
        setCheatsheetViewed((res.data as TopicProgress).cheatSheetRead || false);
      toast.success('Marked as read');
      } else {
        throw new Error(res.message || 'Failed to mark as read');
      }
    } catch (err: any) {
      console.error('Error marking cheatsheet as read:', err);
      // Don't show error toast for rate limiting
      if (!err.message?.includes('Too many requests')) {
      toast.error(err.message || 'Failed to mark as read');
      }
    }
  };

  const renderCheatsheetContent = () => {
    if (!cheatsheet) return null;

    if (cheatsheet.contentType === 'markdown') {
      return (
        <div className="prose prose-sm max-w-none prose-gray text-gray-900 [&>*]:text-gray-900 [&>p]:text-gray-700 [&>h1]:text-gray-900 [&>h2]:text-gray-900 [&>h3]:text-gray-900 [&>h4]:text-gray-900 [&>h5]:text-gray-900 [&>h6]:text-gray-900">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlightPlugin]}
            components={{
              h1: ({ children }: any) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4">{children}</h1>,
              h2: ({ children }: any) => <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3">{children}</h2>,
              h3: ({ children }: any) => <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{children}</h3>,
              h4: ({ children }: any) => <h4 className="text-base font-semibold text-gray-900 mt-3 mb-2">{children}</h4>,
              p: ({ children }: any) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }: any) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">{children}</ul>,
              ol: ({ children }: any) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">{children}</ol>,
              li: ({ children }: any) => <li className="text-gray-700">{children}</li>,
              strong: ({ children }: any) => <strong className="font-bold text-gray-900">{children}</strong>,
              em: ({ children }: any) => <em className="italic text-gray-700">{children}</em>,
              a: ({ href, children }: any) => (
                <a href={href} className="text-purple-600 hover:text-purple-700 underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              code: ({ node, inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                    {children}
                  </code>
                );
              },
              blockquote: ({ children }: any) => (
                <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-600 my-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {cheatsheet.content}
          </ReactMarkdown>
        </div>
      );
    } else if (cheatsheet.contentType === 'html') {
      return (
        <div
          className="prose prose-sm max-w-none text-gray-900 [&_*]:text-gray-900 [&_p]:text-gray-700 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900"
          dangerouslySetInnerHTML={{ __html: cheatsheet.content }}
        />
      );
    } else {
      return (
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-900">
          {cheatsheet.content}
        </div>
      );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Topic not found</h2>
          <Link href={`/dashboard/subjects/${subjectId}`} className="text-purple-600 hover:underline">
            Back to Subject
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {showReadingToast && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-auto z-50 bg-white shadow-lg border border-gray-200 rounded-lg px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-100 flex items-center justify-center text-xs sm:text-sm font-bold text-purple-700 flex-shrink-0">
            {Math.min(100, readingProgress)}%
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">Reading progress</p>
            <div className="w-full sm:w-40 bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                style={{ width: `${Math.min(100, readingProgress)}%` }}
              />
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {!hasAccess && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold mb-1">Access locked</p>
                <p className="text-sm text-yellow-800">
                  You are not assigned to this subject's batches. Request access from the subject page. {profileCompletion < 70 ? `Profile completion: ${profileCompletion}% (needs ≥70%).` : ''}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Cheatsheet */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div className="mb-6">
              <Link
                href={`/dashboard/subjects/${subjectId}`}
                className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Topics
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{topic.title}</h1>
              {topic.description && (
                <p className="text-gray-600">{topic.description}</p>
              )}
            </div>

            {cheatsheet ? (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200" ref={cheatsheetRef}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Cheatsheet / Study Material</h2>
                    {cheatsheet.estReadMinutes && (
                      <span className="text-xs text-gray-500">
                        📖 ~{cheatsheet.estReadMinutes} min read
                      </span>
                    )}
                  </div>
                </div>
                <div className="border-t pt-4 text-gray-900">
                  {renderCheatsheetContent()}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleMarkCheatsheetRead}
                    disabled={cheatsheetViewed}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {cheatsheetViewed ? 'Marked as read' : 'Done reading'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No cheatsheet available</h3>
                <p className="text-gray-600">Study material will be added soon.</p>
              </div>
            )}

            {/* Quiz Sets - Moved to bottom */}
            {quizSets.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Sets</h2>
                <div className="space-y-4">
                  {groupedSets.map((set) => {
                    const percent = set.total > 0 ? Math.round((set.completed / set.total) * 100) : 0;
                    return (
                      <div
                        key={set.setName}
                        className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{set.setName}</h3>
                            <p className="text-xs text-gray-500">
                              {set.total} quiz{set.total !== 1 ? 'zes' : ''} • {set.attempted} attempted • {set.completed} completed
                            </p>
                          </div>
                          <div className="min-w-[100px] text-right">
                            <span className="text-xs font-semibold text-purple-700">{percent}%</span>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                          {set.quizzes.map((quiz) => {
                            const quizIdStr = String(quiz.quizId);
                            const quizStatus = getQuizStatus.get(quizIdStr) || 'not_attempted';
                            const isCompleted = quizStatus === 'completed';
                            const isAttempted = quizStatus === 'attempted';
                            return (
                              <div
                                key={quiz.quizId}
                                className="border border-gray-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {quiz.title || 'Quiz'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {quiz.duration && quiz.duration > 0 ? `⏱️ ${quiz.duration} min` : 'No timer'}
                                  </p>
                                  {isCompleted && (
                                    <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Completed
                                    </span>
                                  )}
                                  {isAttempted && !isCompleted && (
                                    <span className="inline-flex items-center gap-1 text-xs text-yellow-600 mt-1">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Attempted
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleStartQuizClick(quiz.quizId, quiz.duration)}
                                  disabled={!hasAccess}
                                  className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                  {isCompleted || isAttempted ? 'Retake' : 'Start'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Progress Bar */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 lg:sticky lg:top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress</h2>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Topic Completion</span>
                  <span className="text-sm font-semibold text-purple-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    key={`progress-${progressPercentage}-${progress?.completedQuizzes?.length || 0}`}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${progressPercentage}%`,
                      minWidth: progressPercentage > 0 ? '4px' : '0',
                      display: 'block'
                    }}
                  />
                </div>
              </div>

              {/* Progress Details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cheatsheet</span>
                  {progress?.cheatSheetRead ? (
                    <span className="text-green-600 font-semibold">✓ Read</span>
                  ) : (
                    <span className="text-gray-400">Not read</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sets</span>
                  <span className="text-gray-900 font-semibold">
                    {completedSetsCount} / {groupedSets.length}
                  </span>
                </div>
                {groupedSets.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {groupedSets.map((set) => {
                      const percent = set.total > 0 ? Math.round((set.completed / set.total) * 100) : 0;
                      return (
                        <div key={set.setName}>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{set.setName}</span>
                            <span className="font-semibold text-gray-800">{set.completed}/{set.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {progress?.isCompleted && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">Topic Completed!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Limit Modal */}
      {showTimeLimitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz Settings</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Enable Time Limit</p>
                  <p className="text-sm text-gray-600">
                    {selectedQuizDuration ? `Quiz duration: ${selectedQuizDuration} minutes` : 'No time limit set'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useTimeLimit}
                    onChange={(e) => setUseTimeLimit(e.target.checked)}
                    disabled={!selectedQuizDuration || selectedQuizDuration === 0}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
              
              {(!selectedQuizDuration || selectedQuizDuration === 0) && (
                <p className="text-sm text-gray-500 italic">
                  This quiz has no time limit configured. You can take it at your own pace.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTimeLimitModal(false);
                  setSelectedQuizId(null);
                  setUseTimeLimit(true);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartQuiz}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
