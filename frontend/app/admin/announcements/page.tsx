'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';

type AnnouncementType = 'update' | 'training' | 'exam' | '';

export default function AdminAnnouncementsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<AnnouncementType>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [error, setError] = useState('');

  const loadAnnouncements = useCallback(
    async (pageNumber: number) => {
      try {
        setLoading(true);
        setError('');

        const res = await apiService.getAnnouncementsAdmin({
          page: pageNumber,
          limit: 10,
          type: filterType || undefined,
          isActive:
            filterStatus === 'all'
              ? undefined
              : filterStatus === 'active'
              ? true
              : false
        });

        if (res.success && res.data) {
          const data: any = res.data;
          setItems(Array.isArray(data.items) ? data.items : []);
          setPage(data.page || pageNumber);
          setTotalPages(data.totalPages || 1);
        } else {
          setItems([]);
          setTotalPages(1);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load announcements');
      } finally {
        setLoading(false);
      }
    },
    [filterType, filterStatus]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin') && !user?.roles?.includes('content_admin') && !user?.roles?.includes('technical_admin')) {
      router.push('/dashboard');
      return;
    }
    loadAnnouncements(1);
  }, [isAuthenticated, user, router, loadAnnouncements]);

  useEffect(() => {
    loadAnnouncements(1);
  }, [filterType, filterStatus, loadAnnouncements]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await apiService.deleteAnnouncement(id);
      if (res.success) {
        await loadAnnouncements(page);
      } else {
        throw new Error(res.error?.message || 'Failed to delete announcement');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Updates & Events</h1>
            <p className="text-gray-600 text-sm">
              Manage homepage quick updates, online trainings, and latest exams.
            </p>
          </div>
          <Link
            href="/admin/announcements/new"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            + Add Announcement
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as AnnouncementType)}
              className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="">All</option>
              <option value="update">Quick Updates</option>
              <option value="training">Online Trainings</option>
              <option value="exam">Latest Exams</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-900 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading announcements...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No announcements found.{' '}
              <Link href="/admin/announcements/new" className="text-red-600 hover:underline">
                Create one
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">S.No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Date Text</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Active</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {(page - 1) * 10 + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {item.title}
                          <div className="text-xs text-gray-500 line-clamp-2">
                            {item.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                          {item.type === 'update'
                            ? 'Quick Update'
                            : item.type === 'training'
                            ? 'Online Training'
                            : 'Exam'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.dateText || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.status || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              item.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.order ?? 0}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/announcements/new?id=${item._id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(item._id, item.title)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => {
                      const newPage = Math.max(1, page - 1);
                      setPage(newPage);
                      loadAnnouncements(newPage);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => {
                      const newPage = Math.min(totalPages, page + 1);
                      setPage(newPage);
                      loadAnnouncements(newPage);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

