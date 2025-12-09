'use client';

import { useEffect, useState } from 'react';
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

export default function TopicDetailPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const subjectId = params?.subjectId as string;
  const topicId = params?.topicId as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [cheatsheet, setCheatsheet] = useState<CheatSheet | null>(null);
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [cheatsheetViewed, setCheatsheetViewed] = useState(false);

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
      const [topicsRes, cheatRes, quizSetsRes] = await Promise.all([
        apiService.getTopics(subjectId, true),
        apiService.getCheatSheetByTopic(topicId),
        apiService.getQuizSetsByTopic(topicId, true),
      ]);

      if (topicsRes.success && Array.isArray(topicsRes.data)) {
        const found = topicsRes.data.find((t: Topic) => t._id === topicId);
        setTopic(found || null);
      }

      if (cheatRes.success && cheatRes.data) {
        setCheatsheet(cheatRes.data);
      }

      if (quizSetsRes.success && Array.isArray(quizSetsRes.data)) {
        setQuizSets(quizSetsRes.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to load topic details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId: string) => {
    router.push(`/dashboard/quizzes/${quizId}/instructions`);
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Cheatsheet */}
          <div className="lg:col-span-2 space-y-6">
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
          </div>

          {/* Sidebar - Quiz Sets */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Sets</h2>
              {quizSets.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm text-gray-600">No quizzes available yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quizSets.map((quizSet) => {
                    const quizId = typeof quizSet.quizId === 'string' ? quizSet.quizId : quizSet.quizId?._id;
                    const setTitle = quizSet.setName || 'Quiz Set';
                    const duration =
                      typeof quizSet.quizId === 'object' ? quizSet.quizId?.durationMinutes : undefined;

                    return (
                      <div
                        key={quizSet._id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                      >
                        <div className="mb-3">
                          <h3 className="font-semibold text-gray-900 mb-1">{setTitle}</h3>
                          <p className="text-xs text-gray-500">
                            {duration && duration > 0 ? `⏱️ ${duration} minutes` : 'No timer (untimed)'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartQuiz(quizId || '')}
                          disabled={!quizId}
                          className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          Start {setTitle}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

