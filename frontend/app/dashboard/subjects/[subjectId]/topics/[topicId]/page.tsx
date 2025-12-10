'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  completedQuizzes: Array<{ quizId: string; score: number; percentage: number }>;
  totalQuizzesCompleted: number;
  isCompleted: boolean;
};

export default function TopicDetailPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const subjectId = params?.subjectId as string;
  const topicId = params?.topicId as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [cheatsheet, setCheatsheet] = useState<CheatSheet | null>(null);
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [progress, setProgress] = useState<TopicProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [cheatsheetViewed, setCheatsheetViewed] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [showTimeLimitModal, setShowTimeLimitModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [selectedQuizDuration, setSelectedQuizDuration] = useState<number | null>(null);
  const [useTimeLimit, setUseTimeLimit] = useState(true);

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
  const progressPercentage = useMemo(() => {
    if (!progress || !quizSets.length) return 0;
    
    const totalItems = 1 + quizSets.length; // 1 for cheatsheet + quizzes
    let completed = 0;
    
    if (progress.cheatSheetRead) completed++;
    completed += progress.totalQuizzesCompleted || 0;
    
    return Math.round((completed / totalItems) * 100);
  }, [progress, quizSets.length]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && topicId) {
      loadData();
    }
  }, [isAuthenticated, authLoading, router, topicId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [topicsRes, cheatRes, quizSetsRes, progressRes] = await Promise.all([
        apiService.getTopics(subjectId, true),
        apiService.getCheatSheetByTopic(topicId),
        apiService.getQuizSetsByTopic(topicId, true),
        apiService.getTopicProgress(topicId).catch(() => ({ success: false, data: null })),
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
        // Mark cheatsheet as read if user has access
        if (hasAccess) {
          try {
            await apiService.markCheatSheetRead(topicId);
            setCheatsheetViewed(true);
          } catch (err) {
            // Non-blocking
          }
        }
      }

      if (quizSetsRes.success && Array.isArray(quizSetsRes.data)) {
        setQuizSets(quizSetsRes.data);
      }

      if (progressRes.success && progressRes.data) {
        setProgress(progressRes.data as TopicProgress);
        setCheatsheetViewed((progressRes.data as TopicProgress).cheatSheetRead || false);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to load topic details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuizClick = (quizId: string, duration?: number) => {
    if (!hasAccess) {
      toast.error('Access locked. Request access from the subject page.');
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
    }
    
    setShowTimeLimitModal(false);
    router.push(`/dashboard/quizzes/${selectedQuizId}/instructions`);
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
    <div className="min-h-screen bg-gray-50 p-6">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{topic.title}</h1>
              {topic.description && (
                <p className="text-gray-600">{topic.description}</p>
              )}
            </div>

            {cheatsheet ? (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Cheatsheet / Study Material</h2>
                  {cheatsheet.estReadMinutes && (
                    <span className="text-xs text-gray-500">
                      📖 ~{cheatsheet.estReadMinutes} min read
                    </span>
                  )}
                </div>
                <div className="border-t pt-4 text-gray-900">
                  {renderCheatsheetContent()}
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
                <div className="space-y-3">
                  {quizSets.map((quizSet) => {
                    const quizId = typeof quizSet.quizId === 'string' ? quizSet.quizId : quizSet.quizId?._id;
                    const setTitle = quizSet.setName || 'Quiz Set';
                    const duration =
                      typeof quizSet.quizId === 'object' ? quizSet.quizId?.durationMinutes : undefined;
                    const isCompleted = progress?.completedQuizzes.some(
                      (q) => q.quizId === quizId
                    );

                    return (
                      <div
                        key={quizSet._id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{setTitle}</h3>
                            <p className="text-xs text-gray-500">
                              {duration && duration > 0 ? `⏱️ ${duration} minutes` : 'No timer (untimed)'}
                            </p>
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartQuizClick(quizId || '', duration)}
                          disabled={!quizId || !hasAccess}
                          className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          {isCompleted ? 'Retake Quiz' : 'Start Quiz'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Progress Bar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress</h2>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Topic Completion</span>
                  <span className="text-sm font-semibold text-purple-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
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
                  <span className="text-gray-600">Quizzes</span>
                  <span className="text-gray-900 font-semibold">
                    {progress?.totalQuizzesCompleted || 0} / {quizSets.length}
                  </span>
                </div>
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
