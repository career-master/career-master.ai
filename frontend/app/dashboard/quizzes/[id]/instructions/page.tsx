'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface QuizData {
  _id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  questions: any[];
  maxAttempts?: number;
  availableFrom?: string;
  availableTo?: string;
}

interface Attempt {
  _id: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  result: string;
  submittedAt: string;
  correctAnswers: number;
  incorrectAnswers: number;
  unattemptedAnswers: number;
}

export default function QuizInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const quizId = params?.id as string;

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!quizId || !user?.email) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        // Load quiz details
        const quizRes = await apiService.getQuizById(quizId);
        if (quizRes.success && quizRes.data) {
          setQuiz(quizRes.data as QuizData);
        }

        // Load user attempts
        try {
          const attemptsRes = await apiService.getUserQuizAttempts(quizId);
          if (attemptsRes.success && attemptsRes.data) {
            setAttempts(Array.isArray(attemptsRes.data) ? attemptsRes.data : []);
          }
        } catch (err) {
          // If attempts endpoint fails, just continue without attempts
          console.log('Could not load attempts:', err);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz');
        toast.error('Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [quizId, user?.email]);

  const calculateTotalMarks = () => {
    if (!quiz) return 0;
    return quiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  };

  const handleStartQuiz = () => {
    if (!accepted) {
      toast.error('Please accept the instructions to continue');
      return;
    }
    router.push(`/dashboard/quizzes/${quizId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading quiz instructions...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Quiz not found'}</p>
          <button
            onClick={() => router.push('/dashboard/quizzes')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const totalMarks = calculateTotalMarks();
  const attemptsMade = attempts.length;
  const maxAttempts = quiz.maxAttempts || 999;
  const attemptsLeft = maxAttempts === 999 ? 999 : Math.max(0, maxAttempts - attemptsMade);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{quiz.title}</h1>

          {/* Quiz Description */}
          {quiz.description && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Description</h2>
              <p className="text-blue-800 whitespace-pre-line">{quiz.description}</p>
            </div>
          )}

          {/* Quiz Instructions */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold">Duration: {quiz.durationMinutes} minutes</p>
                  <p className="text-sm text-gray-600">The quiz will automatically submit when time runs out</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold">Total Marks: {totalMarks}</p>
                  <p className="text-sm text-gray-600">Total questions: {quiz.questions.length}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="font-semibold">Question Navigation</p>
                  <p className="text-sm text-gray-600">You can navigate between questions and skip questions you don't know</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <p className="font-semibold">Important Notes</p>
                  <ul className="text-sm text-gray-600 list-disc list-inside mt-1 space-y-1">
                    <li>Do not switch tabs or minimize the window during the quiz</li>
                    <li>You can skip questions and come back to them later</li>
                    <li>Once submitted, you cannot change your answers</li>
                    <li>Negative marking may apply for incorrect answers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Attempts Information */}
          {attempts.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">Your Previous Attempts</h3>
              <div className="space-y-2">
                {attempts.slice(0, 3).map((attempt, index) => (
                  <div key={attempt._id} className="flex items-center justify-between p-2 bg-white rounded">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Attempt {attempts.length - index}:</span>
                      <span className="text-sm text-gray-600 ml-2">
                        {attempt.marksObtained}/{attempt.totalMarks} marks ({attempt.percentage.toFixed(2)}%)
                      </span>
                      <span className={`ml-2 text-sm font-semibold ${attempt.result === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                        {attempt.result.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(attempt.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-yellow-800 mt-2">
                Attempts made: {attemptsMade} / {maxAttempts === 999 ? 'Unlimited' : maxAttempts}
                {attemptsLeft < 999 && attemptsLeft > 0 && (
                  <span className="ml-2">({attemptsLeft} attempts remaining)</span>
                )}
              </p>
            </div>
          )}

          {/* Acceptance Checkbox */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <div>
                <p className="font-semibold text-gray-900">I have read and understood the instructions</p>
                <p className="text-sm text-gray-600 mt-1">
                  By checking this box, I confirm that I understand the quiz rules and am ready to begin
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard/quizzes')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back to Quizzes
            </button>
            <button
              onClick={handleStartQuiz}
              disabled={!accepted}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                accepted
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

