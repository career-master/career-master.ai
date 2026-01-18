'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Using inline SVG icons instead of lucide-react

interface QuizAttempt {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  subjectId?: string;
  subjectTitle?: string;
  topicId?: string;
  topicTitle?: string;
  submittedAt: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  result: string;
  timeSpentInSeconds: number;
  difficultyBreakdown?: {
    easy: { total: number; correct: number; marksObtained: number; totalMarks: number };
    medium: { total: number; correct: number; marksObtained: number; totalMarks: number };
    hard: { total: number; correct: number; marksObtained: number; totalMarks: number };
  };
}

export default function ReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  
  // Filters
  const [filters, setFilters] = useState<{
    quizId?: string;
    subjectId?: string;
    topicId?: string;
    dateFrom?: string;
    dateTo?: string;
    minScore?: number;
    maxScore?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  }>({});
  const [showFilters, setShowFilters] = useState(false);
  
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(attempts.length / pageSize);
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, attempts.length);
  const paginatedAttempts = attempts.slice(startIdx, endIdx);

  // Load subjects and topics for filters
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [subjectsRes, topicsRes] = await Promise.all([
          apiService.getSubjects({ page: 1, limit: 100, isActive: true }),
          apiService.getTopics(undefined, true)
        ]);
        if (subjectsRes.success && subjectsRes.data?.items) {
          setSubjects(subjectsRes.data.items);
        }
        if (topicsRes.success && Array.isArray(topicsRes.data)) {
          setTopics(topicsRes.data);
        }
      } catch (error) {
        console.error('Failed to load filter data:', error);
      }
    };
    if (user) {
      loadFilterData();
    }
  }, [user]);

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        setLoading(true);
        console.log('Loading quiz attempts for user:', user?.email, 'with filters:', filters);
        const res = await apiService.getUserQuizAttempts(filters);
        console.log('Quiz attempts response:', res);
        
        if (res && res.success && res.data) {
          const attemptsData = Array.isArray(res.data) ? res.data : [];
          console.log('Setting attempts:', attemptsData);
          setAttempts(attemptsData);
        } else {
          console.warn('No attempts data in response:', res);
          setAttempts([]);
        }
      } catch (error) {
        console.error('Failed to load quiz attempts:', error);
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadAttempts();
    } else {
      setAttempts([]);
    }
  }, [user, filters]);
  
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => {
      const updated = { ...prev };
      if (value === '' || value === null || value === undefined) {
        delete updated[key as keyof typeof updated];
      } else {
        (updated as any)[key] = value;
      }
      return updated;
    });
    setPage(1); // Reset to first page when filters change
  };
  
  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };
  
  const hasActiveFilters = Object.keys(filters).length > 0;

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
      console.error('Failed to download PDF:', error);
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
      console.error('Failed to download Excel:', error);
      alert('Failed to download Excel report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6f42c1] to-[#e83e8c] text-white py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-white">Quiz Reports</h2>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Quiz Reports: {attempts.length} {attempts.length === 1 ? 'Attempt' : 'Attempts'}
            </h1>
            <p className="text-gray-600 text-sm">
              View detailed reports with correct answers for each quiz attempt. Download PDF or Excel reports.
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="bg-white text-purple-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                {Object.keys(filters).length}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Subject Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={filters.subjectId || ''}
                  onChange={(e) => handleFilterChange('subjectId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                <select
                  value={filters.topicId || ''}
                  onChange={(e) => handleFilterChange('topicId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                  disabled={!filters.subjectId}
                >
                  <option value="">All Topics</option>
                  {topics
                    .filter((topic) => !filters.subjectId || topic.subjectId === filters.subjectId)
                    .map((topic) => (
                      <option key={topic._id} value={topic._id}>
                        {topic.title}
                      </option>
                    ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                />
              </div>

              {/* Min Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.minScore ?? ''}
                  onChange={(e) => handleFilterChange('minScore', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                  placeholder="0"
                />
              </div>

              {/* Max Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.maxScore ?? ''}
                  onChange={(e) => handleFilterChange('maxScore', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                  placeholder="100"
                />
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={filters.difficulty || ''}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 mt-4">Loading reports...</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 mb-4">No quiz attempts found</p>
              <Link
                href="/dashboard/quizzes"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Take a Quiz
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-3 px-4 text-sm font-bold text-gray-900">S.NO</th>
                      <th className="py-3 px-4 text-sm font-bold text-gray-900">Quiz Name</th>
                      <th className="py-3 px-4 text-sm font-bold text-gray-900">Subject/Topic</th>
                      <th className="py-3 px-4 text-sm font-bold text-gray-900">Marks</th>
                      <th className="py-3 px-4 text-sm font-bold text-gray-900">Percentage</th>
                      <th className="py-3 px-4 text-sm font-bold text-gray-900">Difficulty</th>
                      <th className="py-3 px-4 text-sm font-bold text-gray-900">Time Taken</th>
                      <th className="py-3 px-4 text-sm font-bold text-gray-900">Result</th>
                      <th className="py-3 px-4 text-sm font-bold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAttempts.map((attempt, idx) => (
                      <tr key={attempt.attemptId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">{startIdx + idx + 1}</td>
                        <td className="py-3 px-4 text-gray-900 font-medium">{attempt.quizTitle}</td>
                        <td className="py-3 px-4 text-gray-900 text-sm">
                          {attempt.subjectTitle && (
                            <div className="mb-1">
                              <span className="text-gray-500">Subject:</span> {attempt.subjectTitle}
                            </div>
                          )}
                          {attempt.topicTitle && (
                            <div>
                              <span className="text-gray-500">Topic:</span> {attempt.topicTitle}
                            </div>
                          )}
                          {!attempt.subjectTitle && !attempt.topicTitle && (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {attempt.marksObtained}/{attempt.totalMarks}
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-semibold">{attempt.percentage.toFixed(1)}%</td>
                        <td className="py-3 px-4">
                          {attempt.difficultyBreakdown ? (
                            <div className="flex flex-col gap-1 text-xs">
                              {attempt.difficultyBreakdown.easy.total > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                  <span>Easy:</span>
                                  <span className="font-semibold">
                                    {attempt.difficultyBreakdown.easy.correct}/{attempt.difficultyBreakdown.easy.total}
                                  </span>
                                </span>
                              )}
                              {attempt.difficultyBreakdown.medium.total > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                                  <span>Med:</span>
                                  <span className="font-semibold">
                                    {attempt.difficultyBreakdown.medium.correct}/{attempt.difficultyBreakdown.medium.total}
                                  </span>
                                </span>
                              )}
                              {attempt.difficultyBreakdown.hard.total > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                  <span>Hard:</span>
                                  <span className="font-semibold">
                                    {attempt.difficultyBreakdown.hard.correct}/{attempt.difficultyBreakdown.hard.total}
                                  </span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {Math.floor(attempt.timeSpentInSeconds / 60)}m {attempt.timeSpentInSeconds % 60}s
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-md font-bold border-2 text-sm ${
                            attempt.result === 'pass'
                              ? 'bg-green-50 text-green-700 border-green-700'
                              : 'bg-red-50 text-red-700 border-red-700'
                          }`}>
                            {attempt.result.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/dashboard/reports/${attempt.attemptId}`)}
                              className="hover:bg-purple-100 rounded-full p-2 transition-colors"
                              title="View Report"
                            >
                              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(attempt.attemptId)}
                              className="hover:bg-blue-100 rounded-full p-2 transition-colors"
                              title="Download PDF"
                            >
                              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDownloadExcel(attempt.attemptId)}
                              className="hover:bg-green-100 rounded-full p-2 transition-colors"
                              title="Download Excel"
                            >
                              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-end items-center mt-4 gap-2">
                    <span className="text-gray-600 text-sm mr-4">
                      {startIdx + 1}–{endIdx} of {attempts.length}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {paginatedAttempts.map((attempt, idx) => (
                  <div key={attempt.attemptId} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Attempt #{startIdx + idx + 1}</div>
                        <div className="text-base font-semibold text-gray-900">{attempt.quizTitle}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-md font-bold border-2 text-xs ${
                        attempt.result === 'pass'
                          ? 'bg-green-50 text-green-700 border-green-700'
                          : 'bg-red-50 text-red-700 border-red-700'
                      }`}>
                        {attempt.result.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm text-gray-900 mb-4">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Marks</div>
                        <div className="font-semibold">{attempt.marksObtained}/{attempt.totalMarks}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Percentage</div>
                        <div className="font-semibold">{attempt.percentage.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Time</div>
                        <div className="font-semibold">
                          {Math.floor(attempt.timeSpentInSeconds / 60)}m {attempt.timeSpentInSeconds % 60}s
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/reports/${attempt.attemptId}`)}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-purple-600 text-white py-2 text-sm font-medium hover:bg-purple-700 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Report
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(attempt.attemptId)}
                        className="px-3 py-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="PDF"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDownloadExcel(attempt.attemptId)}
                        className="px-3 py-2 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Excel"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Mobile Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center py-4">
                    <span className="text-gray-600 text-sm">
                      {startIdx + 1}–{endIdx} of {attempts.length}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 rounded border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

