'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiService } from '@/lib/api';

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  marks?: number;
  negativeMarks?: number;
}

interface QuizData {
  _id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  questions: QuizQuestion[];
}

function QuizAttemptContent() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.id as string;

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ obtained: number; total: number } | null>(null);

  // Load quiz details
  useEffect(() => {
    if (!quizId) return;
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiService.getQuizById(quizId);
        if (res.success && res.data) {
          const data: any = res.data;
          setQuiz(data);
          const durationMinutes = data.durationMinutes || 30;
          setTimeLeft(durationMinutes * 60);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [quizId]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? prev - 1 : prev));
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitted]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (qIndex: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmit = (auto = false) => {
    if (!quiz || submitted || submitting) return;
    setSubmitting(true);

    // Local scoring (no backend attempts yet)
    let obtained = 0;
    let total = 0;
    quiz.questions.forEach((q, idx) => {
      const marks = q.marks ?? 1;
      const negative = q.negativeMarks ?? 0;
      total += marks;
      const userAnswer = answers[idx];
      if (userAnswer == null) return;
      if (userAnswer === q.correctOptionIndex) {
        obtained += marks;
      } else {
        obtained -= negative;
      }
    });

    setScore({ obtained: Math.max(obtained, 0), total });
    setSubmitted(true);
    setSubmitting(false);

    if (!auto) {
      alert('Quiz submitted successfully!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">Loading quiz...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-sm text-red-600 mb-4">{error || 'Quiz not found'}</p>
        <button
          type="button"
          onClick={() => router.push('/dashboard/quizzes')}
          className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs uppercase text-gray-500 font-semibold mb-1">
              Time Remaining
            </div>
            <div
              className={`text-lg font-bold ${
                timeLeft !== null && timeLeft <= 60 ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {score && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <span className="font-semibold">Your Score: </span>
            {score.obtained} / {score.total}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <ol className="space-y-4">
            {quiz.questions.map((q, qIndex) => (
              <li key={qIndex} className="border-b border-gray-100 pb-4 last:border-b-0">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Q{qIndex + 1}. {q.questionText}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, optIndex) => {
                    const selected = answers[qIndex] === optIndex;
                    const isCorrect = submitted && q.correctOptionIndex === optIndex;
                    const isWrongSelected =
                      submitted && selected && q.correctOptionIndex !== optIndex;
                    return (
                      <button
                        key={optIndex}
                        type="button"
                        disabled={submitted}
                        onClick={() => handleOptionSelect(qIndex, optIndex)}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                          isCorrect
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : isWrongSelected
                            ? 'border-red-500 bg-red-50 text-red-800'
                            : selected
                            ? 'border-purple-500 bg-purple-50 text-purple-800'
                            : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}. {opt}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 flex justify-between items-center">
            <button
              type="button"
              onClick={() => router.push('/dashboard/quizzes')}
              className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Back to List
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitted || submitting}
              className="rounded-lg bg-purple-600 px-6 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitted ? 'Submitted' : submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizAttemptPage() {
  return (
    <ProtectedRoute>
      <QuizAttemptContent />
    </ProtectedRoute>
  );
}


