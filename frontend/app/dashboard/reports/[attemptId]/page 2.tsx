'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface QuestionReport {
  questionNumber: number;
  questionType?: string;
  questionText: string;
  options?: string[];
  correctOptionIndex?: number;
  correctOptionIndices?: number[];
  correctAnswers?: string[];
  matchPairs?: Array<{ left: string; right: string }>;
  correctOrder?: string[];
  correctAnswer: string;
  userAnswerIndex?: number | null;
  userAnswer: string;
  userAnswerRaw?: any;
  isCorrect: boolean;
  isAnswered: boolean;
  marksObtained: number;
  marks: number;
  negativeMarks: number;
  imageUrl?: string;
  hotspotRegions?: Array<{ x: number; y: number; width: number; height: number; label?: string }>;
}

interface QuizReport {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  quizDescription?: string;
  user: {
    name: string;
    email: string;
  };
  attemptDetails: {
    submittedAt: string;
    timeSpentInSeconds: number;
    timeSpentFormatted: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    result: string;
    correctAnswers: number;
    incorrectAnswers: number;
    unattemptedAnswers: number;
  };
  questions: QuestionReport[];
  summary: {
    totalQuestions: number;
    attempted: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    accuracy: string;
  };
}

export default function QuizReportPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;
  const [report, setReport] = useState<QuizReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        const res = await apiService.getQuizAttemptReport(attemptId);
        if (res.success && res.data) {
          setReport(res.data);
        }
      } catch (error) {
        console.error('Failed to load report:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && attemptId) {
      loadReport();
    }
  }, [user, attemptId]);

  const handleDownloadPDF = async () => {
    // Use browser's print dialog so the user can "Save as PDF" and get EXACT UI rendering.
    // This avoids html2canvas limitations with modern CSS color functions (lab/oklch).
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadExcel = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="text-gray-600 mt-4">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Report not found</p>
          <button
            onClick={() => router.push('/dashboard/reports')}
            className="text-purple-600 hover:text-purple-700"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return '0m 0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6f42c1] to-[#e83e8c] text-white py-4 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard/reports')}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-white">Quiz Report</h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadPDF}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
              <button
                onClick={handleDownloadExcel}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Quiz Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Quiz: {report.quizTitle} - Quiz Report
          </h1>
          {report.quizDescription && (
            <p className="text-gray-600 mb-4">{report.quizDescription}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-4xl font-bold text-gray-900">
                {report.attemptDetails.marksObtained}/{report.attemptDetails.totalMarks}
              </p>
              <p className="text-sm text-gray-600 mt-2">Marks Obtained</p>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-4xl font-bold text-gray-900">
                {report.attemptDetails.percentage.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 mt-2">Your Score</p>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50">
              <p className="text-4xl font-bold text-gray-900">
                {formatTime(report.attemptDetails.timeSpentInSeconds)}
              </p>
              <p className="text-sm text-gray-600 mt-2">Time Taken</p>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50">
              <span className={`px-4 py-2 rounded-md font-bold border-2 text-sm inline-block ${
                report.attemptDetails.result === 'pass'
                  ? 'bg-green-50 text-green-700 border-green-700'
                  : 'bg-red-50 text-red-700 border-red-700'
              }`}>
                {report.attemptDetails.result.toUpperCase()}
              </span>
              <p className="text-sm text-gray-600 mt-2">Result</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            Completed on - {new Date(report.attemptDetails.submittedAt).toLocaleString()}
          </p>
        </div>

        {/* Quiz Performance Report with Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Performance Report</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <p className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold text-gray-900">Total Questions:</span>
                <span className="text-gray-900">{report.summary.totalQuestions}</span>
              </p>
              <p className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold text-gray-900">Correct Answers:</span>
                <span className="text-green-600 font-bold">{report.summary.correct}</span>
              </p>
              <p className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold text-gray-900">Incorrect Answers:</span>
                <span className="text-red-600 font-bold">{report.summary.incorrect}</span>
              </p>
              <p className="flex justify-between items-center py-2 border-b">
                <span className="font-semibold text-gray-900">Unattempted Answers:</span>
                <span className="text-blue-600 font-bold">{report.summary.unattempted}</span>
              </p>
              <p className="flex justify-between items-center py-2">
                <span className="font-semibold text-gray-900">Marks Obtained:</span>
                <span className="text-gray-900 font-bold">
                  {report.attemptDetails.marksObtained}/{report.attemptDetails.totalMarks}
                </span>
              </p>
              <p className="flex justify-between items-center py-2">
                <span className="font-semibold text-gray-900">Accuracy:</span>
                <span className="text-purple-600 font-bold">{report.summary.accuracy}%</span>
              </p>
            </div>
            {/* Pie Chart */}
            <div className="flex items-center justify-center">
              <div className="w-64 h-64">
                <Pie 
                  data={{
                    labels: ['Correct', 'Incorrect', 'Unattempted'],
                    datasets: [
                      {
                        data: [
                          report.summary.correct,
                          report.summary.incorrect,
                          report.summary.unattempted
                        ],
                        backgroundColor: ['#10b981', '#ef4444', '#6b7280'],
                        borderColor: '#fff',
                        borderWidth: 2
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 15,
                          font: {
                            size: 12
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions and Answers Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions and Answers</h2>
          <div className="space-y-6">
                {report.questions.map((q) => (
              <div
                key={q.questionNumber}
                className={`p-4 rounded-lg border-2 mb-4 ${
                  q.isCorrect
                    ? 'bg-green-50 border-green-300'
                    : q.isAnswered
                    ? 'bg-red-50 border-red-300'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        Q{q.questionNumber}: {q.questionText}
                      </h3>
                      {q.questionType && (
                        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-300">
                          {q.questionType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-4 py-1 rounded-md font-bold border-2 text-sm ml-4 ${
                    q.isCorrect
                      ? 'bg-green-100 text-green-700 border-green-700'
                      : q.isAnswered
                      ? 'bg-red-100 text-red-700 border-red-700'
                      : 'bg-gray-100 text-gray-700 border-gray-700'
                  }`}>
                    {q.isCorrect ? '✓ Correct' : q.isAnswered ? '✗ Wrong' : '○ Not Attempted'}
                  </span>
                </div>

                {/* Render based on question type */}
                {q.questionType === 'fill_in_blank' ? (
                  <div className="space-y-3 mb-4">
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Your Answer:</p>
                      <p className={`text-lg ${q.isCorrect ? 'text-green-700 font-bold' : 'text-gray-900'}`}>
                        {q.userAnswer}
                      </p>
                    </div>
                    {!q.isCorrect && (
                      <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                        <p className="text-sm font-semibold text-green-700 mb-2">Correct Answer(s):</p>
                        <p className="text-lg text-green-700 font-bold">{q.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                ) : q.questionType === 'match' ? (
                  <div className="space-y-3 mb-4">
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Your Matches:</p>
                      <div className="space-y-2">
                        {q.matchPairs?.map((pair, idx) => {
                          const userMatch = Array.isArray(q.userAnswerRaw) ? q.userAnswerRaw[idx] : '';
                          const isPairCorrect = pair.right.trim().toLowerCase() === (userMatch || '').trim().toLowerCase();
                          return (
                            <div key={idx} className={`p-3 rounded-lg border-2 ${
                              isPairCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
                            }`}>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-gray-700">{pair.left}</span>
                                <span className="text-gray-400">→</span>
                                <span className={isPairCorrect ? 'text-green-700 font-bold' : 'text-red-700'}>
                                  {userMatch || 'Not matched'}
                                </span>
                                {isPairCorrect && (
                                  <span className="text-green-600 ml-auto">✓</span>
                                )}
                              </div>
                              {!isPairCorrect && (
                                <p className="text-xs text-green-700 mt-1">Correct: {pair.right}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : q.questionType === 'reorder' ? (
                  <div className="space-y-3 mb-4">
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Your Order:</p>
                      <div className="space-y-2">
                        {Array.isArray(q.userAnswerRaw) && q.userAnswerRaw.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded border">
                            <span className="font-semibold text-gray-500 w-8">{idx + 1}.</span>
                            <span className="flex-1 text-gray-900">{item}</span>
                            {q.correctOrder && q.correctOrder[idx] === item && (
                              <span className="text-green-600">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    {!q.isCorrect && (
                      <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                        <p className="text-sm font-semibold text-green-700 mb-2">Correct Order:</p>
                        <p className="text-lg text-green-700 font-bold">{q.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                ) : q.questionType === 'hotspot' ? (
                  <div className="space-y-3 mb-4">
                    {q.imageUrl && (() => {
                      // Helper function to check if a click is within a hotspot region
                      const isClickInHotspot = (click: any, hotspot: any): boolean => {
                        if (!click || !hotspot || typeof click.x !== 'number' || typeof click.y !== 'number') {
                          return false;
                        }
                        const regionLeft = hotspot.x;
                        const regionRight = hotspot.x + hotspot.width;
                        const regionTop = hotspot.y;
                        const regionBottom = hotspot.y + hotspot.height;
                        return click.x >= regionLeft && click.x <= regionRight &&
                               click.y >= regionTop && click.y <= regionBottom;
                      };

                      // Check which clicks are correct and which are wrong
                      const clickedPoints = Array.isArray(q.userAnswerRaw) ? q.userAnswerRaw : [];
                      const hotspotRegions = q.hotspotRegions || [];
                      
                      // For each click, check if it's in any hotspot
                      const clickStatus = clickedPoints.map((click: any) => {
                        if (click && typeof click === 'object' && 'x' in click && 'y' in click) {
                          const isCorrect = hotspotRegions.some((hotspot: any) => isClickInHotspot(click, hotspot));
                          return { click, isCorrect };
                        }
                        return { click, isCorrect: false };
                      });

                      // For each hotspot, check if it was found
                      const hotspotStatus = hotspotRegions.map((hotspot: any, index: number) => {
                        const wasFound = clickedPoints.some((click: any) => isClickInHotspot(click, hotspot));
                        return { hotspot, wasFound, index };
                      });

                      const correctClicks = clickStatus.filter(cs => cs.isCorrect).length;
                      const wrongClicks = clickStatus.filter(cs => !cs.isCorrect).length;
                      const foundHotspots = hotspotStatus.filter(hs => hs.wasFound).length;
                      const missedHotspots = hotspotStatus.filter(hs => !hs.wasFound).length;

                      return (
                        <div className="relative inline-block mb-4">
                          <img 
                            src={q.imageUrl} 
                            alt="Question image" 
                            className="max-w-full h-auto rounded-lg border-2 border-gray-300 shadow-sm"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                          
                          {/* Show hotspot regions with status - visually prominent */}
                          {hotspotStatus.map((hs) => (
                            <div
                              key={hs.index}
                              className={`absolute border-3 pointer-events-none z-0 ${
                                hs.wasFound 
                                  ? 'border-green-600 bg-green-400 bg-opacity-50 shadow-lg' 
                                  : 'border-red-500 bg-red-300 bg-opacity-40 border-dashed shadow-md'
                              }`}
                              style={{
                                left: `${hs.hotspot.x}%`,
                                top: `${hs.hotspot.y}%`,
                                width: `${hs.hotspot.width}%`,
                                height: `${hs.hotspot.height}%`,
                              }}
                              title={hs.hotspot.label || `Hotspot ${hs.index + 1} - ${hs.wasFound ? 'Found ✓' : 'Missed ✗'}`}
                            >
                              {/* Status label on hotspot */}
                              <div className={`absolute -top-8 left-0 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 ${
                                hs.wasFound ? 'bg-green-600' : 'bg-red-600'
                              }`}>
                                {hs.wasFound ? '✓ Found' : '✗ Missed'}
                              </div>
                              {/* Hotspot number in center */}
                              <div className={`absolute inset-0 flex items-center justify-center text-white font-bold text-lg z-10 ${
                                hs.wasFound ? 'text-green-800' : 'text-red-800'
                              }`}>
                                {hs.index + 1}
                              </div>
                            </div>
                          ))}

                          {/* Show user's clicked points - correct (green) and wrong (red) - visually prominent */}
                          {clickStatus.map((cs, clickIndex: number) => {
                            if (cs.click && typeof cs.click === 'object' && 'x' in cs.click && 'y' in cs.click) {
                              return (
                                <div
                                  key={clickIndex}
                                  className={`absolute w-8 h-8 border-3 border-white rounded-full shadow-xl pointer-events-none z-20 flex items-center justify-center ${
                                    cs.isCorrect ? 'bg-green-600 ring-2 ring-green-400' : 'bg-red-600 ring-2 ring-red-400'
                                  }`}
                                  style={{
                                    left: `${cs.click.x}%`,
                                    top: `${cs.click.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                  }}
                                  title={`Click ${clickIndex + 1}: (${cs.click.x.toFixed(1)}%, ${cs.click.y.toFixed(1)}%) - ${cs.isCorrect ? 'Correct ✓' : 'Wrong ✗'}`}
                                >
                                  <span className="text-white text-sm font-bold">{clickIndex + 1}</span>
                                  {/* Status icon */}
                                  <span className={`absolute -top-2 -right-2 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg ${
                                    cs.isCorrect ? 'bg-green-700' : 'bg-red-700'
                                  }`}>
                                    {cs.isCorrect ? '✓' : '✗'}
                                  </span>
                                  {/* Status label */}
                                  <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-30 ${
                                    cs.isCorrect ? 'bg-green-600' : 'bg-red-600'
                                  }`}>
                                    {cs.isCorrect ? 'Correct' : 'Wrong'}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      );
                    })()}
                    <div className={`p-4 rounded-lg border-2 ${
                      q.isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                    }`}>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Your Answer:</p>
                      {Array.isArray(q.userAnswerRaw) && q.userAnswerRaw.length > 0 ? (() => {
                        const clickedPoints = q.userAnswerRaw;
                        const hotspotRegions = q.hotspotRegions || [];
                        
                        const isClickInHotspot = (click: any, hotspot: any): boolean => {
                          if (!click || !hotspot || typeof click.x !== 'number' || typeof click.y !== 'number') {
                            return false;
                          }
                          const regionLeft = hotspot.x;
                          const regionRight = hotspot.x + hotspot.width;
                          const regionTop = hotspot.y;
                          const regionBottom = hotspot.y + hotspot.height;
                          return click.x >= regionLeft && click.x <= regionRight &&
                                 click.y >= regionTop && click.y <= regionBottom;
                        };

                        const clickStatus = clickedPoints.map((click: any) => {
                          if (click && typeof click === 'object' && 'x' in click && 'y' in click) {
                            const isCorrect = hotspotRegions.some((hotspot: any) => isClickInHotspot(click, hotspot));
                            return { click, isCorrect };
                          }
                          return { click, isCorrect: false };
                        });

                        const hotspotStatus = hotspotRegions.map((hotspot: any, index: number) => {
                          const wasFound = clickedPoints.some((click: any) => isClickInHotspot(click, hotspot));
                          return { hotspot, wasFound, index };
                        });

                        const correctClicks = clickStatus.filter(cs => cs.isCorrect).length;
                        const wrongClicks = clickStatus.filter(cs => !cs.isCorrect).length;
                        const foundHotspots = hotspotStatus.filter(hs => hs.wasFound).length;
                        const missedHotspots = hotspotStatus.filter(hs => !hs.wasFound).length;

                        return (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                                <p className="text-xs font-semibold text-green-700 mb-1">Correct Clicks</p>
                                <p className="text-lg font-bold text-green-700">{correctClicks}</p>
                                <p className="text-xs text-green-600">Found {foundHotspots} of {hotspotRegions.length} hotspots</p>
                              </div>
                              <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                                <p className="text-xs font-semibold text-red-700 mb-1">Wrong Clicks</p>
                                <p className="text-lg font-bold text-red-700">{wrongClicks}</p>
                                <p className="text-xs text-red-600">Missed {missedHotspots} hotspot{missedHotspots !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600 italic">
                                <strong>Note:</strong> Green highlighted areas on the image above indicate hotspots you found correctly. 
                                Red dashed areas indicate hotspots you missed. Green numbered markers show your correct clicks, 
                                red numbered markers show your wrong clicks.
                              </p>
                            </div>
                          </div>
                        );
                      })() : (
                        <p className="text-gray-600">No answer provided</p>
                      )}
                      {q.isCorrect ? (
                        <p className="text-sm text-green-700 mt-2 font-semibold">✓ Correct! You clicked on all {q.hotspotRegions?.length || 0} hotspot regions.</p>
                      ) : (
                        <p className="text-sm text-red-700 mt-2 font-semibold">
                          ✗ Incorrect. You need to click on all {q.hotspotRegions?.length || 0} hotspot regions.
                        </p>
                      )}
                    </div>
                  </div>
                ) : q.questionType === 'multiple_choice_multiple' ? (
                  <div className="space-y-2 mb-4">
                    {q.options?.map((option, optIndex) => {
                      const isCorrect = q.correctOptionIndices?.includes(optIndex);
                      const isUserAnswer = Array.isArray(q.userAnswerRaw) && q.userAnswerRaw.includes(optIndex);
                      return (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg border-2 flex items-center gap-3 ${
                            isCorrect
                              ? 'bg-green-100 border-green-400'
                              : isUserAnswer && !isCorrect
                              ? 'bg-red-100 border-red-400'
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isUserAnswer}
                            readOnly
                            className={`h-4 w-4 ${
                              isUserAnswer
                                ? isCorrect
                                  ? 'text-green-600 focus:ring-green-500'
                                  : 'text-red-600 focus:ring-red-500'
                                : 'text-gray-400'
                            }`}
                          />
                          <label className={`flex-1 text-gray-900 ${
                            isCorrect ? 'font-bold text-green-700' : ''
                          } ${
                            isUserAnswer && !isCorrect ? 'line-through text-red-700' : ''
                          }`}>
                            <span className="font-semibold mr-2">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            {option}
                          </label>
                          {isCorrect && (
                            <span className="text-green-600 font-bold text-sm">Correct</span>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <span className="text-red-600 font-bold text-sm">Your Answer</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : q.options && q.options.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {q.options.map((option, optIndex) => {
                      const isCorrect = optIndex === q.correctOptionIndex;
                      const isUserAnswer = optIndex === q.userAnswerIndex;
                      return (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg border-2 flex items-center gap-3 ${
                            isCorrect
                              ? 'bg-green-100 border-green-400'
                              : isUserAnswer && !isCorrect
                              ? 'bg-red-100 border-red-400'
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            checked={isUserAnswer}
                            readOnly
                            className={`h-4 w-4 ${
                              isUserAnswer
                                ? isCorrect
                                  ? 'text-green-600 focus:ring-green-500'
                                  : 'text-red-600 focus:ring-red-500'
                                : 'text-gray-400'
                            }`}
                          />
                          <label className={`flex-1 text-gray-900 ${
                            isCorrect ? 'font-bold text-green-700' : ''
                          } ${
                            isUserAnswer && !isCorrect ? 'line-through text-red-700' : ''
                          }`}>
                            <span className="font-semibold mr-2">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            {option}
                          </label>
                          {isCorrect && (
                            <span className="text-green-600 font-bold text-sm flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Correct Answer
                            </span>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <span className="text-red-600 font-bold text-sm flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                              Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-300 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Your Answer:</p>
                    <p className={`text-lg ${q.isCorrect ? 'text-green-700 font-bold' : 'text-gray-900'}`}>
                      {q.userAnswer}
                    </p>
                    {!q.isCorrect && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-sm font-semibold text-green-700 mb-1">Correct Answer:</p>
                        <p className="text-lg text-green-700 font-bold">{q.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-600">Marks: </span>
                    <span className={`font-semibold ${
                      q.marksObtained > 0 ? 'text-green-600' : q.marksObtained < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {q.marksObtained > 0 ? '+' : ''}{q.marksObtained} / {q.marks}
                    </span>
                  </div>
                  {!q.isCorrect && (
                    <div className="text-gray-600">
                      Correct Answer: <span className="font-semibold text-green-600">{q.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

