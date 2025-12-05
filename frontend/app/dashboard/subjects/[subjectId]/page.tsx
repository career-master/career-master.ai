'use client';

import { useEffect, useState } from 'react';
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
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const subjectId = params?.subjectId as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/subjects"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Subjects
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{subject.title}</h1>
          {subject.description && (
            <p className="text-gray-600">{subject.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            {subject.category && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                {subject.category}
              </span>
            )}
            {subject.level && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                subject.level === 'beginner' ? 'bg-green-100 text-green-700' :
                subject.level === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {subject.level}
              </span>
            )}
          </div>
        </div>

        {/* Topics List */}
        {topics.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No topics available</h3>
            <p className="text-gray-600">Topics will be added soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <Link
                key={topic._id}
                href={`/dashboard/subjects/${subjectId}/topics/${topic._id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 hover:border-purple-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <h3 className="text-xl font-semibold text-gray-900">{topic.title}</h3>
                    </div>
                    {topic.description && (
                      <p className="text-sm text-gray-600 ml-11">{topic.description}</p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
