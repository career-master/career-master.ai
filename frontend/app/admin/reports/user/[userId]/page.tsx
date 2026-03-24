'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';

const PassFailDoughnutChart = dynamic(
  () => import('@/components/admin/PassFailDoughnutChart'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-xs text-gray-500">Loading chart…</div>
    ),
  }
);

type QuizBreakdownRow = {
  quizId: string;
  quizTitle: string;
  attempts: number;
  totalMarksObtained: number;
  totalMarksPossible: number;
  averagePercentage: number;
  overallPercentage: number;
  passCount: number;
  failCount: number;
  accuracyPercentage: number;
  passRate: number;
  timeWithinLimitCount: number;
  timeWithinLimitPercent: number;
  averageTimeSpentFormatted: string;
};

type UserCumulativeResponse = {
  user: {
    userId: string;
    name: string;
    email: string;
    registrationDate: string | Date | null;
  };
  auth: {
    loginCount: number;
    lastLoginAt: string | Date | null;
  };
  cumulative: {
    rank: number;
    userId: string;
    userName: string;
    userEmail: string;
    totalAttempts: number;
    totalMarksObtained: number;
    totalMarksPossible: number;
    averagePercentage: number;
    overallPercentage: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unattemptedAnswers: number;
    accuracyPercentage: number;
    passCount: number;
    passRate: number;
    timeWithinLimitCount: number;
    timeWithinLimitPercent: number;
    averageTimeSpentFormatted: string;
  };
  pie: {
    labels: string[];
    data: number[];
  };
  quizBreakdown: QuizBreakdownRow[];
};

export default function AdminUserCumulativeReportPage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<UserCumulativeResponse | null>(null);

  const filters = useMemo(() => {
    const domain = searchParams.get('domain') || undefined;
    const category = searchParams.get('category') || undefined;
    const subjectId = searchParams.get('subjectId') || undefined;
    const topicId = searchParams.get('topicId') || undefined;
    return { domain, category, subjectId, topicId };
  }, [searchParams]);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiService.getAdminUserCumulativeQuizReport(userId, filters);
        if (res?.success && res.data) {
          setReport(res.data as UserCumulativeResponse);
        } else {
          setError(res?.message || 'Unable to load user report');
        }
      } catch (e: any) {
        setError(e?.message || 'Unable to load user report');
        toast.error('Failed to load user report');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId, filters]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-2" />
          <p className="text-sm text-gray-600">Loading user report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="rounded-xl bg-white p-6 shadow">
        <h1 className="text-lg font-semibold text-gray-900 mb-2">User report not available</h1>
        <p className="text-sm text-gray-600 mb-4">{error || 'This report could not be loaded.'}</p>
        <button
          onClick={() => router.push('/admin/reports')}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Back to Admin Reports
        </button>
      </div>
    );
  }

  const { user, auth, cumulative, pie, quizBreakdown } = report;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">User Cumulative Report</p>
          <h1 className="text-lg font-semibold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/admin/reports')}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-4 shadow border border-gray-100">
          <p className="text-xs font-semibold text-gray-600">Registration Date</p>
          <p className="mt-2 text-sm font-semibold text-gray-900">
            {user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow border border-gray-100">
          <p className="text-xs font-semibold text-gray-600">Last Login</p>
          <p className="mt-2 text-sm font-semibold text-gray-900">
            {auth.lastLoginAt ? new Date(auth.lastLoginAt).toLocaleString() : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow border border-gray-100">
          <p className="text-xs font-semibold text-gray-600">Login Count</p>
          <p className="mt-2 text-sm font-semibold text-gray-900">{auth.loginCount || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white p-5 shadow border border-gray-100 lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Pass / Fail Pie</h2>
          <div className="h-64">
            <PassFailDoughnutChart labels={pie.labels} data={pie.data} />
          </div>
          <div className="mt-3 text-xs text-gray-600 flex justify-between">
            <span>Pass: {cumulative.passCount}</span>
            <span>Fail: {Math.max(0, cumulative.totalAttempts - cumulative.passCount)}</span>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow border border-gray-100 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-600">Marks</p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                {cumulative.totalMarksObtained}/{cumulative.totalMarksPossible}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Overall: {cumulative.overallPercentage.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Avg %: {cumulative.averagePercentage.toFixed(2)}%
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-600">Right / Wrong</p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                {cumulative.correctAnswers}/{cumulative.incorrectAnswers}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Accuracy: {cumulative.accuracyPercentage.toFixed(2)}%
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-600">Pass Rate</p>
              <p className="mt-2 text-lg font-bold text-gray-900">{cumulative.passRate.toFixed(2)}%</p>
              <p className="text-sm text-gray-700 mt-1">
                Attempts: {cumulative.totalAttempts}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-semibold text-gray-600">Time (within limit)</p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                {cumulative.timeWithinLimitCount}/{cumulative.totalAttempts}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                {cumulative.timeWithinLimitPercent.toFixed(2)}% within limit
              </p>
              <p className="text-sm text-gray-600 mt-1">Avg time: {cumulative.averageTimeSpentFormatted}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Quiz-wise breakdown</h2>
        {quizBreakdown.length === 0 ? (
          <p className="text-sm text-gray-600">No quiz attempts found for the selected filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[980px] whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-2 px-3 font-semibold text-gray-800">Quiz</th>
                  <th className="py-2 px-3 font-semibold text-gray-800">Attempts</th>
                  <th className="py-2 px-3 font-semibold text-gray-800">Avg %</th>
                  <th className="py-2 px-3 font-semibold text-gray-800">Overall %</th>
                  <th className="py-2 px-3 font-semibold text-gray-800">Pass Rate</th>
                  <th className="py-2 px-3 font-semibold text-gray-800">Right/Wrong</th>
                  <th className="py-2 px-3 font-semibold text-gray-800">Time (limit)</th>
                </tr>
              </thead>
              <tbody>
                {quizBreakdown.map((q) => (
                  <tr key={q.quizId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-900 max-w-[360px] truncate">{q.quizTitle}</td>
                    <td className="py-2 px-3 text-gray-900">{q.attempts}</td>
                    <td className="py-2 px-3 text-gray-900">{q.averagePercentage.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-gray-900">{q.overallPercentage.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-gray-900">{q.passRate.toFixed(2)}%</td>
                    <td className="py-2 px-3 text-gray-900">
                      {q.passCount}/{q.failCount} (pass/fail)
                    </td>
                    <td className="py-2 px-3 text-gray-900">
                      {q.timeWithinLimitCount}/{q.attempts} ({q.timeWithinLimitPercent.toFixed(2)}%)
                      <div className="text-xs text-gray-600 mt-0.5">{q.averageTimeSpentFormatted}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

