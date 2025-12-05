'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  thumbnail?: string;
  order?: number;
};

export default function SubjectsPage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subjects & Topics</h1>
          <p className="text-gray-600">Explore subjects and learn at your own pace</p>
        </div>

        {subjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No subjects available</h3>
            <p className="text-gray-600">Check back later for new subjects and topics.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Link
                key={subject._id}
                href={`/dashboard/subjects/${subject._id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 hover:border-purple-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{subject.title}</h3>
                    {subject.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{subject.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
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
                <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
                  View Topics
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

