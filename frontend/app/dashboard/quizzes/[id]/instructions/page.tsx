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
            <div className="grid grid-cols-2 gap-4 text-base">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</p>
                <p className="text-lg font-bold text-gray-900">{duration} minutes</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Questions</p>
                <p className="text-lg font-bold text-gray-900">{totalQuestions}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                  General Instructions for Candidates
                </h2>
                <ol className="space-y-2 text-sm sm:text-base text-gray-700 list-decimal list-inside leading-relaxed">
                  <li>Carefully read each question before selecting your answer.</li>
                  <li>The question palette displayed on the screen allows you to navigate between questions at any time during the examination.</li>
                  <li>You may attempt the questions in any order within the allotted time.</li>
                  <li>You may skip a question and return to it later if required.</li>
                  <li>Ensure that you review your answers before submitting the test.</li>
                  <li>The test will be automatically submitted once the allotted time expires.</li>
                  <li>
                    Once you click the Submit button, your responses will be finalized. You will not be able to modify your answers, and the test window will close automatically.
                  </li>
                  <li>Do not refresh, close, or navigate away from the test window during the examination, as it may result in loss of responses.</li>
                  <li>
                    The total duration of the examination is {duration || 30} minutes.
                  </li>
                  <li>Please maintain academic integrity and avoid any unfair means while attempting the test.</li>
                </ol>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                  Marking Scheme
                </h2>
                <ul className="space-y-2 text-sm sm:text-base text-gray-700 list-disc list-inside leading-relaxed">
                  <li>Each correct answer will be awarded the marks specified in the question.</li>
                  <li>Negative marking, if applicable, will be indicated in the question details.</li>
                  <li>No marks will be awarded for unanswered questions.</li>
                </ul>
              </div>
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
