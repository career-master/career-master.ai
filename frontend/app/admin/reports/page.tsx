 'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

interface AdminQuizAttempt {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  subjectTitle?: string;
  topicTitle?: string;
  submittedAt: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  result: string;
  userName?: string;
  userEmail?: string;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<AdminQuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<{
    subjectId?: string;
    email?: string;
    name?: string;
  }>({});

  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const subjectsRes = await apiService.getSubjects({ page: 1, limit: 200, isActive: true });
        if (subjectsRes.success && subjectsRes.data?.items) {
          setSubjects(subjectsRes.data.items);
        }
      } catch (error) {
        console.error('Failed to load subjects for filters', error);
      }
    };
    loadFilterData();
  }, []);

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        setLoading(true);
        const res = await apiService.getAdminUserQuizAttempts({
          subjectId: filters.subjectId,
          email: filters.email,
          name: filters.name,
          page,
          limit: pageSize,
        });

        if (res && res.success && Array.isArray(res.data)) {
          setAttempts(res.data as AdminQuizAttempt[]);
          setTotal(typeof res.total === 'number' ? res.total : res.data.length);
        } else {
          setAttempts([]);
          setTotal(0);
        }
      } catch (error) {
        console.error('Failed to load attempts for admin reports', error);
        setAttempts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    loadAttempts();
  }, [filters.subjectId, filters.email, filters.name, page]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      const updated = { ...prev };
      if (!value) {
        delete updated[key];
      } else {
        updated[key] = value;
      }
      return updated;
    });
    setPage(1);
  };

  const handleDownloadPDF = async (attemptId: string) => {
    try {
      const blob = await apiService.downloadPDFReport(attemptId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz-report-${attemptId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download PDF report', error);
      alert('Failed to download PDF report');
    }
  };

  const handleDownloadExcel = async (attemptId: string) => {
    try {
      const blob = await apiService.downloadExcelReport(attemptId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz-report-${attemptId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download Excel report', error);
      alert('Failed to download Excel report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            View quiz performance across students and subjects. Filter and download detailed reports.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Subject
            </label>
            <select
              value={filters.subjectId || ''}
              onChange={(e) => handleFilterChange('subjectId', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Student Email
            </label>
            <input
              type="email"
              value={filters.email || ''}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              placeholder="search by email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Student Name
            </label>
            <input
              type="text"
              value={filters.name || ''}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="search by name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({})}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        {loading ? (
          <div className="py-8 text-center text-gray-600 text-sm">
            Loading reports...
          </div>
        ) : attempts.length === 0 ? (
          <div className="py-8 text-center text-gray-600 text-sm">
            No quiz attempts found for the selected filters.
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="py-2 px-3 font-semibold text-gray-800">S.No</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Student</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Quiz</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Subject</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Marks</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">%</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Result</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Date</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a, idx) => (
                    <tr key={a.attemptId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-900">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-gray-900">
                          {a.userName || '—'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {a.userEmail || '—'}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-gray-900">{a.quizTitle}</td>
                      <td className="py-2 px-3 text-gray-900">
                        {a.subjectTitle || '—'}
                      </td>
                      <td className="py-2 px-3 text-gray-900">
                        {a.marksObtained}/{a.totalMarks}
                      </td>
                      <td className="py-2 px-3 text-gray-900">
                        {a.percentage?.toFixed(1)}%
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            a.result === 'pass'
                              ? 'bg-green-50 text-green-700 border border-green-600'
                              : 'bg-red-50 text-red-700 border border-red-600'
                          }`}
                        >
                          {a.result?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-600">
                        {a.submittedAt
                          ? new Date(a.submittedAt).toLocaleString()
                          : '—'}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => router.push(`/admin/reports/${a.attemptId}`)}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(a.attemptId)}
                            className="rounded-md border border-blue-500 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => handleDownloadExcel(a.attemptId)}
                            className="rounded-md border border-green-500 px-2 py-1 text-xs text-green-600 hover:bg-green-50"
                          >
                            Excel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {attempts.map((a, idx) => (
                <div
                  key={a.attemptId}
                  className="rounded-xl border border-gray-200 p-3 text-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs text-gray-400">
                        #{(page - 1) * pageSize + idx + 1}
                      </div>
                      <div className="font-semibold text-gray-900">
                        {a.quizTitle}
                      </div>
                      <div className="text-xs text-gray-500">
                        {a.subjectTitle || '—'}
                      </div>
                      <div className="mt-1 text-xs text-gray-600">
                        {a.userName || '—'} ({a.userEmail || '—'})
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        a.result === 'pass'
                          ? 'bg-green-50 text-green-700 border border-green-600'
                          : 'bg-red-50 text-red-700 border border-red-600'
                      }`}
                    >
                      {a.result?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-700 mb-2">
                    <div>
                      <div className="text-gray-500">Marks</div>
                      <div className="font-semibold">
                        {a.marksObtained}/{a.totalMarks}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Percentage</div>
                      <div className="font-semibold">
                        {a.percentage?.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Date</div>
                      <div className="font-semibold">
                        {a.submittedAt
                          ? new Date(a.submittedAt).toLocaleDateString()
                          : '—'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/reports/${a.attemptId}`)}
                      className="flex-1 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(a.attemptId)}
                      className="rounded-md border border-blue-500 px-3 py-1.5 text-xs font-semibold text-blue-600"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => handleDownloadExcel(a.attemptId)}
                      className="rounded-md border border-green-500 px-3 py-1.5 text-xs font-semibold text-green-600"
                    >
                      Excel
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {total > pageSize && (
              <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
                <span>
                  Page {page} • Showing {(page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, total)} of {total}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-md border border-gray-300 px-2 py-1 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page * pageSize >= total}
                    className="rounded-md border border-gray-300 px-2 py-1 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

