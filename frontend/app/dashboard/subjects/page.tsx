'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';
import SubjectRequestModal from '@/components/SubjectRequestModal';

type Subject = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  batches?: string[];
  requiresApproval?: boolean;
  order?: number;
};

export default function SubjectsPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      loadSubjects();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const res = await apiService.getSubjects({ page: 1, limit: 100, isActive: true });
      if (res.success && res.data?.items) {
        setSubjects(res.data.items);
      } else {
        toast.error('Failed to load subjects');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  // Calculate profile completion
  const profileCompletion = useMemo(() => {
    if (!user) return 0;
    const fields = [
      user.name,
      user.phone,
      (user as any).profile?.currentStatus,
      (user as any).profile?.college,
      (user as any).profile?.school,
      (user as any).profile?.jobTitle,
      (user as any).profile?.interests?.length > 0,
      (user as any).profile?.learningGoals,
      (user as any).profile?.city,
      (user as any).profile?.country,
      (user as any).profilePicture
    ];
    const filledFields = fields.filter(field => {
      if (Array.isArray(field)) return field.length > 0;
      return field && String(field).trim().length > 0;
    }).length;
    return Math.round((filledFields / fields.length) * 100);
  }, [user]);

  // Filter subjects - show all subjects (including those requiring approval)
  const userBatches = (user as any)?.batches || [];
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || subject.category === filterCategory;
    const matchesLevel = !filterLevel || subject.level === filterLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Check if user has access to a subject
  const hasAccess = (subject: Subject) => {
    // If subject has no batches, it's available to all
    if (!subject.batches || subject.batches.length === 0) {
      return true;
    }
    // Check if user is in one of the subject's batches
    return userBatches.some((b: string) => subject.batches?.includes(b));
  };

  // Check if subject requires approval and user doesn't have access
  const requiresRequest = (subject: Subject) => {
    return subject.requiresApproval && !hasAccess(subject);
  };

  const handleRequestAccess = (subject: Subject, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (profileCompletion < 70) {
      toast.error(`Profile completion must be at least 70%. Your profile is ${profileCompletion}% complete. Please complete your profile first.`);
      return;
    }
    
    setSelectedSubject(subject);
    setRequestModalOpen(true);
  };

  // Group by category
  const groupedByCategory = filteredSubjects.reduce((acc, subject) => {
    const category = subject.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  // Get unique categories and levels for filters
  const categories = Array.from(new Set(subjects.map((s) => s.category).filter(Boolean)));
  const levels = ['beginner', 'intermediate', 'advanced'];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Subjects & Topics</h1>
          <p className="text-lg text-gray-600 mb-6">
            Explore comprehensive learning materials organized by subjects. Master each topic at your own pace.
          </p>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                />
                <svg
                  className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Level Filter */}
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
              >
                <option value="">All Levels</option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Subjects List - Grouped by Category */}
        {filteredSubjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No subjects available</h3>
            <p className="text-gray-600">Check back later for new subjects and topics.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByCategory).map(([category, categorySubjects]) => (
              <div key={category} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {categorySubjects.length} {categorySubjects.length === 1 ? 'subject' : 'subjects'}
                  </span>
                </div>

                {/* Subjects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categorySubjects.map((subject) => {
                    const needsRequest = requiresRequest(subject);
                    const hasSubjectAccess = hasAccess(subject);
                    
                    return (
                    <div
                      key={subject._id}
                      className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
                    >
                      {/* Thumbnail */}
                      <div className="h-40 bg-gradient-to-br from-purple-500 to-blue-500 relative overflow-hidden">
                        {subject.thumbnail ? (
                          <img
                            src={subject.thumbnail}
                            alt={subject.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to gradient if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full flex items-center justify-center">
                                    <svg class="w-16 h-16 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                    </svg>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                          {subject.title}
                        </h3>
                        {subject.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{subject.description}</p>
                        )}

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-4">
                          {subject.level && (
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                subject.level === 'beginner'
                                  ? 'bg-green-100 text-green-700'
                                  : subject.level === 'intermediate'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {subject.level}
                            </span>
                          )}
                        </div>

                        {/* CTA */}
                        {needsRequest ? (
                          <button
                            onClick={(e) => handleRequestAccess(subject, e)}
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                          >
                            Request Access
                          </button>
                        ) : hasSubjectAccess ? (
                          <Link
                            href={`/dashboard/subjects/${subject._id}`}
                            className="flex items-center text-purple-600 text-sm font-medium group-hover:text-purple-700"
                          >
                            View Topics
                            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ) : (
                          <div className="text-sm text-gray-500 italic">
                            Access required
                          </div>
                        )}
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            ))}
          </div>
        )}

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
              loadSubjects();
            }}
          />
        )}
      </div>
    </div>
  );
}
