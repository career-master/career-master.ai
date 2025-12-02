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
  submittedAt: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  result: string;
  timeSpentInSeconds: number;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(attempts.length / pageSize);
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, attempts.length);
  const paginatedAttempts = attempts.slice(startIdx, endIdx);

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        setLoading(true);
        console.log('Loading quiz attempts for user:', user?.email);
        const res = await apiService.getUserQuizAttempts(selectedQuizId || undefined);
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
  }, [user, selectedQuizId]);

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz Reports: {attempts.length} {attempts.length === 1 ? 'Attempt' : 'Attempts'}
          </h1>
          <p className="text-gray-600 text-sm">
            View detailed reports with correct answers for each quiz attempt. Download PDF or Excel reports.
          </p>
        </div>

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
                      <th className="py-3 px-4 text-sm font-bold text-gray-900">Marks</th>
                      <th className="py-3 px-4 text-sm font-bold text-gray-900">Percentage</th>
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
                        <td className="py-3 px-4 text-gray-900">
                          {attempt.marksObtained}/{attempt.totalMarks}
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-semibold">{attempt.percentage.toFixed(1)}%</td>
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

