'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import Link from 'next/link';

type QuizData = {
  _id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  useSections?: boolean;
  sections?: Array<{ questions?: unknown[] }>;
  questions?: unknown[];
};

export default function QuizInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const quizId = params?.id as string;

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.email) return;
    if (!quizId) {
      router.push('/dashboard/quizzes');
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiService.getQuizById(quizId);
        if (res.success && res.data) {
          setQuiz(res.data as QuizData);
        } else {
          setError('Quiz not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId, user?.email, router]);

  const handleStartQuiz = () => {
    router.push(`/dashboard/quizzes/${quizId}`);
  };

  const totalQuestions = quiz
    ? quiz.useSections && quiz.sections
      ? quiz.sections.reduce((acc, s) => acc + (s.questions?.length ?? 0), 0)
      : (quiz.questions?.length ?? 0)
    : 0;
  const duration = quiz?.durationMinutes ?? 30;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-purple-200 border-t-purple-600" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Quiz not found'}</p>
          <Link
            href="/dashboard/quizzes"
            className="text-purple-600 hover:underline font-medium"
          >
            ← Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard/quizzes"
          className="inline-flex items-center text-sm text-gray-600 hover:text-purple-600 mb-6"
        >
          ← Back to Quizzes
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-purple-100 text-sm">{quiz.description}</p>
            )}
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</p>
                <p className="text-lg font-bold text-gray-900">{duration} minutes</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Questions</p>
                <p className="text-lg font-bold text-gray-900">{totalQuestions}</p>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Instructions</h2>
              <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                <li>Read each question carefully before answering.</li>
                <li>You can navigate between questions using the question palette.</li>
                <li>You can skip questions and come back to them later.</li>
                <li>Submit the quiz only when you have completed all questions or when time is about to end.</li>
                <li>Once submitted, you cannot change your answers.</li>
                {duration > 0 && (
                  <li>This quiz has a time limit of {duration} minutes.</li>
                )}
              </ul>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleStartQuiz}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Start Quiz
              </button>
              <Link
                href="/dashboard/quizzes"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
