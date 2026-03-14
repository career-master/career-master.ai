'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

interface QuestionReport {
  questionNumber: number;
  questionText: string;
  questionType: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  marksObtained: number;
  marks: number;
}

interface AttemptReport {
  attemptId: string;
  quizTitle: string;
  quizDescription?: string;
  user: {
    name: string;
    email: string;
  };
  attemptDetails: {
    submittedAt: string;
    timeSpentFormatted: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    result: string;
  };
  summary: {
    totalQuestions: number;
    attempted: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    accuracy: number | string;
  };
  questions: QuestionReport[];
}

export default function AttemptReportPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const router = useRouter();
  const [report, setReport] = useState<AttemptReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      if (!attemptId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await apiService.getQuizAttemptReport(attemptId);
        if (res.success && res.data) {
          setReport(res.data as AttemptReport);
        } else {
          setError(res.error?.message || 'Unable to load report.');
        }
      } catch (err: any) {
        setError(err?.message || 'Unable to load report.');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-purple-600" />
          <p className="mt-3 text-sm text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-xl bg-white p-6 shadow">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Report not available</h1>
          <p className="text-sm text-gray-600 mb-4">
            {error || 'This quiz report could not be found or you do not have permission to view it.'}
          </p>
          <button
            onClick={() => router.push('/dashboard/reports')}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const { quizTitle, quizDescription, user, attemptDetails, summary, questions } = report;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.push('/dashboard/reports')}
            className="rounded-full border border-gray-300 p-2 text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Quiz Report
            </p>
            <h1 className="text-lg font-semibold text-gray-900">{quizTitle}</h1>
          </div>
          <div className="ml-auto rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold uppercase text-white">
            {attemptDetails.result === 'pass' ? 'Passed' : 'Failed'}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase">Student</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            {quizDescription && (
              <p className="mt-3 text-xs text-gray-600 line-clamp-3">{quizDescription}</p>
            )}
          </div>
          <div className="rounded-xl bg-white p-4 shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase">Score</p>
            <p className="mt-2 text-2xl font-extrabold text-gray-900">
              {attemptDetails.marksObtained}/{attemptDetails.totalMarks}
            </p>
            <p className="text-sm font-semibold text-purple-600">
              {attemptDetails.percentage.toFixed(2)}% •{' '}
              <span className="text-gray-600">
                Accuracy {typeof summary.accuracy === 'string' ? summary.accuracy : `${summary.accuracy}%`}
              </span>
            </p>
            <p className="mt-2 text-xs text-gray-600">
              Time spent: {attemptDetails.timeSpentFormatted}
            </p>
            <p className="text-xs text-gray-500">
              Submitted: {new Date(attemptDetails.submittedAt).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow">
            <p className="text-xs font-semibold text-gray-500 uppercase">Questions</p>
            <dl className="mt-2 space-y-1 text-xs text-gray-700">
              <div className="flex justify-between">
                <dt>Total</dt>
                <dd className="font-semibold">{summary.totalQuestions}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Attempted</dt>
                <dd className="font-semibold text-blue-600">{summary.attempted}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Correct</dt>
                <dd className="font-semibold text-green-600">{summary.correct}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Incorrect</dt>
                <dd className="font-semibold text-red-600">{summary.incorrect}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Unattempted</dt>
                <dd className="font-semibold text-gray-500">{summary.unattempted}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Question-wise analysis */}
        <div className="rounded-xl bg-white p-4 shadow">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Question-wise Analysis</h2>
            <p className="text-xs text-gray-500">
              {questions.length} questions
            </p>
          </div>
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {questions.map((q) => (
              <div
                key={q.questionNumber}
                className="rounded-lg border border-gray-200 p-3 text-xs"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-[10px] font-semibold text-white">
                      {q.questionNumber}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {q.questionText}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      q.isCorrect
                        ? 'bg-green-50 text-green-700 border border-green-600'
                        : q.userAnswer === 'Not Attempted'
                          ? 'bg-gray-50 text-gray-600 border border-gray-400'
                          : 'bg-red-50 text-red-700 border border-red-600'
                    }`}
                  >
                    {q.isCorrect
                      ? 'Correct'
                      : q.userAnswer === 'Not Attempted'
                        ? 'Not Attempted'
                        : 'Incorrect'}
                  </span>
                </div>

                {q.options && q.options.length > 0 && (
                  <ul className="mt-1 grid gap-1 md:grid-cols-2">
                    {q.options.map((opt, idx) => {
                      const isCorrectOpt = q.correctAnswer?.includes(opt);
                      const isUserOpt = q.userAnswer?.includes(opt);
                      return (
                        <li
                          key={idx}
                          className={`rounded border px-2 py-1 ${
                            isCorrectOpt
                              ? 'border-green-500 bg-green-50 text-green-800'
                              : isUserOpt
                                ? 'border-red-400 bg-red-50 text-red-800'
                                : 'border-gray-200 text-gray-700'
                          }`}
                        >
                          <span className="mr-1 font-semibold">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {opt}
                        </li>
                      );
                    })}
                  </ul>
                )}

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-700">
                  <div>
                    <span className="font-semibold text-gray-800">Correct:</span>{' '}
                    {q.correctAnswer || '—'}
                    <span className="ml-3 font-semibold text-gray-800">Your answer:</span>{' '}
                    {q.userAnswer || '—'}
                  </div>
                  <div className="font-semibold">
                    Marks: {q.marksObtained}/{q.marks}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

