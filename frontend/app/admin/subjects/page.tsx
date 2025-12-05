'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

type Subject = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  requiresApproval?: boolean;
  order?: number;
  isActive?: boolean;
};

export default function SubjectsListPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin')) {
      router.push('/dashboard');
      return;
    }
    loadSubjects();
  }, [isAuthenticated, user, router]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const res = await apiService.getSubjects({ page: 1, limit: 200 });
      if (res.success && res.data?.items) {
        setSubjects(res.data.items);
      } else if (Array.isArray(res.data)) {
        setSubjects(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject? This will also delete all associated topics, cheatsheets, and quiz sets.')) {
      return;
    }
    try {
      setDeleting(true);
      const res = await apiService.deleteSubject(subjectId);
      if (res.success) {
        await loadSubjects();
      } else {
        alert(res.message || 'Failed to delete subject');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete subject');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
            <p className="text-sm text-gray-600">
              List of subjects. Click “Add Subject” to open the builder for topics, cheatsheets, and quiz sets.
            </p>
          </div>
          <Link
            href="/admin/subjects/new"
            className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            + Add Subject
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <div key={s._id} className="bg-white rounded-xl shadow p-4 space-y-2 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{s.description || 'No description'}</p>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    s.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {s.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>Level: {s.level || 'Not set'}</div>
                <div>Category: {s.category || 'Not set'}</div>
                <div>Order: {s.order ?? 0}</div>
                <div>Requires approval: {s.requiresApproval ? 'Yes' : 'No'}</div>
              </div>
              <div className="pt-2 flex gap-2">
                <Link
                  href={`/admin/subjects/new?subjectId=${s._id}`}
                  className="flex-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-center"
                >
                  Manage topics & quizzes
                </Link>
                <button
                  onClick={() => handleDeleteSubject(s._id)}
                  disabled={deleting}
                  className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {subjects.length === 0 && (
            <div className="bg-white rounded-xl shadow p-4 text-sm text-gray-600">
              No subjects yet. Click “Add Subject” to create one and then add topics, cheatsheets, and quiz sets.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

