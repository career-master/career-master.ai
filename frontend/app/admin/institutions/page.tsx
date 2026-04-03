'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';

const TYPE_LABELS: Record<string, string> = {
  school: 'School',
  college: 'College',
  coaching: 'Coaching',
  training_institute: 'Training Institute',
};

export default function AdminInstitutionsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async (pageNumber: number, searchTerm: string) => {
    try {
      setLoading(true);
      const res = await apiService.getInstitutions(pageNumber, 10, searchTerm);
      if (res.success && res.data) {
        const data: any = res.data;
        setItems(Array.isArray(data.items) ? data.items : []);
        setPage(data.page || pageNumber);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load institutions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    if (!user?.roles?.includes('super_admin')) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (!isAuthenticated || !user?.roles?.includes('super_admin')) return;
    load(page, search);
  }, [page, search, load, isAuthenticated, user]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete institution "${name}"? This cannot be undone.`)) return;
    try {
      const res = await apiService.deleteInstitution(id);
      if (res.success) {
        toast.success('Institution deleted');
        await load(page, search);
      } else {
        throw new Error(res.error?.message || 'Failed to delete');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete institution');
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
          <p className="text-sm text-gray-600">
            Register schools, colleges, and training centres. Edit or remove records anytime.
          </p>
        </div>
        <Link
          href="/admin/institutions/new"
          className="rounded-lg bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          + Add institution
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, city, or district…"
          className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No institutions yet.{' '}
            <Link href="/admin/institutions/new" className="font-medium text-red-600 hover:underline">
              Add one
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-900">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-900">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-900">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-900">Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-900">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((row, index) => (
                  <tr key={row._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{(page - 1) * 10 + index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {row.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.logoUrl}
                            alt=""
                            className="h-9 w-9 rounded-md border border-gray-200 object-contain"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
                            —
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{row.institutionName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {TYPE_LABELS[row.institutionType] || row.institutionType || '—'}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-sm text-gray-600">
                      {[row.city, row.district].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="max-w-[180px] px-4 py-3 text-sm text-gray-600">
                      <div className="truncate">{row.adminName || '—'}</div>
                      <div className="truncate text-xs text-gray-500">{row.adminEmail || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        <Link
                          href={`/admin/institutions/new?id=${row._id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(row._id, row.institutionName)}
                          className="text-sm font-medium text-red-600 hover:text-red-800"
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
        )}
      </div>

      {!loading && items.length > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
