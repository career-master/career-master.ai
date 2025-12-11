'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { apiService } from '@/lib/api';
import { useRouter } from 'next/navigation';
import LeaderboardCard from '@/components/LeaderboardCard';
import ComparisonView from '@/components/ComparisonView';
import SubjectRequestModal from '@/components/SubjectRequestModal';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  overview: {
    totalAttempts: number;
    totalQuizzesAttempted: number;
    availableQuizzes: number;
    averageScore: number;
    averagePercentage: number;
    passRate: number;
    accuracy: number;
    questionsPerHour: number;
    bestScore: number;
    worstScore: number;
    improvementTrend: number;
  };
  performance: {
    totalCorrect: number;
    totalIncorrect: number;
    totalUnattempted: number;
    totalMarksObtained: number;
    totalMarksPossible: number;
  };
  charts: {
    dailyPerformance: Array<{ date: string; score: number; attempts: number }>;
    recentAttempts: number;
  };
  recentAttempts: Array<{
    _id: string;
    quizTitle: string;
    marksObtained: number;
    totalMarks: number;
    percentage: number;
    result: string;
    submittedAt: string;
    correctAnswers: number;
    incorrectAnswers: number;
  }>;
}

// Subject Suggestions Component
function SubjectSuggestions({ user }: { user: any }) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        // Fetch more subjects to ensure we have enough after filtering
        const res = await apiService.getSubjects({ page: 1, limit: 20, isActive: true });
        if (res.success && res.data?.items) {
          const userBatches = (user as any)?.batches || [];
          
          // Filter subjects based on user's batches
          const filtered = res.data.items.filter((subject: any) => {
            // Check if subject has no batches assigned (null, undefined, or empty array)
            const hasNoBatches = !subject.batches || 
                                 (Array.isArray(subject.batches) && subject.batches.length === 0);
            
            // Show if no batches assigned (available to all) or user is in one of the batches
            if (hasNoBatches) {
              return true; // Available to everyone
            }
            
            // Check if user is in any of the subject's batches
            if (Array.isArray(subject.batches) && userBatches.length > 0) {
              return userBatches.some((b: string) => subject.batches.includes(b));
            }
            
            return false;
          });
          
          // Show all subjects (including those requiring approval) - let user see what's available
          // But prioritize accessible subjects
          const sorted = filtered.sort((a: any, b: any) => {
            const aUnassigned = !a.batches || (Array.isArray(a.batches) && a.batches.length === 0);
            const bUnassigned = !b.batches || (Array.isArray(b.batches) && b.batches.length === 0);
            const aHasAccess = aUnassigned || userBatches.some((batch: string) => a.batches?.includes(batch));
            const bHasAccess = bUnassigned || userBatches.some((batch: string) => b.batches?.includes(batch));
            
            // Accessible subjects first
            if (aHasAccess && !bHasAccess) return -1;
            if (!aHasAccess && bHasAccess) return 1;
            // Then unassigned
            if (aUnassigned && !bUnassigned) return -1;
            if (!aUnassigned && bUnassigned) return 1;
            return 0;
          });
          
          setSubjects(sorted.slice(0, 4)); // Show max 4
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadSubjects();
    }
  }, [user]);

  // Calculate profile completion - MUST be before early returns (Rules of Hooks)
  const profileCompletion = useMemo(() => {
    if (!user) return 0;
    const fields = [
      user.name,
      user.phone,
      user.profile?.currentStatus,
      user.profile?.college,
      user.profile?.school,
      user.profile?.jobTitle,
      user.profile?.interests?.length > 0,
      user.profile?.learningGoals,
      user.profile?.city,
      user.profile?.country,
      user.profilePicture
    ];
    const filledFields = fields.filter(field => {
      if (Array.isArray(field)) return field.length > 0;
      return field && String(field).trim().length > 0;
    }).length;
    return Math.round((filledFields / fields.length) * 100);
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600 mb-2">No subjects available yet</p>
        <Link href="/dashboard/subjects" className="text-purple-600 hover:underline text-sm font-medium">
          Browse All Subjects
        </Link>
      </div>
    );
  }

  // Check if user has access
  const hasAccess = (subject: any) => {
    const userBatches = (user as any)?.batches || [];
    if (!subject.batches || subject.batches.length === 0) return true;
    return userBatches.some((b: string) => subject.batches?.includes(b));
  };

  const requiresRequest = (subject: any) => {
    return subject.requiresApproval && !hasAccess(subject);
  };

  const handleRequestAccess = (subject: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (profileCompletion < 70) {
      toast.error(`Profile completion must be at least 70%. Your profile is ${profileCompletion}% complete. Please complete your profile first.`);
      return;
    }
    
    setSelectedSubject(subject);
    setRequestModalOpen(true);
  };

  const colors = [
    { bg: 'bg-purple-500', border: 'border-purple-500' },
    { bg: 'bg-green-500', border: 'border-green-500' },
    { bg: 'bg-blue-500', border: 'border-blue-500' },
    { bg: 'bg-yellow-500', border: 'border-yellow-500' },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject, index) => {
          const color = colors[index % colors.length];
          const needsRequest = requiresRequest(subject);
          const hasSubjectAccess = hasAccess(subject);
          
          return (
            <div
              key={subject._id}
              className={`bg-white rounded-xl shadow-lg p-5 border-l-4 ${color.border} relative overflow-hidden hover:shadow-xl transition-all ${needsRequest ? '' : 'cursor-pointer'}`}
              onClick={needsRequest ? undefined : () => router.push(`/dashboard/subjects/${subject._id}`)}
            >
            <div className="absolute top-3 -right-8 bg-gradient-to-r from-[#0dcaf0] to-[#6f42c1] text-white text-xs px-8 py-1.5 transform rotate-45 shadow-lg font-bold">
              AI RECOMMENDED
            </div>
            <div className="flex items-start gap-4 mb-3">
              {subject.thumbnail ? (
                <img
                  src={subject.thumbnail}
                  alt={subject.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className={`w-16 h-16 ${color.bg} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h6 className="font-bold mb-1 text-gray-900 text-base">{subject.title}</h6>
                <p className="text-gray-600 text-sm line-clamp-2">{subject.description || 'Explore this subject to enhance your learning'}</p>
                <div className="flex items-center gap-2 mt-2">
                  {subject.level && (
                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold capitalize">
                      {subject.level}
                    </span>
                  )}
                  {subject.category && (
                    <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                      {subject.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {needsRequest ? (
              <button
                onClick={(e) => handleRequestAccess(subject, e)}
                className="w-full mt-3 bg-gradient-to-r from-[#0dcaf0] to-[#6f42c1] text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all transform hover:scale-105"
              >
                Request Access
              </button>
            ) : (
              <button
                onClick={() => router.push(`/dashboard/subjects/${subject._id}`)}
                className="w-full mt-3 bg-gradient-to-r from-[#0dcaf0] to-[#6f42c1] text-white px-4 py-2 rounded-lg text-sm font-bold hover:shadow-lg transition-all transform hover:scale-105"
              >
                Explore Subject
              </button>
            )}
          </div>
        );
      })}
    </div>

    {/* Request Access Modal */}
    {selectedSubject && (
      <SubjectRequestModal
        isOpen={requestModalOpen}
        onClose={() => {
          setRequestModalOpen(false);
          setSelectedSubject(null);
        }}
        subject={selectedSubject}
        user={user as any}
        onSuccess={() => {
          // Reload subjects
          const loadSubjects = async () => {
            try {
              const res = await apiService.getSubjects({ page: 1, limit: 20, isActive: true });
              if (res.success && res.data?.items) {
                const userBatches = (user as any)?.batches || [];
                const filtered = res.data.items.filter((subject: any) => {
                  const hasNoBatches = !subject.batches || 
                                       (Array.isArray(subject.batches) && subject.batches.length === 0);
                  if (hasNoBatches) return true;
                  if (Array.isArray(subject.batches) && userBatches.length > 0) {
                    return userBatches.some((b: string) => subject.batches.includes(b));
                  }
                  return false;
                });
                const sorted = filtered.sort((a: any, b: any) => {
                  const aUnassigned = !a.batches || (Array.isArray(a.batches) && a.batches.length === 0);
                  const bUnassigned = !b.batches || (Array.isArray(b.batches) && b.batches.length === 0);
                  const aHasAccess = aUnassigned || userBatches.some((batch: string) => a.batches?.includes(batch));
                  const bHasAccess = bUnassigned || userBatches.some((batch: string) => b.batches?.includes(batch));
                  if (aHasAccess && !bHasAccess) return -1;
                  if (!aHasAccess && bHasAccess) return 1;
                  if (aUnassigned && !bUnassigned) return -1;
                  if (!aUnassigned && bUnassigned) return 1;
                  return 0;
                });
                setSubjects(sorted.slice(0, 4));
              }
            } catch (err) {
              console.error('Failed to reload subjects:', err);
            }
          };
          loadSubjects();
        }}
      />
    )}
    </>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const res = await apiService.getUserDashboardStats();
        if (res.success && res.data) {
          setStats(res.data as DashboardStats);
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user]);

  // Initialize chart with dynamic data
  useEffect(() => {
    if (!stats || !chartRef.current) return;

    if (typeof window !== 'undefined') {
      // @ts-ignore - Chart.js dynamic import
      import('chart.js/auto').then((ChartModule: any) => {
        const Chart = ChartModule.default || ChartModule;
        const ctx = chartRef.current?.getContext('2d');
        
        // Destroy existing chart if it exists
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
        }
        
        if (ctx && Chart) {
          const labels = stats.charts.dailyPerformance.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
          });
          const scores = stats.charts.dailyPerformance.map(d => d.score);
          const attempts = stats.charts.dailyPerformance.map(d => d.attempts);

          chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [
                {
                  label: 'Average Score (%)',
                  data: scores,
                  borderColor: '#6f42c1',
                  backgroundColor: 'rgba(111, 66, 193, 0.1)',
                  tension: 0.4,
                  fill: true,
                },
                {
                  label: 'Attempts',
                  data: attempts.map(a => a * 10), // Scale for visibility
                  borderColor: '#20c997',
                  backgroundColor: 'rgba(32, 201, 151, 0.1)',
                  tension: 0.4,
                  fill: true,
                  yAxisID: 'y1',
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                  labels: {
                    color: '#374151',
                    font: {
                      size: 12,
                    },
                  },
                },
                title: {
                  display: true,
                  text: 'Performance Tracking (Last 7 Days)',
                  color: '#1f2937',
                  font: {
                    size: 16,
                    weight: 'bold',
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: '#6b7280',
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: {
                    color: '#6b7280',
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                y1: {
                  type: 'linear',
                  display: false,
                  position: 'right',
                },
              },
            },
          });
        }
      });
    }
    
    // Cleanup function to destroy chart on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [stats]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header */}
      <header className="bg-gradient-to-r from-[#6f42c1] to-[#e83e8c] text-white py-4 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">CAREERMASTER.AI</h2>
              <span className="bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#8a6d00] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                AI PREMIUM
              </span>
            </div>
              <div className="flex items-center gap-3 relative">
              {/* Quick actions */}
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors backdrop-blur-sm"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/reports"
                  className="px-3 py-2 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors backdrop-blur-sm"
                >
                  Reports
                </Link>
                <Link
                  href="/dashboard/subjects"
                  className="px-3 py-2 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors backdrop-blur-sm"
                >
                  Subjects
                </Link>
              </div>
              {/* Profile dropdown */}
              <div
                className="relative"
                ref={profileRef}
              >
                <button
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors backdrop-blur-sm relative z-20"
                  onClick={() => setProfileOpen((prev) => !prev)}
                >
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">{user?.name || user?.email?.split('@')[0] || 'User'}</span>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                {profileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-40"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Link href="/dashboard/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    <hr className="my-2" />
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 my-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-4 sticky top-4 border border-gray-100">
              <div className="text-center mb-5">
                <div className="w-20 h-20 bg-gradient-to-r from-[#6f42c1] to-[#e83e8c] rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h5 className="font-bold text-lg text-gray-900 mb-1">{user?.name || 'User'}</h5>
                <p className="text-gray-600 text-sm mb-2 font-medium">Student</p>
                <span className="bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#8a6d00] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  AI PREMIUM
                </span>
              </div>

              <div className="mb-5">
                <h6 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">AI Learning Profile</h6>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Average Score</span>
                    <span className="text-sm font-bold text-gray-900">
                      {loading ? '...' : stats ? `${stats.overview.averagePercentage.toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: loading ? '0%' : stats ? `${Math.min(stats.overview.averagePercentage, 100)}%` : '0%' }}
                    ></div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Accuracy</span>
                    <span className="text-sm font-bold text-gray-900">
                      {loading ? '...' : stats ? `${stats.overview.accuracy.toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: loading ? '0%' : stats ? `${Math.min(stats.overview.accuracy, 100)}%` : '0%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Pass Rate</span>
                    <span className="text-sm font-bold text-gray-900">
                      {loading ? '...' : stats ? `${stats.overview.passRate.toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full" 
                      style={{ width: loading ? '0%' : stats ? `${Math.min(stats.overview.passRate, 100)}%` : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <h6 className="font-bold mb-4 text-gray-900 text-sm uppercase tracking-wide">Quiz Statistics</h6>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Total Attempts</span>
                    <span className="text-sm font-bold text-gray-900">
                      {loading ? '...' : stats ? stats.overview.totalAttempts : 0}
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Quizzes Attempted</span>
                    <span className="text-sm font-bold text-gray-900">
                      {loading ? '...' : stats ? stats.overview.totalQuizzesAttempted : 0}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Available Quizzes</span>
                    <span className="text-sm font-bold text-gray-900">
                      {loading ? '...' : stats ? stats.overview.availableQuizzes : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h6 className="font-bold mb-3 text-gray-900 text-sm uppercase tracking-wide">AI Features</h6>
                <div className="flex flex-wrap gap-2">
                  {['AI Mentor', 'Adaptive Learning', 'Smart Analytics', 'Instant Feedback'].map((feature) => (
                    <span key={feature} className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-purple-200">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 mb-4">
              <h6 className="font-bold mb-3">Quick Actions</h6>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: 'robot', label: 'AI Mentor' },
                  { icon: 'brain', label: 'Adaptive Test' },
                  { icon: 'bolt', label: 'Quick Quiz' },
                  { icon: 'chart', label: 'Progress' },
                  { icon: 'report', label: 'Reports', link: '/dashboard/reports' },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => action.link && router.push(action.link)}
                    className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all"
                  >
                    <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {action.icon === 'robot' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      )}
                      {action.icon === 'brain' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      )}
                      {action.icon === 'bolt' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      )}
                      {action.icon === 'chart' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      )}
                    </svg>
                    <div className="text-xs font-medium">{action.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard Card */}
            <LeaderboardCard />

            {/* Comparison View */}
            <ComparisonView />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* AI Mentor Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-4 border-l-4 border-purple-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 opacity-50 rounded-bl-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="md:col-span-2">
                  <h4 className="text-2xl font-bold mb-3 flex items-center gap-2 text-gray-900">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Your AI Learning Assistant
                  </h4>
                  <p className="text-gray-700 mb-4 text-base leading-relaxed">
                    Based on your performance, I've identified areas for improvement and created a personalized study plan.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Algebra Focus', 'Physics Practice', 'Speed Training'].map((tag) => (
                      <span key={tag} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold border border-purple-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="bg-gradient-to-r from-[#0dcaf0] to-[#6f42c1] text-white px-6 py-3 rounded-lg font-bold hover:shadow-xl transition-all transform hover:scale-105">
                    Chat with AI Mentor
                  </button>
                </div>
                <div className="text-center flex flex-col items-center justify-center">
                  <div className="w-28 h-28 bg-gradient-to-r from-[#6f42c1] to-[#e83e8c] rounded-full flex items-center justify-center mb-3 shadow-lg">
                    <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">AI Mentor v2.5</p>
                  <small className="text-green-600 font-semibold">Active now</small>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {[
                { 
                  title: 'Average Score', 
                  value: loading ? '...' : stats ? `${stats.overview.averagePercentage.toFixed(1)}%` : '0%', 
                  change: stats && stats.overview.averagePercentage > 0 ? 'Your average' : 'No attempts yet', 
                  icon: 'bullseye', 
                  color: 'purple', 
                  bgColor: 'bg-purple-500', 
                  borderColor: 'border-purple-500' 
                },
                { 
                  title: 'Questions/Hour', 
                  value: loading ? '...' : stats ? `${stats.overview.questionsPerHour.toFixed(0)} Q/Hr` : '0 Q/Hr', 
                  change: stats && stats.overview.questionsPerHour > 0 ? 'Your speed' : 'No data', 
                  icon: 'tachometer', 
                  color: 'green', 
                  bgColor: 'bg-green-500', 
                  borderColor: 'border-green-500' 
                },
                { 
                  title: 'Accuracy Rate', 
                  value: loading ? '...' : stats ? `${stats.overview.accuracy.toFixed(1)}%` : '0%', 
                  change: stats && stats.performance.totalCorrect > 0 ? `${stats.performance.totalCorrect} correct` : 'No attempts', 
                  icon: 'seedling', 
                  color: 'blue', 
                  bgColor: 'bg-blue-500', 
                  borderColor: 'border-blue-500' 
                },
                { 
                  title: 'Pass Rate', 
                  value: loading ? '...' : stats ? `${stats.overview.passRate.toFixed(1)}%` : '0%', 
                  change: stats && stats.overview.totalAttempts > 0 ? `${stats.overview.totalAttempts} attempts` : 'Start quiz', 
                  icon: 'trophy', 
                  color: 'yellow', 
                  bgColor: 'bg-yellow-500', 
                  borderColor: 'border-yellow-500' 
                },
              ].map((stat) => (
                <div key={stat.title} className={`bg-white rounded-xl shadow-lg p-5 border-t-4 ${stat.borderColor} hover:shadow-xl transition-all`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h6 className="text-gray-600 text-xs mb-2 font-semibold uppercase tracking-wide">{stat.title}</h6>
                      <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        {stat.icon === 'bullseye' && (
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        )}
                        {stat.icon === 'tachometer' && (
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        )}
                        {stat.icon === 'seedling' && (
                          <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm9 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                        )}
                        {stat.icon === 'trophy' && (
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        )}
                      </svg>
                    </div>
                  </div>
                  <small className="text-green-600 text-xs">
                    <svg className="w-3 h-3 inline" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {stat.change}
                  </small>
                </div>
              ))}
            </div>

            {/* Best AI Recommended Courses */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xl font-bold text-gray-900">Best AI Recommended Courses for You</h4>
                  <Link href="/dashboard/subjects" className="text-sm text-purple-600 hover:underline font-semibold">
                    View All
                  </Link>
                </div>
                <SubjectSuggestions user={user} />
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <h5 className="font-bold mb-3 text-gray-900 text-lg">Performance Summary</h5>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  </div>
                ) : stats ? (
                  <>
                    <p className="text-gray-700 text-sm mb-4 font-medium">
                      Based on {stats.overview.totalAttempts} {stats.overview.totalAttempts === 1 ? 'attempt' : 'attempts'} and {stats.performance.totalCorrect + stats.performance.totalIncorrect + stats.performance.totalUnattempted} questions
                    </p>
                    {[
                      { 
                        label: 'Best Score', 
                        value: stats.overview.bestScore, 
                        color: 'green', 
                        bgColor: 'bg-green-500' 
                      },
                      { 
                        label: 'Average Score', 
                        value: stats.overview.averagePercentage, 
                        color: 'blue', 
                        bgColor: 'bg-blue-500' 
                      },
                      { 
                        label: 'Worst Score', 
                        value: stats.overview.worstScore, 
                        color: 'red', 
                        bgColor: 'bg-red-500' 
                      },
                    ].map((item) => (
                      <div key={item.label} className="mb-4">
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-gray-800 font-semibold">{item.label}</span>
                          <span className="font-bold text-gray-900 text-base">{item.value.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full ${item.bgColor} rounded-full shadow-sm`} style={{ width: `${Math.min(item.value, 100)}%` }}></div>
                        </div>
                      </div>
                    ))}
                    {stats.overview.improvementTrend !== 0 && (
                      <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="flex items-center gap-2">
                          {stats.overview.improvementTrend > 0 ? (
                            <>
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-semibold text-green-600">
                                Improving by {Math.abs(stats.overview.improvementTrend).toFixed(1)}%
                              </span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-semibold text-red-600">
                                Needs improvement: {Math.abs(stats.overview.improvementTrend).toFixed(1)}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={() => router.push('/dashboard/quizzes')}
                      className="w-full mt-4 border-2 border-purple-600 text-purple-600 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-purple-50 transition-all"
                    >
                      View All Quizzes
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-2">No performance data yet</p>
                    <button
                      onClick={() => router.push('/dashboard/quizzes')}
                      className="text-purple-600 hover:underline text-sm font-medium"
                    >
                      Start Your First Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>


            {/* Adaptive Learning Path & Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl shadow-md p-5">
                <h5 className="font-bold mb-3 text-gray-900">Your Adaptive Learning Path</h5>
                <p className="text-gray-600 text-sm mb-3">AI-generated personalized learning journey</p>
                {[
                  { title: 'Quadratic Equations', desc: 'Master the fundamentals', time: '45 min', status: 'current' },
                  { title: 'Trigonometry Basics', desc: 'Build on previous concepts', time: '60 min', status: 'pending' },
                  { title: 'Advanced Algebra', desc: 'Complex problem solving', time: '90 min', status: 'pending' },
                  { title: 'Basic Arithmetic', desc: 'Completed 2 days ago', time: '100%', status: 'completed' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`flex items-center gap-3 p-3 mb-2 rounded-lg border-l-4 ${
                      item.status === 'current'
                        ? 'border-green-500 bg-green-50'
                        : item.status === 'completed'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-300 bg-gray-50'
                    } hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.status === 'current'
                          ? 'bg-green-500 text-white'
                          : item.status === 'completed'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {item.status === 'current' && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      )}
                      {item.status === 'completed' && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {item.status === 'pending' && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h6 className="font-semibold text-sm text-gray-900">{item.title}</h6>
                      <small className="text-gray-600 text-xs">{item.desc}</small>
                    </div>
                    <div className="text-right">
                      <small className="text-gray-600 text-xs font-medium">{item.time}</small>
                    </div>
                  </div>
                ))}
                <button className="w-full mt-3 bg-gradient-to-r from-[#0dcaf0] to-[#6f42c1] text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow">
                  Continue Learning Path
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md p-5">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-bold text-gray-900">AI Performance Analytics</h5>
                  <div className="flex gap-1">
                    {['7 Days', '30 Days', '90 Days'].map((period) => (
                      <button
                        key={period}
                        className="px-2 py-1 text-xs border border-purple-600 text-purple-600 rounded hover:bg-purple-50 transition-colors"
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                {loading ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <p className="text-gray-600 mt-2 text-sm">Loading chart...</p>
                    </div>
                  </div>
                ) : stats && stats.charts.dailyPerformance.length > 0 ? (
                  <div className="h-[250px]">
                    <canvas ref={chartRef}></canvas>
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center">
                    <p className="text-gray-600 text-sm">No performance data yet. Start taking quizzes to see your progress!</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Predictions & Recent Tests */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-pink-500">
                <h5 className="font-bold mb-3 text-gray-900">Performance Overview</h5>
                <p className="text-gray-600 text-sm mb-4">Based on your quiz attempts</p>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  </div>
                ) : stats ? (
                  <>
                    {[
                      { label: 'Average Score', value: stats.overview.averagePercentage },
                      { label: 'Accuracy Rate', value: stats.overview.accuracy },
                      { label: 'Pass Rate', value: stats.overview.passRate },
                    ].map((pred) => (
                      <div key={pred.label} className="mb-4">
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="text-gray-700 font-medium">{pred.label}</span>
                          <span className="font-bold text-gray-900">{pred.value.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#0dcaf0] to-[#6f42c1] rounded-full transition-all duration-1500"
                            style={{ width: `${Math.min(pred.value, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => router.push('/dashboard/quizzes')}
                      className="w-full mt-3 border border-purple-600 text-purple-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors"
                    >
                      Take More Quizzes
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-2">No data available</p>
                    <button
                      onClick={() => router.push('/dashboard/quizzes')}
                      className="text-purple-600 hover:underline text-sm font-medium"
                    >
                      Start Your First Quiz
                    </button>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 bg-white rounded-xl shadow-md p-5">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-bold text-gray-900">Recent Quiz Attempts</h5>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => router.push('/dashboard/reports')}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      View Reports
                    </button>
                    <button 
                      onClick={() => router.push('/dashboard/quizzes')}
                      className="text-sm text-purple-600 hover:underline font-medium"
                    >
                      View All
                    </button>
                  </div>
                </div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <p className="text-gray-600 mt-2">Loading attempts...</p>
                  </div>
                ) : stats && stats.recentAttempts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-sm font-semibold text-gray-900">Quiz</th>
                          <th className="text-left py-2 text-sm font-semibold text-gray-900">Score</th>
                          <th className="text-left py-2 text-sm font-semibold text-gray-900">Marks</th>
                          <th className="text-left py-2 text-sm font-semibold text-gray-900">Result</th>
                          <th className="text-left py-2 text-sm font-semibold text-gray-900">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentAttempts.map((attempt) => {
                          const feedback = attempt.percentage >= 80 ? 'Excellent' : 
                                         attempt.percentage >= 70 ? 'Good Progress' : 
                                         attempt.percentage >= 50 ? 'Needs Practice' : 'Focus Area';
                          return (
                            <tr key={attempt._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="py-3 text-sm text-gray-900 font-medium">{attempt.quizTitle}</td>
                              <td className="py-3">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  attempt.percentage >= 80 ? 'bg-green-100 text-green-700' : 
                                  attempt.percentage >= 70 ? 'bg-yellow-100 text-yellow-700' : 
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {attempt.percentage.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-3 text-sm text-gray-700">
                                {attempt.marksObtained} / {attempt.totalMarks}
                              </td>
                              <td className="py-3">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  attempt.result === 'pass' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {attempt.result.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-3 text-sm text-gray-600">
                                {new Date(attempt.submittedAt).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No quiz attempts yet</p>
                    <button
                      onClick={() => router.push('/dashboard/quizzes')}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      Start Your First Quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#0dcaf0] to-[#6f42c1] rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 transition-transform z-50">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
    </div>
  );
}

