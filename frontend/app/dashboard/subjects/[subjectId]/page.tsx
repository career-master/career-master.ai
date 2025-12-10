'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';

type Subject = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
};

type Topic = {
  _id: string;
  subjectId: string;
  title: string;
  description?: string;
  order?: number;
  prerequisites?: string[];
  requiredQuizzesToUnlock?: number;
};

export default function SubjectDetailPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const subjectId = params?.subjectId as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

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
      user.profilePicture,
    ];
    const filled = fields.filter((field) => {
      if (Array.isArray(field)) return field.length > 0;
      return field && String(field).trim().length > 0;
    }).length;
    return Math.round((filled / fields.length) * 100);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && subjectId) {
      loadData();
    }
  }, [isAuthenticated, authLoading, router, subjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, topicsRes] = await Promise.all([
        apiService.getSubjects({ page: 1, limit: 100, isActive: true }),
        apiService.getTopics(subjectId, true),
      ]);

      if (subjectsRes.success && subjectsRes.data?.items) {
        const found = subjectsRes.data.items.find((s: Subject) => s._id === subjectId);
        setSubject(found || null);
        if (found) {
          const userBatches = (user as any)?.batches || [];
          const access =
            !found.batches ||
            (Array.isArray(found.batches) && found.batches.length === 0) ||
            userBatches.some((b: string) => found.batches?.includes(b));
          setHasAccess(access);
        }
      }

      if (topicsRes.success && Array.isArray(topicsRes.data)) {
        setTopics(topicsRes.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to load subject details');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!subject) return;
    if (profileCompletion < 70) {
      toast.error(`Profile completion must be at least 70%. Your profile is ${profileCompletion}% complete. Please complete your profile first.`);
      return;
    }
    try {
      setRequesting(true);
      const res = await apiService.createSubjectRequest({
        subjectId,
        email: (user as any)?.email,
        phone: (user as any)?.phone,
      });
      if (res.success) {
        setRequestSent(true);
        toast.success('Request submitted. Admin will review and grant access.');
      } else {
        toast.error(res.message || 'Failed to submit request');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setRequesting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subject not found</h2>
          <Link href="/dashboard/subjects" className="text-purple-600 hover:underline">
            Back to Subjects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/dashboard/subjects" className="hover:text-purple-600">
            Subjects
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">{subject.title}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{subject.title}</h1>
          {subject.description && (
                <p className="text-lg text-gray-600 mb-4">{subject.description}</p>
          )}
              <div className="flex items-center gap-3 flex-wrap">
            {subject.category && (
                  <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                {subject.category}
              </span>
            )}
            {subject.level && (
                  <span
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium ${
                      subject.level === 'beginner'
                        ? 'bg-green-50 text-green-700'
                        : subject.level === 'intermediate'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {subject.level.charAt(0).toUpperCase() + subject.level.slice(1)} Level
              </span>
            )}
              </div>
            </div>
          </div>
        </div>

        {/* Access status */}
        {!hasAccess && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold mb-1">Access locked</p>
                <p className="text-sm text-yellow-800">
                  You are not assigned to this subject's batches. {profileCompletion < 70 ? 'Complete your profile to request access.' : 'Request access to join the subject.'}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={handleRequestAccess}
                    disabled={requesting || requestSent || profileCompletion < 70}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-60"
                  >
                    {requestSent ? 'Request Sent' : requesting ? 'Submitting...' : 'Request Access'}
                  </button>
                  {profileCompletion < 70 && (
                    <span className="text-xs text-gray-700">
                      Profile completion: {profileCompletion}% (needs at least 70%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Topics Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Topics</h2>
            <p className="text-purple-100 mt-1">
              {topics.length} {topics.length === 1 ? 'topic' : 'topics'} available
            </p>
          </div>

        {topics.length === 0 ? (
            <div className="p-12 text-center">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No topics available</h3>
            <p className="text-gray-600">Topics will be added soon.</p>
          </div>
        ) : (
            <div className="divide-y divide-gray-200">
            {topics.map((topic, index) => (
              <div
                key={topic._id}
                className={`block p-6 transition-colors group ${hasAccess ? 'hover:bg-gray-50' : 'opacity-80'}`}
              >
                  <div className="flex items-start gap-4">
                    {/* Number Badge */}
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
                        {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                            {topic.title}
                          </h3>
                    {topic.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{topic.description}</p>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {topic.prerequisites && topic.prerequisites.length > 0 && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {topic.prerequisites.length} prerequisite{topic.prerequisites.length > 1 ? 's' : ''}
                              </span>
                            )}
                            {topic.requiredQuizzesToUnlock !== undefined && topic.requiredQuizzesToUnlock > 0 && (
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                {topic.requiredQuizzesToUnlock} quiz{topic.requiredQuizzesToUnlock > 1 ? 'zes' : ''} to unlock
                              </span>
                    )}
                  </div>
                        </div>

                        {/* Action */}
                        {hasAccess ? (
                          <Link
                            href={`/dashboard/subjects/${subjectId}/topics/${topic._id}`}
                            className="flex items-center text-purple-600 text-sm font-medium group-hover:text-purple-700"
                          >
                            View
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Locked
                          </div>
                        )}
                      </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
