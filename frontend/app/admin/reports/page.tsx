 'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AdminQuizAttempt {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  subjectTitle?: string;
  topicTitle?: string;
  level?: string | null;
  submittedAt: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  result: string;
  userName?: string;
  userEmail?: string;
}

type SortField = 'date' | 'score' | 'subject' | 'result';
type SortDir = 'asc' | 'desc';

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
  const totalPages = Math.ceil(total / pageSize) || 1;

  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteModalSingle, setDeleteModalSingle] = useState<{ id: string; label: string } | null>(null);
  const [deleteModalBulk, setDeleteModalBulk] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingBulk, setDeletingBulk] = useState(false);

  const sortedAttempts = useMemo(() => {
    const list = [...attempts];
    const cmp = (a: AdminQuizAttempt, b: AdminQuizAttempt): number => {
      let av: number | string, bv: number | string;
      switch (sortBy) {
        case 'date':
          av = new Date(a.submittedAt).getTime();
          bv = new Date(b.submittedAt).getTime();
          return (av as number) - (bv as number);
        case 'score':
          av = a.percentage;
          bv = b.percentage;
          return (av as number) - (bv as number);
        case 'subject':
          av = (a.subjectTitle ?? '').toLowerCase();
          bv = (b.subjectTitle ?? '').toLowerCase();
          return (av as string).localeCompare(bv as string);
        case 'result':
          av = (a.result ?? '').toLowerCase();
          bv = (b.result ?? '').toLowerCase();
          return (av as string).localeCompare(bv as string);
        default:
          return 0;
      }
    };
    list.sort((a, b) => (sortDir === 'asc' ? cmp(a, b) : -cmp(a, b)));
    return list;
  }, [attempts, sortBy, sortDir]);

  const allSelected = attempts.length > 0 && selectedIds.size === attempts.length;
  const someSelected = selectedIds.size > 0;

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(attempts.map((a) => a.attemptId)));
  };

  const toggleSelect = (attemptId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(attemptId)) next.delete(attemptId);
      else next.add(attemptId);
      return next;
    });
  };

  const handleConfirmDeleteSingle = async () => {
    if (!deleteModalSingle) return;
    const id = deleteModalSingle.id;
    setDeletingId(id);
    try {
      const res = await apiService.deleteAdminQuizAttempt(id);
      if (res?.success) {
        setAttempts((prev) => prev.filter((a) => a.attemptId !== id));
        setTotal((t) => Math.max(0, t - 1));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast.success('Attempt deleted.');
        setDeleteModalSingle(null);
      } else {
        toast.error(res?.message ?? 'Failed to delete attempt');
      }
    } catch (e) {
      toast.error('Failed to delete attempt');
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirmDeleteBulk = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setDeletingBulk(true);
    try {
      let ok = 0;
      for (const attemptId of ids) {
        const res = await apiService.deleteAdminQuizAttempt(attemptId);
        if (res?.success) ok++;
      }
      if (ok > 0) {
        setAttempts((prev) => prev.filter((a) => !selectedIds.has(a.attemptId)));
        setTotal((t) => Math.max(0, t - ok));
        setSelectedIds(new Set());
        setDeleteModalBulk(false);
        toast.success(`${ok} attempt(s) deleted.`);
      }
      if (ok < ids.length) toast.error(`Failed to delete ${ids.length - ok} attempt(s).`);
    } catch (e) {
      toast.error('Failed to delete selected attempts');
    } finally {
      setDeletingBulk(false);
    }
  };

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
      toast.error('Failed to download PDF report');
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
      toast.error('Failed to download Excel report');
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
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <div className="flex flex-wrap gap-2">
                {(['date', 'score', 'subject', 'result'] as SortField[]).map((field) => (
                  <button
                    key={field}
                    onClick={() => {
                      if (sortBy === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                      else setSortBy(field);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      sortBy === field
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {field === 'date' ? 'Date' : field === 'score' ? 'Score' : field === 'subject' ? 'Subject' : 'Pass/Fail'}
                    {sortBy === field && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                ))}
              </div>
              {someSelected && (
                <button
                  onClick={() => setDeleteModalBulk(true)}
                  disabled={deletingBulk}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Delete selected ({selectedIds.size})
                </button>
              )}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[1100px] whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="py-2 px-2 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </th>
                    <th className="py-2 px-3 font-semibold text-gray-800">S.No</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Student</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Quiz</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Subject</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Difficulty</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Marks</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">% </th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Result</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Date</th>
                    <th className="py-2 px-3 font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAttempts.map((a, idx) => (
                    <tr key={a.attemptId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(a.attemptId)}
                          onChange={() => toggleSelect(a.attemptId)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="py-2 px-3 text-gray-900">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-2 px-3 max-w-[260px] text-gray-900">
                        <div className="truncate">
                          {(a.userName || '—') + ' (' + (a.userEmail || '—') + ')'}
                        </div>
                      </td>
                      <td className="py-2 px-3 max-w-[220px] text-gray-900">
                        <div className="truncate">{a.quizTitle}</div>
                      </td>
                      <td className="py-2 px-3 max-w-[180px] text-gray-900">
                        {a.subjectTitle || '—'}
                      </td>
                      <td className="py-2 px-3 text-gray-900">
                        {a.level === 'basic' ? 'Easy' : a.level === 'hard' ? 'Hard' : '—'}
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
                            className="inline-flex items-center justify-center rounded-full p-1.5 hover:bg-gray-100"
                            title="View details"
                          >
                            <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(a.attemptId)}
                            className="inline-flex items-center justify-center rounded-full p-1.5 hover:bg-blue-50"
                            title="Download PDF"
                          >
                            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v6m0 0l-3-3m3 3l3-3" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDownloadExcel(a.attemptId)}
                            className="inline-flex items-center justify-center rounded-full p-1.5 hover:bg-green-50"
                            title="Download Excel"
                          >
                            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteModalSingle({ id: a.attemptId, label: a.quizTitle })}
                            disabled={!!deletingId}
                            className="inline-flex items-center justify-center rounded-full p-1.5 hover:bg-red-50"
                            title="Delete attempt"
                          >
                            <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {sortedAttempts.map((a, idx) => (
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
                      <div className="text-xs text-gray-600">
                        Difficulty: {a.level === 'basic' ? 'Easy' : a.level === 'hard' ? 'Hard' : '—'}
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
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white"
                      title="View details"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(a.attemptId)}
                      className="rounded-md px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100"
                      title="PDF"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v6m0 0l-3-3m3 3l3-3" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDownloadExcel(a.attemptId)}
                      className="rounded-md px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100"
                      title="Excel"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteModalSingle({ id: a.attemptId, label: a.quizTitle })}
                      disabled={!!deletingId}
                      className="rounded-md px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100"
                      title="Delete"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {total > pageSize && (
              <div className="mt-4 flex items-center justify-between text-xs text-gray-900">
                <span>
                  Page {page} • Showing {(page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, total)} of {total}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-md border border-gray-300 px-2 py-1 text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-500"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page * pageSize >= total}
                    className="rounded-md border border-gray-300 px-2 py-1 text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:text-gray-500"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {deleteModalSingle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => !deletingId && setDeleteModalSingle(null)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-gray-900 font-medium">Delete this attempt?</p>
            <p className="text-sm text-gray-600 mt-1 truncate" title={deleteModalSingle.label}>{deleteModalSingle.label}</p>
            <p className="text-xs text-gray-500 mt-2">This cannot be undone.</p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => !deletingId && setDeleteModalSingle(null)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteSingle}
                disabled={deletingId !== null}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => !deletingBulk && setDeleteModalBulk(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-gray-900 font-medium">Delete {selectedIds.size} selected attempt(s)?</p>
            <p className="text-xs text-gray-500 mt-2">This cannot be undone.</p>
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => !deletingBulk && setDeleteModalBulk(false)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteBulk}
                disabled={deletingBulk}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingBulk ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

